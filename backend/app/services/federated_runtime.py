from copy import deepcopy
from datetime import datetime, timezone
import logging
from threading import Event, RLock, Thread
from time import perf_counter

import numpy as np
import torch

from ml.communication.payload_serializer import serialize_model_update
from ml.data.data_loader import generate_synthetic_clients
from ml.data.preprocessing import prepare_temporal_data
from ml.data.sequence_builder import create_sequences
from ml.evaluation.evaluator import TrafficModelEvaluator
from ml.federated.round_manager import FederatedRoundManager
from ml.federated.trainer import create_federated_trainer
from ml.models.traffic_model import TrafficFlowModel

logger = logging.getLogger(__name__)

_ACTIVE_STATUSES = {"STARTING", "TRAINING", "STOPPING"}
_DEFAULT_CLIENT_COUNT = 4
_ROWS_PER_CLIENT = 96


class TrainingAlreadyRunning(Exception):
    """Raised when a new run is requested while another run is active."""


class FederatedTrainingRuntime:
    """Runs the existing federated trainer and exposes thread-safe API state."""

    def __init__(self) -> None:
        self._lock = RLock()
        self._stop_event = Event()
        self._thread: Thread | None = None
        self._lifecycle = None
        self._started_at: float | None = None
        self._rounds: list[dict] = []
        self._communication_records: list[dict] = []
        self._clients: list[dict] = self._make_clients(_DEFAULT_CLIENT_COUNT)
        self._state = self._initial_state()

    @staticmethod
    def _initial_state() -> dict:
        return {
            "status": "IDLE",
            "phase": "idle",
            "current_round": 0,
            "total_rounds": 5,
            "participating_clients": _DEFAULT_CLIENT_COUNT,
            "completed_rounds": [],
            "global_model_version": "v0",
            "model_trained": False,
            "model_metrics": None,
            "evaluation_samples": 0,
            "metrics_source": None,
            "training_duration_seconds": None,
            "started_at": None,
            "completed_at": None,
            "last_error": None,
            "data_source": "deterministic_synthetic_local_partitions",
            "execution_mode": "local_demo",
        }

    @staticmethod
    def _make_clients(client_count: int) -> list[dict]:
        return [
            {
                "client_id": f"client_{index:02d}",
                "name": f"Local partition {index:02d}",
                "status": "configured",
                "data_source": "synthetic_local_partition",
                "execution_mode": "local_demo",
                "training_samples": 0,
                "last_completed_round": 0,
            }
            for index in range(1, client_count + 1)
        ]

    def _prepare_partitions(self, client_count: int) -> tuple[list[dict], list, object]:
        generated = generate_synthetic_clients(
            client_count=1,
            rows_per_client=client_count * _ROWS_PER_CLIENT,
        )
        _, features, targets, scaler = prepare_temporal_data(
            generated["client_01"]
        )

        sequence_length = 12
        partitions = []
        evaluation_inputs = []
        evaluation_targets = []
        for index in range(client_count):
            start = index * _ROWS_PER_CLIENT
            end = start + _ROWS_PER_CLIENT
            local_features = features[start:end]
            local_targets = targets[start:end]
            split_at = int(len(local_features) * 0.75)
            if split_at <= sequence_length or len(local_features) - split_at < 2:
                raise ValueError(
                    f"Not enough records to prepare local partition {index + 1}."
                )

            train_inputs, train_targets = create_sequences(
                local_features[:split_at],
                local_targets[:split_at],
                sequence_length=sequence_length,
            )
            evaluation_start = split_at - sequence_length
            client_eval_inputs, client_eval_targets = create_sequences(
                local_features[evaluation_start:],
                local_targets[evaluation_start:],
                sequence_length=sequence_length,
            )
            if len(train_inputs) == 0 or len(client_eval_inputs) == 0:
                raise ValueError(
                    f"Not enough records to train and evaluate local partition {index + 1}."
                )

            partitions.append(
                {
                    "client_id": f"client_{index + 1:02d}",
                    "X_train": train_inputs,
                    "y_train": train_targets,
                }
            )
            evaluation_inputs.append(client_eval_inputs)
            evaluation_targets.append(client_eval_targets)

        evaluation_data = (
            np.concatenate(evaluation_inputs),
            np.concatenate(evaluation_targets),
        )
        return partitions, evaluation_data, scaler

    @staticmethod
    def _initial_weights(input_size: int) -> dict[str, torch.Tensor]:
        with torch.random.fork_rng(devices=[]):
            torch.manual_seed(20261030)
            model = TrafficFlowModel(
                input_size=input_size,
                hidden_size=32,
                num_layers=1,
                output_size=1,
                dropout=0.0,
            )
        return {
            key: value.detach().cpu().clone()
            for key, value in model.state_dict().items()
        }

    @staticmethod
    def _evaluate(
        weights: dict[str, torch.Tensor],
        evaluation_data: tuple[np.ndarray, np.ndarray],
        scaler,
    ) -> dict:
        inputs, scaled_actual = evaluation_data
        model = TrafficFlowModel(
            input_size=inputs.shape[-1],
            hidden_size=32,
            num_layers=1,
            output_size=1,
            dropout=0.0,
        )
        model.load_state_dict(weights)
        model.eval()
        with torch.no_grad():
            scaled_predictions = (
                model(torch.as_tensor(inputs, dtype=torch.float32))
                .cpu()
                .numpy()
                .reshape(-1)
            )

        actual = (scaled_actual.reshape(-1) - scaler.min_[0]) / scaler.scale_[0]
        predicted = (scaled_predictions - scaler.min_[0]) / scaler.scale_[0]
        metrics = TrafficModelEvaluator().evaluate(actual, predicted)
        return {
            "mae": metrics["mae"],
            "mse": metrics["mse"],
            "rmse": metrics["rmse"],
            "r2": metrics["r2"],
            "evaluation_samples": int(len(actual)),
            "metrics_source": "global_model_predictions_on_holdout_partitions",
        }

    def start(
        self,
        *,
        rounds: int,
        local_epochs: int,
        learning_rate: float,
        num_clients: int,
    ) -> dict:
        with self._lock:
            if self._state["status"] in _ACTIVE_STATUSES:
                raise TrainingAlreadyRunning(
                    "Federated training is already active."
                )

        partitions, evaluation_data, scaler = self._prepare_partitions(num_clients)
        initial_weights = self._initial_weights(
            int(partitions[0]["X_train"].shape[-1])
        )
        lifecycle = create_federated_trainer(initial_weights=initial_weights)
        lifecycle.start(total_rounds=rounds)
        clients = self._make_clients(num_clients)
        for client, partition in zip(clients, partitions):
            client["training_samples"] = int(len(partition["X_train"]))

        with self._lock:
            if self._state["status"] in _ACTIVE_STATUSES:
                raise TrainingAlreadyRunning(
                    "Federated training is already active."
                )
            self._stop_event = Event()
            self._lifecycle = lifecycle
            self._clients = clients
            self._rounds = []
            self._communication_records = []
            self._started_at = perf_counter()
            self._state = {
                **self._initial_state(),
                "status": "TRAINING",
                "phase": "initializing",
                "total_rounds": rounds,
                "participating_clients": num_clients,
                "started_at": datetime.now(timezone.utc).isoformat(),
            }
            self._thread = Thread(
                target=self._run,
                args=(
                    lifecycle,
                    partitions,
                    evaluation_data,
                    scaler,
                    local_epochs,
                    learning_rate,
                ),
                name="mosaic-federated-training",
                daemon=True,
            )
            try:
                self._thread.start()
            except RuntimeError as exc:
                self._state["status"] = "FAILED"
                self._state["phase"] = "failed"
                self._state["last_error"] = str(exc)
                self._state["completed_at"] = datetime.now(timezone.utc).isoformat()
                raise
        return self.status()

    def _run(
        self,
        lifecycle,
        partitions: list[dict],
        evaluation_data: tuple[np.ndarray, np.ndarray],
        scaler,
        local_epochs: int,
        learning_rate: float,
    ) -> None:
        rounds = FederatedRoundManager()
        try:
            for round_number in range(1, lifecycle.total_rounds + 1):
                if self._stop_event.is_set():
                    lifecycle.stop()
                    self._finish("STOPPED", "stopped")
                    return

                with self._lock:
                    self._state["status"] = "TRAINING"
                    self._state["phase"] = "local_training"
                    self._state["current_round"] = round_number
                    for client in self._clients:
                        client["status"] = "waiting"

                round_started = perf_counter()
                rounds.start_round(round_number, len(partitions))

                def set_phase(phase: str) -> None:
                    with self._lock:
                        self._state["phase"] = phase.lower()

                def set_client_status(client_id: str, status: str) -> None:
                    with self._lock:
                        for client in self._clients:
                            if client["client_id"] == client_id:
                                client["status"] = status
                                break

                result = lifecycle.run_round(
                    partitions,
                    input_size=int(partitions[0]["X_train"].shape[-1]),
                    epochs=local_epochs,
                    learning_rate=learning_rate,
                    stop_event=self._stop_event,
                    evaluation_callback=lambda weights: self._evaluate(
                        weights, evaluation_data, scaler
                    ),
                    on_phase=set_phase,
                    on_client_status=set_client_status,
                )
                if result is None:
                    with self._lock:
                        for client in self._clients:
                            if client["status"] in {"training", "waiting"}:
                                client["status"] = "stopped"
                    self._finish("STOPPED", "stopped")
                    return

                client_updates = result["client_updates"]
                download_payload = serialize_model_update(
                    lifecycle.server.get_global_weights()
                )
                payloads = [
                    {
                        "upload_bytes": len(
                            serialize_model_update(update["model_weights"])
                        ),
                        "download_bytes": len(download_payload),
                    }
                    for update in client_updates
                ]
                upload_bytes = sum(item["upload_bytes"] for item in payloads)
                download_bytes = sum(item["download_bytes"] for item in payloads)
                total_bytes = upload_bytes + download_bytes
                total_mb = total_bytes / (1024 * 1024)
                self._record_communication(
                    round_number,
                    upload_bytes,
                    download_bytes,
                )

                total_samples = sum(
                    update["num_samples"] for update in client_updates
                )
                weighted_loss = sum(
                    update["training_loss"] * update["num_samples"]
                    for update in client_updates
                ) / total_samples
                rounds.complete_round(
                    round_number,
                    total_samples=total_samples,
                    training_loss=float(weighted_loss),
                    communication_cost_mb=total_mb,
                )
                round_record = {
                    "round": round_number,
                    "status": "completed",
                    "participating_clients": len(client_updates),
                    "total_samples": total_samples,
                    "training_loss": float(weighted_loss),
                    "duration_seconds": round(perf_counter() - round_started, 4),
                    "global_model_version": result["global_model_version"],
                    "metrics": result["metrics"],
                    "upload_bytes": upload_bytes,
                    "download_bytes": download_bytes,
                    "total_bytes": total_bytes,
                    "total_mb": round(total_mb, 6),
                }
                with self._lock:
                    self._rounds.append(round_record)
                    self._state["completed_rounds"].append(round_number)
                    for client in self._clients:
                        client["status"] = "completed"
                        client["last_completed_round"] = round_number
                    self._state["model_trained"] = True
                    self._state["global_model_version"] = (
                        result["global_model_version"]
                    )
                    self._state["model_metrics"] = result["metrics"]
                    self._state["evaluation_samples"] = result["metrics"][
                        "evaluation_samples"
                    ]
                    self._state["metrics_source"] = result["metrics"][
                        "metrics_source"
                    ]
                    self._state["phase"] = "completed"

                if lifecycle.status == "completed":
                    self._finish("COMPLETED", "completed")
                    return
                if self._stop_event.is_set():
                    lifecycle.stop()
                    self._finish("STOPPED", "stopped")
                    return

            self._finish("COMPLETED", "completed")
        except Exception as exc:
            logger.exception(
                "Federated training failed during round %s",
                self.status()["current_round"],
            )
            with self._lock:
                for client in self._clients:
                    if client["status"] in {"training", "waiting"}:
                        client["status"] = "failed"
                self._state["last_error"] = str(exc)
            self._finish("FAILED", "failed")

    def _finish(self, status: str, phase: str) -> None:
        with self._lock:
            self._state["status"] = status
            self._state["phase"] = phase
            self._state["completed_at"] = datetime.now(timezone.utc).isoformat()
            if self._started_at is not None:
                self._state["training_duration_seconds"] = round(
                    perf_counter() - self._started_at,
                    4,
                )

    def stop(self) -> dict:
        with self._lock:
            if self._state["status"] in _ACTIVE_STATUSES:
                self._stop_event.set()
                self._state["status"] = "STOPPING"
                self._state["phase"] = "stopping"
                return {
                    "status": "STOPPING",
                    "message": "Training will stop safely after the active local update.",
                }
            return {
                "status": self._state["status"],
                "message": "No active training run.",
            }

    def status(self) -> dict:
        with self._lock:
            state = deepcopy(self._state)
            if (
                self._started_at is not None
                and state["status"] in _ACTIVE_STATUSES
            ):
                state["training_duration_seconds"] = round(
                    perf_counter() - self._started_at,
                    4,
                )
            return state

    def rounds(self) -> dict:
        with self._lock:
            return {
                "rounds": deepcopy(self._rounds),
                "total_rounds": len(self._rounds),
                "configured_rounds": self._state["total_rounds"],
            }

    def clients(self) -> dict:
        with self._lock:
            return {
                "clients": deepcopy(self._clients),
                "total_clients": len(self._clients),
                "execution_mode": "local_demo",
            }

    def communication_records(self) -> list[dict]:
        with self._lock:
            return deepcopy(self._communication_records)

    def _record_communication(
        self,
        round_number: int,
        upload_bytes: int,
        download_bytes: int,
    ) -> None:
        total_bytes = upload_bytes + download_bytes
        record = {
            "round": round_number,
            "upload_bytes": upload_bytes,
            "download_bytes": download_bytes,
            "total_bytes": total_bytes,
            "total_mb": round(total_bytes / (1024 * 1024), 6),
        }
        with self._lock:
            self._communication_records.append(record)

    def dashboard(self) -> dict:
        state = self.status()
        records = self.communication_records()
        total_bytes = sum(record["total_bytes"] for record in records)
        return {
            "training_round": len(state["completed_rounds"]),
            "participating_clients": state["participating_clients"],
            "predicted_traffic_status": "Unavailable",
            "global_model_status": (
                "Trained" if state["model_trained"] else "Not trained"
            ),
            "evaluation_metrics": {
                "mae": (
                    state["model_metrics"]["mae"]
                    if state["model_metrics"]
                    else None
                ),
                "mse": (
                    state["model_metrics"]["mse"]
                    if state["model_metrics"]
                    else None
                ),
                "rmse": (
                    state["model_metrics"]["rmse"]
                    if state["model_metrics"]
                    else None
                ),
                "r2": (
                    state["model_metrics"]["r2"]
                    if state["model_metrics"]
                    else None
                ),
            },
            "communication_cost_mb": total_bytes / (1024 * 1024),
            "recent_training_rounds": state["completed_rounds"][-5:],
            "data_source": "demonstration",
        }


federated_runtime = FederatedTrainingRuntime()
