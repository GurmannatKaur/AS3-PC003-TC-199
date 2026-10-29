from ml.models.traffic_model import TrafficLSTM


def create_traffic_model(config: dict | None = None) -> TrafficLSTM:
    config = config or {}
    return TrafficLSTM(
        input_size=config.get("input_size", 5),
        hidden_size=config.get("hidden_size", 32),
        num_layers=config.get("num_layers", 1),
    )
