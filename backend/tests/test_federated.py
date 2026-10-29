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
