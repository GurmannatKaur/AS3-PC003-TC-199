from fastapi.testclient import TestClient

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
    assert data["data_source"] == "Sample calculation"
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


def test_federated_controls_disclose_configuration_only_behavior():
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
        current = client.get("/api/federated/status")
        stopped = client.post("/api/federated/stop")

    started_data = started.json()["data"]
    assert started.status_code == 200
    assert started_data["status"] == "CONFIGURED"
    assert "no model training has run" in started_data["note"]
    assert current.json()["data"]["data_source"] == "Training service is not connected"
    assert stopped.json()["data"]["status"] == "IDLE"
