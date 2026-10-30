from dataclasses import dataclass, field
from datetime import datetime

from app.core.config import settings
from ml.federated.client import train_client
from ml.federated.round_manager import TrainingLifecycle
from ml.federated.server import FederatedServer


@dataclass
class FederatedTrainingLifecycle:
    server: FederatedServer
    current_round: int = 0
    total_rounds: int = 5
    status: str = "idle"
    started_at: datetime | None = None
    completed_at: datetime | None = None
    round_lifecycle: TrainingLifecycle = field(default_factory=TrainingLifecycle)

    def start(self, total_rounds: int | None = None) -> None:
        if self.status == "running":
            raise RuntimeError("Federated training is already running.")

        self.total_rounds = total_rounds or settings.FEDERATED_ROUNDS
        self.current_round = 0
        self.status = "running"
        self.started_at = datetime.utcnow()
        self.completed_at = None
        self.round_lifecycle = TrainingLifecycle()
        self.round_lifecycle.transition("INITIALIZING")

    def run_round(
        self,
        client_datasets: list[dict],
        input_size: int,
    ) -> dict:
        if self.status != "running":
            raise RuntimeError("Start federated training first.")

        if not client_datasets:
            raise ValueError("No client datasets were provided.")

        try:
            self.round_lifecycle.transition("LOCAL_TRAINING")
            global_weights = self.server.get_global_weights()
            client_updates = []

            for dataset in client_datasets:
                update = train_client(
                    client_id=dataset["client_id"],
                    X_train=dataset["X_train"],
                    y_train=dataset["y_train"],
                    input_size=input_size,
                    global_weights=global_weights,
                )
                client_updates.append(update)

            self.round_lifecycle.transition("AGGREGATING")
            self.server.aggregate_updates(client_updates)
            self.round_lifecycle.transition("COMPLETED")
            self.current_round += 1

            if self.current_round >= self.total_rounds:
                self.status = "completed"
                self.completed_at = datetime.utcnow()
            else:
                self.round_lifecycle = TrainingLifecycle()
                self.round_lifecycle.transition("INITIALIZING")
        except Exception:
            if self.round_lifecycle.status not in {
                "COMPLETED",
                "FAILED",
                "STOPPED",
            }:
                self.round_lifecycle.transition("FAILED")
            self.status = "failed"
            self.completed_at = datetime.utcnow()
            raise

        return {
            "round_number": self.current_round,
            "status": self.status,
            "participating_clients": len(client_updates),
            "global_model_version": self.server.get_model_version(),
            "client_updates": [
                {
                    "client_id": update["client_id"],
                    "num_samples": update["num_samples"],
                    "training_loss": update["training_loss"],
                }
                for update in client_updates
            ],
        }

    def stop(self) -> dict:
        self.status = "stopped"
        self.completed_at = datetime.utcnow()
        if self.round_lifecycle.status not in {
            "COMPLETED",
            "FAILED",
            "STOPPED",
        }:
            self.round_lifecycle.transition("STOPPED")

        return {
            "status": self.status,
            "current_round": self.current_round,
            "message": "Federated training stopped.",
        }