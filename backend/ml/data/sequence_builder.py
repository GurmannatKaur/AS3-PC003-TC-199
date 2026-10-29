import numpy as np


def create_sequences(
    features: np.ndarray,
    target: np.ndarray,
    sequence_length: int = 12,
    prediction_horizon: int = 1,
):
    """
    Convert traffic time-series data into input sequences
    and future prediction targets.
    """

    features = np.asarray(features, dtype=np.float32)
    target = np.asarray(target, dtype=np.float32)

    if features.ndim == 1:
        features = features.reshape(-1, 1)

    if target.ndim == 1:
        target = target.reshape(-1, 1)

    if len(features) != len(target):
        raise ValueError(
            "Features and targets must have the same number of rows."
        )

    if sequence_length <= 0 or prediction_horizon <= 0:
        raise ValueError(
            "Sequence length and prediction horizon must be positive."
        )

    total_samples = (
        len(features) - sequence_length - prediction_horizon + 1
    )

    if total_samples <= 0:
        raise ValueError(
            "Not enough traffic data to create sequences."
        )

    X = []
    y = []

    for i in range(total_samples):
        input_end = i + sequence_length
        target_index = input_end + prediction_horizon - 1

        X.append(features[i:input_end])
        y.append(target[target_index])

    return (
        np.asarray(X, dtype=np.float32),
        np.asarray(y, dtype=np.float32),
    )