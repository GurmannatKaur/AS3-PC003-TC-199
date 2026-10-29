from typing import Tuple

import numpy as np


def split_dataset(
    X: np.ndarray,
    y: np.ndarray,
    train_ratio: float = 0.70,
    validation_ratio: float = 0.15,
) -> Tuple[
    np.ndarray,
    np.ndarray,
    np.ndarray,
    np.ndarray,
    np.ndarray,
    np.ndarray,
]:
    """
    Split traffic data into training, validation, and testing sets.

    Data is split chronologically to preserve traffic time-series order.
    """

    if len(X) != len(y):
        raise ValueError(
            "X and y must contain the same number of samples."
        )

    if len(X) == 0:
        raise ValueError(
            "Cannot split an empty dataset."
        )

    if train_ratio <= 0 or validation_ratio <= 0:
        raise ValueError(
            "Training and validation ratios must be positive."
        )

    if train_ratio + validation_ratio >= 1:
        raise ValueError(
            "Training and validation ratios must sum to less than 1."
        )

    total_samples = len(X)

    train_end = int(total_samples * train_ratio)

    validation_end = int(
        total_samples * (train_ratio + validation_ratio)
    )

    if train_end == 0 or validation_end <= train_end:
        raise ValueError(
            "Not enough samples for the requested split ratios."
        )

    X_train = X[:train_end]
    y_train = y[:train_end]

    X_val = X[train_end:validation_end]
    y_val = y[train_end:validation_end]

    X_test = X[validation_end:]
    y_test = y[validation_end:]

    return (
        X_train,
        X_val,
        X_test,
        y_train,
        y_val,
        y_test,
    )