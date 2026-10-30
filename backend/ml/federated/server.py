from collections.abc import Mapping

import torch

from ml.federated.fedavg import fedavg


class FederatedServer:
    """
    Coordinates federated model aggregation.

    The server receives client model updates and aggregates
    them into a global model using FedAvg.
    """

    def __init__(
        self,
        initial_weights: Mapping[str, torch.Tensor] | None = None,
    ):
        self.global_weights = (
            {
                key: value.detach().cpu().clone()
                for key, value in initial_weights.items()
            }
            if initial_weights is not None
            else None
        )

        self.global_model_version = 0

    def get_global_weights(self) -> dict[str, torch.Tensor] | None:
        if self.global_weights is None:
            return None

        return {
            key: value.clone()
            for key, value in self.global_weights.items()
        }

    def aggregate_updates(
        self,
        client_updates: list[dict],
    ) -> dict[str, torch.Tensor]:
        if not client_updates:
            raise ValueError("No client updates were provided.")

        aggregated_weights = fedavg(client_updates)

        self.global_weights = {
            key: value.detach().cpu().clone()
            for key, value in aggregated_weights.items()
        }

        self.global_model_version += 1

        return self.get_global_weights()

    def get_model_version(self) -> str:
        return f"v{self.global_model_version}"