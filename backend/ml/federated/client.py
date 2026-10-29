from collections.abc import Mapping

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from app.core.config import settings
from app.ml.models.traffic_model import TrafficFlowModel


def train_client(
    client_id: str,
    X_train,
    y_train,
    input_size: int,
    global_weights: Mapping[str, torch.Tensor] | None = None,
    epochs: int | None = None,
    learning_rate: float | None = None,
) -> dict:
    """
    Train a local traffic model on one federated client.

    The client returns model weights and its sample count.
    Raw training data remains local to this function.
    """

    epochs = epochs or settings.LOCAL_EPOCHS
    learning_rate = learning_rate or settings.LEARNING_RATE

    X_tensor = torch.tensor(
        X_train,
        dtype=torch.float32,
    )

    y_tensor = torch.tensor(
        y_train,
        dtype=torch.float32,
    )

    if y_tensor.ndim == 1:
        y_tensor = y_tensor.unsqueeze(-1)

    if len(X_tensor) == 0:
        raise ValueError("Client training data cannot be empty.")

    dataset = TensorDataset(X_tensor, y_tensor)

    loader = DataLoader(
        dataset,
        batch_size=settings.BATCH_SIZE,
        shuffle=True,
    )

    model = TrafficFlowModel(input_size=input_size)

    if global_weights is not None:
        model.load_state_dict(global_weights)

    criterion = nn.MSELoss()

    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=learning_rate,
    )

    loss_history = []

    model.train()

    for _ in range(epochs):
        total_loss = 0.0

        for batch_X, batch_y in loader:
            optimizer.zero_grad()

            predictions = model(batch_X)

            loss = criterion(predictions, batch_y)

            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        average_loss = total_loss / max(len(loader), 1)
        loss_history.append(average_loss)

    return {
        "client_id": client_id,
        "num_samples": len(dataset),
        "model_weights": {
            key: value.detach().cpu().clone()
            for key, value in model.state_dict().items()
        },
        "training_loss": (
            loss_history[-1] if loss_history else None
        ),
        "loss_history": loss_history,
        "status": "completed",
    }