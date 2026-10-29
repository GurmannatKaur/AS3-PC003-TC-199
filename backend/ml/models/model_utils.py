from pathlib import Path
import json

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


def predict_flow(flow: float, vehicle_count: float, speed: float, horizon_minutes: int) -> float:
    from app.core.config import settings

    model_path = settings.model_dir / "federated" / "global.pt"
    model = load_model(model_path)
    scaler_path = model_path.parent / "input_scaler.json"
    if not scaler_path.is_file():
        raise FileNotFoundError(f"Trained model scaler is missing: {scaler_path}")
    with scaler_path.open(encoding="utf-8") as file:
        scaler = json.load(file)
    features = torch.tensor(
        [[flow, vehicle_count, speed, 12.0, 0.0]], dtype=torch.float32
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
