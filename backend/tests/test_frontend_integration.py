from fastapi.testclient import TestClient
import math
import time
from threading import Event

from app.core.config import settings
from main import app


def test_vite_origins_are_allowed_by_cors():
    with TestClient(app) as client:
        for origin in (
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ):
            response = client.options(
                "/api/dashboard",
                headers={
                    "Origin": origin,
                    "Access-Control-Request-Method": "GET",
                },
            )
            assert response.status_code == 200
            assert response.headers["access-control-allow-origin"] == origin


def test_prediction_fallback_is_explicit_when_model_artifacts_are_absent(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(settings, "model_dir", tmp_path)

    with TestClient(app) as client:
        response = client.post(
            "/api/traffic/predict",
            json={
                "location": "Sample location",
                "current_flow": 90,
                "vehicle_count": 40,
                "average_speed": 25,
                "horizon_minutes": 10,
            },
        )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["predicted_flow"] == 81
    assert data["data_source"] == "Rule-based baseline calculation"
    assert data["is_model_prediction"] is False


def test_prediction_rejects_incomplete_model_artifacts(tmp_path, monkeypatch):
    model_directory = tmp_path / "federated"
    model_directory.mkdir()
    (model_directory / "global.pt").write_bytes(b"weights")
    monkeypatch.setattr(settings, "model_dir", tmp_path)

    with TestClient(app) as client:
        response = client.post(
            "/api/traffic/predict",
            json={"current_flow": 90, "horizon_minutes": 10},
        )

    assert response.status_code == 503
    assert response.json()["success"] is False


def test_federated_controls_execute_training_and_report_results():
    with TestClient(app) as client:
        started = client.post(
            "/api/federated/start",
            json={
                "rounds": 2,
                "local_epochs": 1,
                "learning_rate": 0.001,
                "num_clients": 2,
            },
        )
        assert started.status_code == 200
        assert started.json()["data"]["status"] in {"TRAINING", "COMPLETED"}

        deadline = time.monotonic() + 60
        status_data = None
        while time.monotonic() < deadline:
            response = client.get("/api/federated/status")
            assert response.status_code == 200
            status_data = response.json()["data"]
            if status_data["status"] in {"COMPLETED", "FAILED", "STOPPED"}:
                break
            time.sleep(0.1)

        rounds = client.get("/api/federated/rounds").json()["data"]
        communication = client.get("/api/communication-cost").json()["data"]
        communication_rounds = client.get(
            "/api/communication-cost/rounds"
        ).json()["data"]
        clients = client.get("/api/federated/clients").json()["data"]

    assert status_data is not None
    assert status_data["status"] == "COMPLETED"
    assert status_data["completed_rounds"] == [1, 2]
    assert status_data["global_model_version"] == "v2"
    assert status_data["model_trained"] is True
    assert status_data["metrics_source"] == (
        "global_model_predictions_on_holdout_partitions"
    )
    assert status_data["evaluation_samples"] > 0
    assert status_data["training_duration_seconds"] > 0
    metrics = status_data["model_metrics"]
    assert all(
        math.isfinite(metrics[key])
        for key in ("mae", "mse", "rmse", "r2")
    )
    assert len(rounds["rounds"]) == 2
    assert [item["round"] for item in rounds["rounds"]] == [1, 2]
    assert all(
        item["metrics"]["evaluation_samples"] > 0
        and item["total_samples"] > 0
        for item in rounds["rounds"]
    )
    assert communication["total_rounds"] == 2
    assert communication_rounds["total_rounds"] == 2
    assert all(
        record["upload_bytes"] > 0 and record["download_bytes"] > 0
        for record in communication_rounds["rounds"]
    )
    assert all(
        client["status"] == "completed"
        and client["last_completed_round"] == 2
        for client in clients["clients"]
    )


def test_federated_training_rejects_excessive_workload():
    with TestClient(app) as client:
        response = client.post(
            "/api/federated/start",
            json={
                "rounds": 100,
                "local_epochs": 50,
                "learning_rate": 0.001,
                "num_clients": 100,
            },
        )

    assert response.status_code == 422
    assert response.json()["success"] is False


def test_federated_start_is_idempotently_rejected_and_stop_is_safe(monkeypatch):
    from ml.federated import trainer_lifecycle

    client_training_started = Event()
    continue_training = Event()
    original_train_client = trainer_lifecycle.train_client

    def blocked_train_client(**kwargs):
        client_training_started.set()
        continue_training.wait(timeout=10)
        return original_train_client(**kwargs)

    monkeypatch.setattr(
        trainer_lifecycle,
        "train_client",
        blocked_train_client,
    )
    try:
        with TestClient(app) as client:
            started = client.post(
                "/api/federated/start",
                json={
                    "rounds": 5,
                    "local_epochs": 1,
                    "learning_rate": 0.001,
                    "num_clients": 2,
                },
            )
            assert started.status_code == 200
            assert client_training_started.wait(timeout=10)

            repeated = client.post(
                "/api/federated/start",
                json={
                    "rounds": 1,
                    "local_epochs": 1,
                    "learning_rate": 0.001,
                    "num_clients": 2,
                },
            )
            assert repeated.status_code == 409

            stop_response = client.post("/api/federated/stop")
            assert stop_response.status_code == 200
            assert stop_response.json()["data"]["status"] == "STOPPING"
            continue_training.set()

            deadline = time.monotonic() + 10
            status_data = None
            while time.monotonic() < deadline:
                status_data = client.get("/api/federated/status").json()["data"]
                if status_data["status"] in {"STOPPED", "FAILED"}:
                    break
                time.sleep(0.05)
    finally:
        continue_training.set()

    assert status_data is not None
    assert status_data["status"] == "STOPPED"
