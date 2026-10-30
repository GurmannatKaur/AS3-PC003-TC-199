from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.services.federated_runtime import (
    TrainingAlreadyRunning,
    federated_runtime,
)

router = APIRouter()


class FederatedTrainingRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rounds: int = Field(default=5, strict=True, ge=1, le=100)
    local_epochs: int = Field(default=3, strict=True, ge=1, le=50)
    learning_rate: float = Field(
        default=0.001,
        gt=0,
        allow_inf_nan=False,
    )
    num_clients: int = Field(default=4, strict=True, ge=2, le=100)

    @model_validator(mode="after")
    def limit_total_training_work(self):
        if self.rounds * self.local_epochs * self.num_clients > 500:
            raise ValueError(
                "rounds × local_epochs × num_clients cannot exceed 500 "
                "client-epochs per run."
            )
        return self


@router.get("/status")
def get_federated_status():
    return federated_runtime.status()


@router.post("/start")
def start_federated_training(request: FederatedTrainingRequest):
    try:
        status = federated_runtime.start(**request.model_dump())
    except TrainingAlreadyRunning as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Federated training could not be started: {exc}",
        ) from exc

    return {
        "message": "Federated training started.",
        "status": status["status"],
        "configuration": request.model_dump(),
    }


@router.post("/stop")
def stop_federated_training():
    return federated_runtime.stop()


@router.get("/rounds")
def get_training_rounds():
    return federated_runtime.rounds()


@router.get("/clients")
def get_federated_clients():
    return federated_runtime.clients()
