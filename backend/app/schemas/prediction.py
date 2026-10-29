from typing import Optional

from pydantic import BaseModel, Field


class TrafficPredictionRequest(BaseModel):
    client_id: str = "client_1"
    road_segment: str
    input_window: int = Field(default=12, ge=1)
    prediction_horizon: int = Field(default=3, ge=1)


class TrafficPredictionResponse(BaseModel):
    road_segment: str
    predicted_flow: float
    predicted_speed: Optional[float] = None
    congestion_level: str
    horizon_minutes: int
    model_version: str = "v0"
    data_source: str = "synthetic"
    is_model_prediction: bool = False


class PredictionHistoryResponse(BaseModel):
    id: int
    road_segment: str
    predicted_flow: float
    predicted_speed: Optional[float] = None
    congestion_level: str
    horizon_minutes: int
    model_version: str
    data_source: str = "synthetic"