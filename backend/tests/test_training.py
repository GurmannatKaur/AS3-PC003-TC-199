from tests.torch_support import require_torch


def test_windowed_data_shapes():
    require_torch()
    from ml.data.data_loader import generate_synthetic_clients
    from ml.data.dataset import TrafficWindowDataset
    from ml.data.dataset_split import temporal_split
    from ml.data.preprocessing import preprocess_traffic_data

    frame = next(iter(generate_synthetic_clients(rows_per_client=80).values()))
    prepared, _ = preprocess_traffic_data(frame)
    train, _, _ = temporal_split(prepared)
    dataset = TrafficWindowDataset(train, window_size=8)
    features, target = dataset[0]
    assert tuple(features.shape) == (8, 5)
    assert tuple(target.shape) == (1,)
