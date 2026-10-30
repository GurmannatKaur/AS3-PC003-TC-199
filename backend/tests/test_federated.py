import pytest

from tests.torch_support import require_torch


def test_fedavg_is_sample_weighted():
    torch = require_torch()
    from ml.federated.aggregation import fedavg

    result = fedavg(
        [{"weight": torch.tensor([1.0])}, {"weight": torch.tensor([3.0])}],
        [1, 3],
    )
    assert result["weight"].item() == pytest.approx(2.5)


def test_federated_lifecycle_transitions():
    from ml.federated.round_manager import TrainingLifecycle

    lifecycle = TrainingLifecycle()
    lifecycle.transition("INITIALIZING")
    lifecycle.transition("LOCAL_TRAINING")
    lifecycle.transition("AGGREGATING")
    lifecycle.transition("EVALUATING")
    lifecycle.transition("COMPLETED")
    assert lifecycle.status == "COMPLETED"
    with pytest.raises(ValueError):
        lifecycle.transition("AGGREGATING")


def test_federated_training_lifecycle_uses_server_aggregation(monkeypatch):
    torch = require_torch()
    from ml.federated import trainer_lifecycle
    from ml.federated.trainer import create_federated_trainer

    client_values = iter((1.0, 3.0))

    def train_client(**kwargs):
        return {
            "client_id": kwargs["client_id"],
            "num_samples": 1 if kwargs["client_id"] == "client_a" else 3,
            "model_weights": {
                "weight": torch.tensor([next(client_values)]),
            },
            "training_loss": 0.0,
        }

    monkeypatch.setattr(trainer_lifecycle, "train_client", train_client)
    lifecycle = create_federated_trainer()
    lifecycle.start(total_rounds=1)
    result = lifecycle.run_round(
        [
            {"client_id": "client_a", "X_train": [], "y_train": []},
            {"client_id": "client_b", "X_train": [], "y_train": []},
        ],
        input_size=1,
    )

    assert result["status"] == "completed"
    assert result["global_model_version"] == "v1"
    assert lifecycle.server.get_global_weights()["weight"].item() == pytest.approx(2.5)
    assert lifecycle.round_lifecycle.status == "COMPLETED"
