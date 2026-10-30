from collections.abc import Mapping
from numbers import Integral

import torch


def fedavg(
    client_weights: list[Mapping[str, torch.Tensor]],
    client_samples: list[int],
) -> dict[str, torch.Tensor]:
    """Aggregate compatible state dictionaries, weighted by sample counts."""
    return aggregate_model_weights(client_weights, client_samples)


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

    if any(
        isinstance(samples, bool)
        or not isinstance(samples, Integral)
        or samples < 0
        for samples in client_samples
    ):
        raise ValueError("Sample counts must be non-negative integers.")

    total_samples = sum(client_samples)

    if total_samples == 0:
        raise ValueError("Total client samples must be greater than zero.")

    if not isinstance(client_weights[0], Mapping) or not client_weights[0]:
        raise ValueError("Client model weights must be non-empty mappings.")

    reference_keys = set(client_weights[0].keys())
    for weights in client_weights:
        if not isinstance(weights, Mapping) or not weights:
            raise ValueError("Client model weights must be non-empty mappings.")
        if set(weights.keys()) != reference_keys:
            raise ValueError(
                "All client models must have matching parameter keys."
            )

    aggregated_weights: dict[str, torch.Tensor] = {}

    for key in client_weights[0]:
        reference_tensor = client_weights[0][key]
        if not isinstance(key, str) or not isinstance(reference_tensor, torch.Tensor):
            raise ValueError("State dictionaries must map string keys to tensors.")

        for weights in client_weights[1:]:
            tensor = weights[key]
            if not isinstance(tensor, torch.Tensor):
                raise ValueError(
                    f"State dictionary entry '{key}' must be a tensor."
                )
            if (
                tensor.shape != reference_tensor.shape
                or tensor.dtype != reference_tensor.dtype
                or tensor.layout != reference_tensor.layout
            ):
                raise ValueError(
                    f"State dictionary entry '{key}' has incompatible shape, "
                    "dtype, or layout."
                )

        if not torch.is_floating_point(reference_tensor):
            aggregated_weights[key] = reference_tensor.clone()
            continue

        weighted_sum = torch.zeros_like(reference_tensor)

        for weights, samples in zip(client_weights, client_samples):
            weighted_sum += weights[key] * (samples / total_samples)

        aggregated_weights[key] = weighted_sum

    return aggregated_weights