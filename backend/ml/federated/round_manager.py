from dataclasses import dataclass, field
from datetime import datetime


class TrainingLifecycle:
    """Validate state transitions for a federated training run."""

    _TRANSITIONS = {
        "IDLE": {"INITIALIZING"},
        "INITIALIZING": {"LOCAL_TRAINING", "FAILED", "STOPPED"},
        "LOCAL_TRAINING": {"AGGREGATING", "FAILED", "STOPPED"},
        "AGGREGATING": {"EVALUATING", "COMPLETED", "FAILED", "STOPPED"},
        "EVALUATING": {"COMPLETED", "FAILED", "STOPPED"},
        "COMPLETED": set(),
        "FAILED": set(),
        "STOPPED": set(),
    }

    def __init__(self) -> None:
        self.status = "IDLE"

    def transition(self, status: str) -> None:
        if status not in self._TRANSITIONS.get(self.status, set()):
            raise ValueError(
                f"Invalid training lifecycle transition: "
                f"{self.status} -> {status}."
            )
        self.status = status


@dataclass
class FederatedRound:
    round_number: int
    status: str = "pending"
    participating_clients: int = 0
    total_samples: int = 0
    training_loss: float | None = None
    communication_cost_mb: float = 0.0
    started_at: datetime | None = None
    completed_at: datetime | None = None


@dataclass
class FederatedRoundManager:
    rounds: list[FederatedRound] = field(default_factory=list)

    def start_round(
        self,
        round_number: int,
        participating_clients: int,
    ) -> FederatedRound:
        if round_number < 1:
            raise ValueError("Round number must be at least 1.")

        if participating_clients < 1:
            raise ValueError(
                "At least one client must participate."
            )

        round_info = FederatedRound(
            round_number=round_number,
            status="running",
            participating_clients=participating_clients,
            started_at=datetime.utcnow(),
        )

        self.rounds.append(round_info)
        return round_info

    def complete_round(
        self,
        round_number: int,
        total_samples: int,
        training_loss: float | None = None,
        communication_cost_mb: float = 0.0,
    ) -> FederatedRound:
        round_info = self.get_round(round_number)

        if round_info is None:
            raise ValueError(
                f"Round {round_number} was not found."
            )

        round_info.status = "completed"
        round_info.total_samples = total_samples
        round_info.training_loss = training_loss
        round_info.communication_cost_mb = communication_cost_mb
        round_info.completed_at = datetime.utcnow()

        return round_info

    def get_round(
        self,
        round_number: int,
    ) -> FederatedRound | None:
        for round_info in self.rounds:
            if round_info.round_number == round_number:
                return round_info

        return None

    def get_all_rounds(self) -> list[FederatedRound]:
        return self.rounds

    def get_latest_round(self) -> FederatedRound | None:
        return self.rounds[-1] if self.rounds else None