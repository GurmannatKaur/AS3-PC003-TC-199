from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class TrafficPredictionRequest(BaseModel):
    location: str = "Chandigarh"
    current_flow: float = Field(default=500, ge=0)
    average_speed: float = Field(default=35, ge=0)
    horizon_minutes: int = Field(default=5, ge=5, le=15)


def classify_congestion(flow: float, speed: float) -> str:
    if speed < 20 or flow >= 800:
        return "High"
    if speed < 40 or flow >= 400:
        return "Moderate"
    return "Low"


@router.get("/predictions")
def get_predictions():
    return {
        "predictions": [
            {"horizon_minutes": 5, "predicted_flow": 520},
            {"horizon_minutes": 10, "predicted_flow": 480},
            {"horizon_minutes": 15, "predicted_flow": 450},
        ],
        "data_source": "Synthetic sample data",
        "is_live": False,
        "model_status": "Not trained",
    }


@router.post("/predict")
def predict_traffic(request: TrafficPredictionRequest):
    predicted_flow = request.current_flow * (
        1 - min(request.horizon_minutes * 0.01, 0.15)
    )

    congestion = classify_congestion(
        predicted_flow,
        request.average_speed,
    )

    return {
        "location": request.location,
        "horizon_minutes": request.horizon_minutes,
        "current_flow": request.current_flow,
        "predicted_flow": round(predicted_flow, 2),
        "average_speed": request.average_speed,
        "congestion_level": congestion,
        "data_source": "Sample calculation",
        "is_model_prediction": False,
    }