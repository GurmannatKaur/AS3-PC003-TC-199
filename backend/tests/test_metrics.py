import pytest

from ml.evaluation.metrics import calculate_metrics


def test_metrics_use_actual_prediction_errors():
    result = calculate_metrics([1, 2, 3], [2, 2, 4])
    assert result["mae"] == pytest.approx(2 / 3)
    assert result["mse"] == pytest.approx(2 / 3)
    assert result["rmse"] == pytest.approx((2 / 3) ** 0.5)
    assert result["r2"] == pytest.approx(0.0)
