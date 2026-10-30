import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from ml.models.traffic_model import TrafficFlowModel


class TrainingStopped(Exception):
    """Raised when a federated run is cancelled during local training."""


def train_client(
    client_id: str,
    X_train,
    y_train,
    input_size: int,
    global_weights=None,
    epochs: int | None = None,
    learning_rate: float | None = None,
    stop_event=None,
) -> dict:
    epochs = epochs or 3
    learning_rate = learning_rate or 0.001

    X_tensor = torch.as_tensor(X_train, dtype=torch.float32)
    y_tensor = torch.as_tensor(y_train, dtype=torch.float32)

    if y_tensor.ndim == 1:
        y_tensor = y_tensor.unsqueeze(-1)

    if len(X_tensor) == 0:
        raise ValueError("Client training data cannot be empty.")
    if X_tensor.ndim != 3:
        raise ValueError(
            "Client inputs must have shape "
            "(samples, sequence_length, input_size); "
            f"got {tuple(X_tensor.shape)}"
        )
    if X_tensor.shape[-1] != input_size:
        raise ValueError(
            f"Client inputs contain {X_tensor.shape[-1]} features per time "
            f"step; expected input_size={input_size}."
        )
    if y_tensor.ndim != 2 or len(X_tensor) != len(y_tensor):
        raise ValueError(
            "Client targets must have shape (samples, output_size) and align "
            f"with inputs; got X={tuple(X_tensor.shape)}, "
            f"y={tuple(y_tensor.shape)}"
        )

    output_size = y_tensor.shape[-1]
    dataset = TensorDataset(X_tensor, y_tensor)
    loader = DataLoader(dataset, batch_size=32, shuffle=True)

    model = TrafficFlowModel(
        input_size=input_size,
        hidden_size=32,
        num_layers=1,
        output_size=output_size,
        dropout=0.0,
    )

    if global_weights is not None:
        model.load_state_dict(global_weights)

    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    loss_history = []

    model.train()
    for _ in range(epochs):
        if stop_event is not None and stop_event.is_set():
            raise TrainingStopped()
        total_loss = 0.0
        for batch_X, batch_y in loader:
            if stop_event is not None and stop_event.is_set():
                raise TrainingStopped()
            optimizer.zero_grad()
            predictions = model(batch_X)
            loss = criterion(predictions, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        loss_history.append(total_loss / max(len(loader), 1))

    return {
        "client_id": client_id,
        "num_samples": len(dataset),
        "model_weights": {
            key: value.detach().cpu().clone()
            for key, value in model.state_dict().items()
        },
        "training_loss": loss_history[-1] if loss_history else None,
        "loss_history": loss_history,
        "status": "completed",
    }
