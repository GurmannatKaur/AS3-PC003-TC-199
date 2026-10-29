import torch

from ml.federated.aggregation import aggregate_model_weights


def fedavg(
    client_updates: list[dict],
) -> dict[str, torch.Tensor]:
    """
    Perform Federated Averaging (FedAvg).

    Each client update must contain:
    - model_weights
    - num_samples
    """

    if not client_updates:
        raise ValueError("No client updates were provided.")

    client_weights = []
    client_samples = []

    for update in client_updates:
        if "model_weights" not in update:
            raise ValueError("Client update is missing model_weights.")

        if "num_samples" not in update:
            raise ValueError("Client update is missing num_samples.")

        client_weights.append(update["model_weights"])
        client_samples.append(int(update["num_samples"]))

    return aggregate_model_weights(
        client_weights=client_weights,
        client_samples=client_samples,
    )
