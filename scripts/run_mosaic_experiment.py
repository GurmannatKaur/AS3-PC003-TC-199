import sys
import json
import copy
import time
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from ml.data.traffic_mat_loader import load_traffic_dataset
from ml.models.traffic_model import TrafficFlowModel
from ml.federated.client import train_client
from ml.federated.fedavg import fedavg

torch.manual_seed(42)
np.random.seed(42)

EPOCHS = 3
ROUNDS = 3
CLIENTS = 3
BATCH_SIZE = 32
LR = 0.001
SEQ_LEN = 12
NUM_SENSORS = 36
FEATURES_PER_SENSOR = 48
INPUT_SIZE = NUM_SENSORS * FEATURES_PER_SENSOR
OUTPUT_SIZE = NUM_SENSORS
HIDDEN_SIZE = 32
DEVICE = torch.device("cpu")


def validate_sequences(X, Y, context):
    if X.ndim != 3 or X.shape[2] != INPUT_SIZE:
        raise ValueError(
            f"{context} inputs must have shape "
            f"(samples, sequence_length, {INPUT_SIZE}); got {X.shape}"
        )
    if Y.ndim != 2 or Y.shape[1] != OUTPUT_SIZE:
        raise ValueError(
            f"{context} targets must have shape (samples, {OUTPUT_SIZE}); "
            f"got {Y.shape}"
        )
    if len(X) != len(Y):
        raise ValueError(
            f"{context} input/target sample counts differ: {len(X)} != {len(Y)}"
        )


def make_sequences(X, Y, seq_len=SEQ_LEN):
    X = np.asarray(X, dtype=np.float32)
    Y = np.asarray(Y, dtype=np.float32)
    expected_observation_shape = (NUM_SENSORS, FEATURES_PER_SENSOR)
    if X.ndim != 3 or X.shape[1:] != expected_observation_shape:
        raise ValueError(f"Unexpected shapes: X={X.shape}, Y={Y.shape}")
    if Y.ndim != 2 or Y.shape[1] != OUTPUT_SIZE:
        raise ValueError(f"Unexpected shapes: X={X.shape}, Y={Y.shape}")
    if seq_len <= 0:
        raise ValueError("Sequence length must be positive.")
    if len(X) != len(Y):
        raise ValueError(
            f"Input/target sample counts differ: {len(X)} != {len(Y)}"
        )
    if len(X) <= seq_len:
        raise ValueError("Not enough aligned samples to create sequences.")

    X = X.reshape(len(X), INPUT_SIZE)
    xs = np.stack(
        [X[i:i + seq_len] for i in range(len(X) - seq_len)],
        axis=0,
    )
    ys = Y[seq_len:]
    validate_sequences(xs, ys, "Generated")
    return xs, ys


def new_model():
    return TrafficFlowModel(
        input_size=INPUT_SIZE,
        hidden_size=HIDDEN_SIZE,
        num_layers=1,
        output_size=OUTPUT_SIZE,
        dropout=0.0,
    ).to(DEVICE)


def evaluate(model, X, Y):
    validate_sequences(X, Y, "Evaluation")
    model.eval()
    with torch.no_grad():
        pred = model(torch.tensor(X, dtype=torch.float32, device=DEVICE)).cpu().numpy()
    actual = np.asarray(Y)
    return {
        "mae": float(mean_absolute_error(actual.ravel(), pred.ravel())),
        "rmse": float(np.sqrt(mean_squared_error(actual.ravel(), pred.ravel()))),
        "r2": float(r2_score(actual.ravel(), pred.ravel())),
    }


def train_centralized(X, Y):
    validate_sequences(X, Y, "Centralized training")
    model = new_model()
    loader = DataLoader(
        TensorDataset(torch.tensor(X), torch.tensor(Y)),
        batch_size=BATCH_SIZE,
        shuffle=True,
    )
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    loss_fn = nn.MSELoss()
    model.train()
    for _ in range(EPOCHS):
        for xb, yb in loader:
            optimizer.zero_grad()
            loss = loss_fn(model(xb), yb)
            loss.backward()
            optimizer.step()
    return model


def state_bytes(state):
    return sum(t.numel() * t.element_size() for t in state.values())

def main():
    started = time.time()
    data = load_traffic_dataset()

    # Preserve official train/test split; create sequences separately.
    X_train, y_train = make_sequences(data["X_train"], data["Y_train"])
    X_test, y_test = make_sequences(data["X_test"], data["Y_test"])

    print(f"Train sequences: {X_train.shape}; targets: {y_train.shape}")
    print(f"Test sequences:  {X_test.shape}; targets:  {y_test.shape}")

    central = train_centralized(X_train, y_train)
    central_metrics = evaluate(central, X_test, y_test)
    print("Centralized:", central_metrics)

    # Three disjoint client partitions of the official training split.
    partitions = np.array_split(np.arange(len(X_train)), CLIENTS)
    global_model = new_model()
    global_weights = copy.deepcopy(global_model.state_dict())
    total_communication_bytes = 0
    round_losses = []

    for round_idx in range(ROUNDS):
        updates = []
        for client_idx, indices in enumerate(partitions):
            update = train_client(
                client_id=f"client_{client_idx + 1}",
                X_train=X_train[indices],
                y_train=y_train[indices],
                input_size=INPUT_SIZE,
                global_weights=global_weights,
                epochs=EPOCHS,
                learning_rate=LR,
            )
            updates.append(update)

        # Approximate model communication: each client uploads and downloads
        # one full model state per round, excluding protocol overhead.
        model_bytes = state_bytes(global_weights)
        total_communication_bytes += 2 * CLIENTS * model_bytes

        global_weights = fedavg(updates)
        global_model.load_state_dict(global_weights)
        round_losses.append({
            "round": round_idx + 1,
            "client_training_loss": [
                float(u["training_loss"]) for u in updates
            ],
        })
        print(f"Federated round {round_idx + 1}/{ROUNDS} complete")

    federated_metrics = evaluate(global_model, X_test, y_test)
    results = {
        "dataset": "traffic_dataset.mat",
        "sequence_length": SEQ_LEN,
        "clients": CLIENTS,
        "local_epochs": EPOCHS,
        "federated_rounds": ROUNDS,
        "centralized": central_metrics,
        "federated_fedavg": federated_metrics,
        "communication": {
            "estimated_total_bytes_upload_plus_download": total_communication_bytes,
            "estimated_total_mb_upload_plus_download": total_communication_bytes / (1024 ** 2),
            "assumption": "Full model state uploaded and downloaded by each client each round; excludes protocol overhead.",
        },
        "federated_round_training_losses": round_losses,
        "runtime_seconds": round(time.time() - started, 2),
        "note": "Evaluation uses the official test split. Sequence windows are created within each split to avoid crossing train/test boundaries.",
    }

    out = ROOT / "results"
    out.mkdir(exist_ok=True)
    output_file = out / "mosaic_experiment_results.json"
    output_file.write_text(json.dumps(results, indent=2), encoding="utf-8")

    print("\n=== MOSAIC EXPERIMENT RESULTS ===")
    print(json.dumps(results, indent=2))
    print(f"\nSaved results to: {output_file}")

if __name__ == "__main__":
    main()
