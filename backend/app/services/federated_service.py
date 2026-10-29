from datetime import datetime

from sqlalchemy.orm import Session

from app.models.training_round import TrainingRound
from app.schemas.federated import FederatedTrainingRequest


def get_training_status(db: Session) -> dict:
    latest_round = (
        db.query(TrainingRound)
        .order_by(TrainingRound.round_number.desc())
        .first()
    )

    if latest_round is None:
        return {
            "status": "idle",
            "current_round": 0,
            "total_rounds": 5,
            "participating_clients": 4,
            "global_model_version": "v0",
            "message": "Federated training has not started.",
        }

    return {
        "status": latest_round.status,
        "current_round": latest_round.round_number,
        "total_rounds": 5,
        "participating_clients": latest_round.participating_clients,
        "global_model_version": (
            latest_round.global_model_version or "v0"
        ),
        "message": "Status retrieved from recorded training rounds.",
    }


def start_federated_training(
    db: Session,
    config: FederatedTrainingRequest,
) -> dict:
    """
    Record a training configuration.

    This function does not perform actual model training.
    The ML training pipeline will be connected separately.
    """

    return {
        "status": "configured",
        "message": (
            "Federated training configuration accepted. "
            "The actual ML training pipeline is not connected yet."
        ),
        "configuration": config.model_dump(),
        "requested_at": datetime.utcnow().isoformat(),
    }


def stop_federated_training() -> dict:
    return {
        "status": "idle",
        "message": "No active training process is connected to stop.",
    }