from app.core.config import settings
from ml.federated.server import FederatedServer
from ml.federated.trainer_lifecycle import FederatedTrainingLifecycle


def create_federated_trainer(
    initial_weights=None,
) -> FederatedTrainingLifecycle:
    """
    Create a federated training lifecycle with a central server.
    """

    server = FederatedServer(
        initial_weights=initial_weights,
    )

    lifecycle = FederatedTrainingLifecycle(
        server=server,
        total_rounds=settings.FEDERATED_ROUNDS,
    )

    return lifecycle


def get_federated_training_status(
    lifecycle: FederatedTrainingLifecycle,
) -> dict:
    return {
        "status": lifecycle.status,
        "current_round": lifecycle.current_round,
        "total_rounds": lifecycle.total_rounds,
        "global_model_version": lifecycle.server.get_model_version(),
        "started_at": (
            lifecycle.started_at.isoformat()
            if lifecycle.started_at
            else None
        ),
        "completed_at": (
            lifecycle.completed_at.isoformat()
            if lifecycle.completed_at
            else None
        ),
    }