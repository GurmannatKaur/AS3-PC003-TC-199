from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from app.core.config import settings
from app.services.congestion_service import classify_congestion
from ml.models.model_utils import has_federated_model, predict_flow

router = APIRouter()


class TrafficPredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    location: str = "Chandigarh"
    current_flow: float = Field(default=500, ge=0, allow_inf_nan=False)
    vehicle_count: float = Field(default=0, ge=0, allow_inf_nan=False)
    average_speed: float = Field(default=35, ge=0, allow_inf_nan=False)
    horizon_minutes: Literal[5, 10, 15] = 5


@router.get("/predictions")
def get_predictions(
    horizon_minutes: int = Query(default=5, ge=5, le=15, multiple_of=5),
):
    predictions = [
        {"horizon_minutes": 5, "predicted_flow": 520},
        {"horizon_minutes": 10, "predicted_flow": 480},
        {"horizon_minutes": 15, "predicted_flow": 450},
    ]
    return {
        "predictions": [
            prediction
            for prediction in predictions
            if prediction["horizon_minutes"] == horizon_minutes
        ],
        "data_source": "Synthetic sample data",
        "is_live": False,
        "model_status": (
            "Trained weights available; this feed remains synthetic sample data"
            if has_federated_model()
            else "Not trained"
        ),
    }


@router.post("/predict")
def predict_traffic(request: TrafficPredictionRequest):
    model_path = settings.model_dir / "federated" / "global.pt"
    scaler_path = model_path.parent / "input_scaler.json"
    has_model_weights = model_path.is_file()
    has_scaler = scaler_path.is_file()
    if has_model_weights != has_scaler:
        raise HTTPException(
            status_code=503,
            detail="Federated model artifacts are incomplete; prediction is unavailable.",
        )

    is_model_prediction = has_model_weights and has_scaler
    if is_model_prediction:
        predicted_flow = predict_flow(
            flow=request.current_flow,
            vehicle_count=request.vehicle_count,
            speed=request.average_speed,
            horizon_minutes=request.horizon_minutes,
        )
        data_source = (
            "Federated trained model with repeated current-value input window"
        )
    else:
        predicted_flow = request.current_flow * (
            1 - min(request.horizon_minutes * 0.01, 0.15)
        )
        data_source = "Sample calculation"

    congestion = classify_congestion(
        traffic_flow=predicted_flow,
        average_speed=request.average_speed,
    )

    return {
        "location": request.location,
        "horizon_minutes": request.horizon_minutes,
        "current_flow": request.current_flow,
        "predicted_flow": round(predicted_flow, 2),
        "average_speed": request.average_speed,
        "congestion_level": congestion,
        "data_source": data_source,
        "is_model_prediction": is_model_prediction,
    }