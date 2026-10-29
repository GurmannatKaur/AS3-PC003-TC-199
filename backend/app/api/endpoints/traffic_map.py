from fastapi import APIRouter, Query

router = APIRouter()


SAMPLE_TRAFFIC_NODES = [
    {
        "id": "client_01",
        "name": "Chandigarh Sector 17",
        "latitude": 30.7415,
        "longitude": 76.7681,
        "traffic_level": "High",
        "vehicle_count": 850,
        "average_speed": 18,
        "client_status": "Online",
    },
    {
        "id": "client_02",
        "name": "Zirakpur",
        "latitude": 30.6425,
        "longitude": 76.8173,
        "traffic_level": "Moderate",
        "vehicle_count": 520,
        "average_speed": 35,
        "client_status": "Online",
    },
    {
        "id": "client_03",
        "name": "Mohali Phase 7",
        "latitude": 30.7046,
        "longitude": 76.7179,
        "traffic_level": "Low",
        "vehicle_count": 240,
        "average_speed": 48,
        "client_status": "Online",
    },
    {
        "id": "client_04",
        "name": "Chandigarh Airport Road",
        "latitude": 30.6735,
        "longitude": 76.8015,
        "traffic_level": "High",
        "vehicle_count": 910,
        "average_speed": 15,
        "client_status": "Offline",
    },
]


@router.get("/map")
def get_traffic_map(
    traffic_level: str | None = Query(default=None),
    include_offline: bool = Query(default=True),
):
    nodes = SAMPLE_TRAFFIC_NODES.copy()

    if traffic_level:
        nodes = [
            node
            for node in nodes
            if node["traffic_level"].lower() == traffic_level.lower()
        ]

    if not include_offline:
        nodes = [
            node
            for node in nodes
            if node["client_status"] == "Online"
        ]

    return {
        "nodes": nodes,
        "total_nodes": len(nodes),
        "data_source": "Synthetic sample data",
        "is_live": False,
    }