from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FederatedTrainingRequest(BaseModel):
    num_clients: int = Field(default=4, ge=1)
    rounds: int = Field(default=5, ge=1)
    local_epochs: int = Field(default=3, ge=1)
    learning_rate: float = Field(default=0.001, gt=0)


class FederatedTrainingStatus(BaseModel):
    status: str = "idle"
    current_round: int = 0
    total_rounds: int = 5
    participating_clients: int = 4
    global_model_version: str = "v0"
    message: str = "Federated training has not started."


class FederatedRoundResponse(BaseModel):
    round_number: int
    status: str
    participating_clients: int
    total_samples: int = 0
    training_loss: Optional[float] = None
    validation_loss: Optional[float] = None
    communication_cost_mb: float = 0.0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class FederatedClientUpdate(BaseModel):
    client_id: str
    num_samples: int = Field(ge=0)
    training_loss: Optional[float] = None
    update_size_bytes: int = Field(default=0, ge=0)


class FederatedTrainingResponse(BaseModel):
    status: str
    message: str
    configuration: FederatedTrainingRequest