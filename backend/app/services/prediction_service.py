from sqlalchemy.orm import Session

from app.models.prediction import TrafficPrediction
from app.schemas.prediction import TrafficPredictionRequest
from app.services.congestion_service import classify_congestion


def create_prediction(
    db: Session,
    request: TrafficPredictionRequest,
    predicted_flow: float,
    predicted_speed: float | None = None,
) -> TrafficPrediction:
    congestion_level = classify_congestion(
        traffic_flow=predicted_flow,
        average_speed=predicted_speed,
    )

    prediction = TrafficPrediction(
        client_id=request.client_id,
        road_segment=request.road_segment,
        horizon_minutes=request.prediction_horizon,
        predicted_flow=predicted_flow,
        predicted_speed=predicted_speed,
        congestion_level=congestion_level,
        model_version="v0",
        data_source="synthetic",
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return prediction


def get_prediction_history(
    db: Session,
    limit: int = 50,
) -> list[TrafficPrediction]:
    return (
        db.query(TrafficPrediction)
        .order_by(TrafficPrediction.predicted_at.desc())
        .limit(limit)
        .all()
    )