from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

router = APIRouter()

training_state = {
    "status": "IDLE",
    "current_round": 0,
    "total_rounds": 5,
    "participating_clients": 4,
    "completed_rounds": [],
}


class FederatedTrainingRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rounds: int = Field(default=5, ge=1, le=100)
    local_epochs: int = Field(default=3, ge=1, le=50)
    learning_rate: float = Field(default=0.001, gt=0)
    num_clients: int = Field(default=4, ge=2, le=100)


@router.get("/status")
def get_federated_status():
    return {
        **training_state,
        "data_source": (
            "Training service is not connected"
            if training_state["status"] == "CONFIGURED"
            else "Training has not been executed"
        ),
    }


@router.post("/start")
def start_federated_training(request: FederatedTrainingRequest):
    if training_state["status"] == "TRAINING":
        return {
            "message": "Federated training is already running",
            "status": training_state["status"],
        }

    training_state["status"] = "CONFIGURED"
    training_state["current_round"] = 0
    training_state["total_rounds"] = request.rounds
    training_state["participating_clients"] = request.num_clients
    training_state["completed_rounds"] = []

    return {
        "message": "Federated training configuration accepted",
        "status": training_state["status"],
        "configuration": request.model_dump(),
        "note": (
            "Configuration accepted only. The ML training service is not "
            "connected, so no model training has run."
        ),
    }


@router.post("/stop")
def stop_federated_training():
    was_running = training_state["status"] == "TRAINING"
    training_state["status"] = "STOPPED" if was_running else "IDLE"

    return {
        "message": (
            "Federated training stopped"
            if was_running
            else "No active training process was connected to stop."
        ),
        "status": training_state["status"],
    }


@router.get("/rounds")
def get_training_rounds():
    return {
        "rounds": training_state["completed_rounds"],
        "total_rounds": training_state["total_rounds"],
    }


@router.get("/clients")
def get_federated_clients():
    clients = [
        {
            "client_id": f"client_{index:02d}",
            "name": f"Traffic Client {index}",
            "status": "offline",
            "data_source": "Synthetic sample data",
        }
        for index in range(1, training_state["participating_clients"] + 1)
    ]

    return {
        "clients": clients,
        "total_clients": len(clients),
    }