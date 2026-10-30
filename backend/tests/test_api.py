from fastapi.testclient import TestClient

from main import app


def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["status"] == "ok"


def test_sample_api_routes_and_error_envelope():
    with TestClient(app) as client:
        dashboard = client.get("/api/dashboard")
        traffic_map = client.get("/api/traffic/map?status=moderate")
        map_without_offline = client.get("/api/traffic/map?include_offline=false")
        prediction_feed = client.get("/api/traffic/predictions?horizon_minutes=15")
        clients = client.get("/api/federated/clients")
        prediction = client.post(
            "/api/traffic/predict",
            json={"current_flow": 90, "horizon_minutes": 10},
        )
        federated_status = client.get("/api/federated/status")
        federated_rounds = client.get("/api/federated/rounds")
        communication = client.get("/api/communication-cost")
        communication_rounds = client.get("/api/communication-cost/rounds")
        comparison = client.get("/api/model-comparison")
        congestion = client.get("/api/congestion")
        route = client.post(
            "/api/emergency-route",
            json={"origin": "Chandigarh", "destination": "Zirakpur"},
        )
        invalid_route = client.post(
            "/api/emergency-route",
            json={"origin": "Unknown", "destination": "Zirakpur"},
        )
        invalid_start = client.post(
            "/api/federated/start",
            json={"rounds": 1, "client_ids": ["unknown-client"]},
        )
        stop = client.post("/api/federated/stop")

    assert dashboard.status_code == 200 and dashboard.json()["success"] is True
    assert traffic_map.status_code == 200
    assert all(node["status"] == "moderate" for node in traffic_map.json()["data"]["nodes"])
    assert map_without_offline.json()["data"]["nodes"] == []
    assert all(
        node["client_status"] == "Configured" and node["online"] is False
        for node in traffic_map.json()["data"]["nodes"]
    )
    assert all(
        item["status"] in {
            "configured",
            "waiting",
            "training",
            "completed",
            "stopped",
            "failed",
        }
        and item["execution_mode"] == "local_demo"
        for item in clients.json()["data"]["clients"]
    )
    assert prediction.status_code == 200
    assert prediction.json()["data"]["horizon_minutes"] == 10
    assert prediction_feed.status_code == 200
    assert prediction_feed.json()["data"]["predictions"][0]["horizon_minutes"] == 15
    assert federated_status.json()["data"]["status"] in {
        "IDLE",
        "TRAINING",
        "STOPPING",
        "STOPPED",
        "COMPLETED",
        "FAILED",
    }
    assert federated_rounds.json()["data"]["total_rounds"] == len(
        federated_rounds.json()["data"]["rounds"]
    )
    assert communication.json()["success"] is True
    assert communication_rounds.json()["data"]["total_rounds"] == len(
        communication_rounds.json()["data"]["rounds"]
    )
    assert comparison.status_code == 200
    assert congestion.status_code == 200
    assert route.json()["data"]["data_source"] == "sample"
    assert invalid_route.status_code == 422
    assert invalid_route.json()["success"] is False
    assert invalid_start.status_code == 422
    assert stop.status_code == 200
