import pytest

from ml.communication.cost_calculator import calculate_communication_cost


def test_communication_cost_totals():
    result = calculate_communication_cost([
        {"upload_bytes": 100, "download_bytes": 200},
        {"upload_bytes": 50, "download_bytes": 150},
    ])
    assert result["upload_bytes"] == 150
    assert result["download_bytes"] == 350
    assert result["total_bytes"] == 500
    assert result["total_megabytes"] == pytest.approx(500 / (1024 * 1024))
