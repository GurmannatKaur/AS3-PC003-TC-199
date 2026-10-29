from typing import Optional


# Sample routes for development.
# These are not live traffic or emergency-dispatch routes.

SAMPLE_ROUTES = {
    ("Chandigarh", "Zirakpur"): {
        "route_name": "Chandigarh to Zirakpur",
        "distance_km": 12.5,
        "estimated_time_minutes": 25,
        "traffic_level": "Moderate",
        "is_live": False,
    },
    ("Zirakpur", "Chandigarh"): {
        "route_name": "Zirakpur to Chandigarh",
        "distance_km": 12.5,
        "estimated_time_minutes": 28,
        "traffic_level": "Moderate",
        "is_live": False,
    },
}


def get_emergency_route(
    origin: str,
    destination: str,
    emergency_type: Optional[str] = None,
) -> dict:
    route = SAMPLE_ROUTES.get((origin, destination))

    if route is None:
        return {
            "status": "not_found",
            "message": "No sample route is available for this location pair.",
            "origin": origin,
            "destination": destination,
            "is_live": False,
        }

    return {
        "status": "success",
        "origin": origin,
        "destination": destination,
        "emergency_type": emergency_type,
        "route": route,
        "data_source": "synthetic",
        "is_live": False,
        "message": (
            "This is a sample route for project demonstration, "
            "not a live emergency navigation service."
        ),
    }