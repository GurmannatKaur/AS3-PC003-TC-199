from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


class EmergencyRouteRequest(BaseModel):
    origin: str = Field(min_length=2)
    destination: str = Field(min_length=2)


SAMPLE_ROUTES = {
    ("chandigarh", "zirakpur"): {
        "distance_km": 12.5,
        "estimated_time_minutes": 25,
        "traffic_level": "Moderate",
        "route": [
            "Chandigarh",
            "Airport Road",
            "Zirakpur",
        ],
    },
    ("zirakpur", "chandigarh"): {
        "distance_km": 12.5,
        "estimated_time_minutes": 25,
        "traffic_level": "Moderate",
        "route": [
            "Zirakpur",
            "Airport Road",
            "Chandigarh",
        ],
    },
}


@router.post("")
def get_emergency_route(request: EmergencyRouteRequest):
    origin = request.origin.strip()
    destination = request.destination.strip()

    route_key = (
        origin.lower(),
        destination.lower(),
    )

    route_data = SAMPLE_ROUTES.get(route_key)

    if route_data is None:
        raise HTTPException(
            status_code=422,
            detail="No sample route is available for this origin and destination.",
        )

    return {
        "origin": origin,
        "destination": destination,
        **route_data,
        "data_source": "sample",
        "is_live": False,
        "emergency_service_connected": False,
        "notice": (
            "This is a prototype route-support feature. "
            "It is not connected to live traffic or emergency dispatch services."
        ),
    }