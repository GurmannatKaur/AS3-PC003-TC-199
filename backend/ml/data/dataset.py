import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset


class TrafficDataset(Dataset):
    """
    PyTorch Dataset for traffic-flow time-series data.
    Creates input sequences and corresponding future targets.
    """

    def __init__(
        self,
        data: pd.DataFrame | np.ndarray,
        target_column: int | str = 0,
        sequence_length: int = 12,
        prediction_horizon: int = 1,
    ):
        if sequence_length <= 0 or prediction_horizon <= 0:
            raise ValueError(
                "Sequence length and prediction horizon must be positive."
            )

        if isinstance(data, pd.DataFrame):
            if isinstance(target_column, str):
                if target_column not in data.columns:
                    raise ValueError(
                        f"Target column '{target_column}' not found."
                    )

                target_values = data[target_column].to_numpy(
                    dtype=np.float32
                )
            else:
                target_values = data.iloc[:, target_column].to_numpy(
                    dtype=np.float32
                )

            feature_values = data.to_numpy(dtype=np.float32)

        else:
            feature_values = np.asarray(
                data, dtype=np.float32
            )

            if feature_values.ndim == 1:
                feature_values = feature_values.reshape(-1, 1)

            target_values = feature_values[:, target_column]

        if len(feature_values) < sequence_length + prediction_horizon:
            raise ValueError(
                "Not enough data for the requested sequence length "
                "and prediction horizon."
            )

        self.features = torch.tensor(
            feature_values, dtype=torch.float32
        )

        self.targets = torch.tensor(
            target_values, dtype=torch.float32
        )

        self.sequence_length = sequence_length
        self.prediction_horizon = prediction_horizon

        self.sample_count = (
            len(feature_values)
            - sequence_length
            - prediction_horizon
            + 1
        )

    def __len__(self):
        return self.sample_count

    def __getitem__(self, index):
        start = index
        end = start + self.sequence_length

        x = self.features[start:end]

        target_index = end + self.prediction_horizon - 1
        y = self.targets[target_index]

        return x, y.unsqueeze(0)