from collections.abc import Mapping

import torch


def aggregate_model_weights(
    client_weights: list[Mapping[str, torch.Tensor]],
    client_samples: list[int],
) -> dict[str, torch.Tensor]:
    """
    Aggregate client model weights using sample-weighted FedAvg.
    """

    if not client_weights:
        raise ValueError("No client model weights were provided.")

    if len(client_weights) != len(client_samples):
        raise ValueError(
            "Client weights and sample counts must have equal lengths."
        )

    if any(samples < 0 for samples in client_samples):
        raise ValueError("Sample counts cannot be negative.")

    total_samples = sum(client_samples)

    if total_samples == 0:
        raise ValueError("Total client samples must be greater than zero.")

    reference_keys = set(client_weights[0].keys())

    for weights in client_weights:
        if set(weights.keys()) != reference_keys:
            raise ValueError(
                "All client models must have matching parameter keys."
            )

    aggregated_weights = {}

    for key in client_weights[0]:
        reference_tensor = client_weights[0][key]

        if not torch.is_floating_point(reference_tensor):
            aggregated_weights[key] = reference_tensor.clone()
            continue

        weighted_sum = torch.zeros_like(reference_tensor)

        for weights, samples in zip(client_weights, client_samples):
            weighted_sum += weights[key] * (
                samples / total_samples
            )

        aggregated_weights[key] = weighted_sum

    return aggregated_weights