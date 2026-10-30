import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from app.core.config import settings
from ml.models.traffic_model import TrafficFlowModel


def train_centralized_model(
    X_train,
    y_train,
    input_size: int,
    epochs: int | None = None,
    learning_rate: float | None = None,
) -> dict:
    """
    Train a traffic-flow model centrally using the supplied dataset.

    X_train shape: (samples, time_steps, features)
    y_train shape: (samples,) or (samples, prediction_horizon)
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

    dataset = TensorDataset(
        X_tensor,
        y_tensor,
    )

    loader = DataLoader(
        dataset,
        batch_size=settings.BATCH_SIZE,
        shuffle=True,
    )

    model = TrafficFlowModel(
        input_size=input_size,
    )

    criterion = nn.MSELoss()

    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=learning_rate,
    )

    loss_history = []

    model.train()

    for epoch in range(epochs):
        total_loss = 0.0

        for batch_X, batch_y in loader:
            optimizer.zero_grad()

            predictions = model(batch_X)

            loss = criterion(
                predictions,
                batch_y,
            )

            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        average_loss = total_loss / max(len(loader), 1)
        loss_history.append(average_loss)

    settings.MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    model_path = settings.MODEL_DIR / "centralized_model.pth"

    torch.save(
        model.state_dict(),
        model_path,
    )

    return {
        "status": "trained",
        "model_path": str(model_path),
        "epochs": epochs,
        "final_training_loss": loss_history[-1] if loss_history else None,
        "loss_history": loss_history,
        "data_source": "provided_training_data",
    }