from typing import Optional

from pydantic import BaseModel


class ModelMetrics(BaseModel):
    model_name: str
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2_score: Optional[float] = None
    training_time_seconds: Optional[float] = None
    communication_cost_mb: Optional[float] = None
    status: str = "not_trained"


class ModelComparisonResponse(BaseModel):
    centralized: ModelMetrics
    federated: ModelMetrics
    comparison_note: str = (
        "Metrics will be available after model training and evaluation."
    )