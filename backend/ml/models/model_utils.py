import json
from datetime import datetime, timezone
from pathlib import Path

import torch

from ml.models.model_factory import create_traffic_model


def save_model(model: torch.nn.Module, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), path)


def load_model(path: Path) -> torch.nn.Module:
    model = create_traffic_model()
    model.load_state_dict(torch.load(path, map_location="cpu", weights_only=True))
    model.eval()
    return model


def get_federated_model_paths() -> tuple[Path, Path]:
    from app.core.config import settings

    model_path = settings.model_dir / "federated" / "global.pt"
    return model_path, model_path.parent / "input_scaler.json"


def has_federated_model() -> bool:
    model_path, scaler_path = get_federated_model_paths()
    return model_path.is_file() and scaler_path.is_file()


def predict_flow(flow: float, vehicle_count: float, speed: float, horizon_minutes: int) -> float:
    from app.core.config import settings

    model_path, scaler_path = get_federated_model_paths()
    if not model_path.is_file():
        raise FileNotFoundError(f"Trained model weights are missing: {model_path}")
    model = load_model(model_path)
    if not scaler_path.is_file():
        raise FileNotFoundError(f"Trained model scaler is missing: {scaler_path}")
    with scaler_path.open(encoding="utf-8") as file:
        scaler = json.load(file)
    if not isinstance(scaler, dict) or set(("mean", "scale")) - scaler.keys():
        raise ValueError(f"Trained model scaler is invalid: {scaler_path}")
    if (
        not isinstance(scaler["mean"], list)
        or not isinstance(scaler["scale"], list)
        or len(scaler["mean"]) != 5
        or len(scaler["scale"]) != 5
    ):
        raise ValueError(f"Trained model scaler has an unexpected shape: {scaler_path}")
    now = datetime.now(timezone.utc)
    features = torch.tensor(
        [[flow, vehicle_count, speed, float(now.hour), float(now.weekday())]],
        dtype=torch.float32,
    ).repeat(1, settings.model_input_window, 1)
    mean = torch.tensor(scaler["mean"], dtype=torch.float32)
    scale = torch.tensor(scaler["scale"], dtype=torch.float32)
    scale = torch.where(scale == 0, 1.0, scale)
    features = (features - mean) / scale
    with torch.no_grad():
        predicted = flow
        step_count = horizon_minutes // 5
        for _ in range(step_count):
            features[:, :, 0] = (predicted - mean[0]) / scale[0]
            predicted = max(0.0, float(model(features).item()))
        return predicted
