from typing import Optional

from pydantic import BaseModel


class DashboardMetrics(BaseModel):
    training_round: int = 0
    total_rounds: int = 5
    participating_clients: int = 4
    predicted_traffic: str = "Moderate"
    model_status: str = "Idle"
    communication_cost_mb: float = 0.0


class DashboardResponse(BaseModel):
    metrics: DashboardMetrics
    training_loss: Optional[float] = None
    validation_loss: Optional[float] = None
    model_version: str = "v0"
    data_source: str = "synthetic"
    message: str = "Dashboard data is awaiting model training."