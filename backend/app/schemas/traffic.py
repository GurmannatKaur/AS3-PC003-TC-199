from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TrafficRecordBase(BaseModel):
    client_id: str
    road_segment: str
    timestamp: datetime
    vehicle_count: int = Field(ge=0)
    traffic_flow: float = Field(ge=0)
    average_speed: Optional[float] = Field(default=None, ge=0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    data_source: str = "synthetic"


class TrafficRecordCreate(TrafficRecordBase):
    pass


class TrafficRecordResponse(TrafficRecordBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TrafficPredictionRequest(BaseModel):
    client_id: str
    road_segment: str
    input_window: int = Field(default=12, ge=1)
    prediction_horizon: int = Field(default=3, ge=1)


class TrafficPredictionResponse(BaseModel):
    road_segment: str
    predicted_flow: float
    predicted_speed: Optional[float] = None
    congestion_level: str
    horizon_minutes: int
    data_source: str = "synthetic"
    is_model_prediction: bool = False