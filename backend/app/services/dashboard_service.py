from sqlalchemy.orm import Session

from app.models.client import FederatedClient
from app.models.training_round import TrainingRound
from app.schemas.dashboard import DashboardMetrics, DashboardResponse


def get_dashboard_data(db: Session) -> DashboardResponse:
    latest_round = (
        db.query(TrainingRound)
        .order_by(TrainingRound.round_number.desc())
        .first()
    )

    participating_clients = (
        db.query(FederatedClient)
        .filter(FederatedClient.is_online.is_(True))
        .count()
    )

    if latest_round:
        training_round = latest_round.round_number
        model_status = latest_round.status
        model_version = latest_round.global_model_version or "v0"
        training_loss = latest_round.training_loss
        validation_loss = latest_round.validation_loss
    else:
        training_round = 0
        model_status = "Idle"
        model_version = "v0"
        training_loss = None
        validation_loss = None

    metrics = DashboardMetrics(
        training_round=training_round,
        total_rounds=5,
        participating_clients=participating_clients,
        predicted_traffic="Moderate",
        model_status=model_status,
        communication_cost_mb=0.0,
    )

    return DashboardResponse(
        metrics=metrics,
        training_loss=training_loss,
        validation_loss=validation_loss,
        model_version=model_version,
        data_source="synthetic",
        message="Dashboard metrics are based on recorded training data.",
    )