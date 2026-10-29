import pandas as pd

from ml.data.data_cleaning import clean_traffic_data
from ml.data.data_loader import generate_synthetic_clients
from ml.data.dataset_split import temporal_split
from ml.data.preprocessing import MODEL_FEATURES, prepare_temporal_data


def test_cleaning_invalid_values_and_duplicates():
    frame = pd.DataFrame({
        "timestamp": ["2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z", "bad"],
        "traffic_flow": [10, 10, -2],
    })
    cleaned = clean_traffic_data(frame)
    assert len(cleaned) == 1
    assert cleaned.loc[0, "traffic_flow"] == 10


def test_temporal_split_keeps_time_order():
    frame = next(iter(generate_synthetic_clients(rows_per_client=60).values()))
    train, validation, test = temporal_split(frame)
    assert train["timestamp"].max() < validation["timestamp"].min()
    assert validation["timestamp"].max() < test["timestamp"].min()


def test_preprocessing_uses_consistent_client_feature_scale():
    clients = generate_synthetic_clients(rows_per_client=80)
    prepared = [prepare_temporal_data(frame) for frame in clients.values()]
    assert prepared[0][3].scale_.tolist() == prepared[1][3].scale_.tolist()
    assert prepared[0][0][MODEL_FEATURES].abs().max().max() < 10
