from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class CongestionRequest(BaseModel):
    vehicle_count: float = Field(ge=0)
    average_speed: float = Field(ge=0)


def classify_congestion(vehicle_count: float, average_speed: float) -> str:
    if average_speed < 20 or vehicle_count >= 800:
        return "High"

    if average_speed < 40 or vehicle_count >= 400:
        return "Moderate"

    return "Low"


@router.get("/congestion")
def get_congestion():
    return {
        "levels": ["Low", "Moderate", "High"],
        "thresholds": {
            "low": "Speed >= 40 km/h and vehicle count < 400",
            "moderate": "Speed 20–39 km/h or vehicle count 400–799",
            "high": "Speed < 20 km/h or vehicle count >= 800",
        },
        "data_source": "Illustrative classification thresholds",
    }


@router.post("/congestion/classify")
def classify_traffic(request: CongestionRequest):
    level = classify_congestion(
        request.vehicle_count,
        request.average_speed,
    )

    return {
        "vehicle_count": request.vehicle_count,
        "average_speed": request.average_speed,
        "congestion_level": level,
        "data_source": "Rule-based classification",
    }