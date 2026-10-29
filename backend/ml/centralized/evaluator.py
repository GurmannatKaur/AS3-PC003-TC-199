import numpy as np

from sklearn.metrics import mean_absolute_error
from sklearn.metrics import mean_squared_error
from sklearn.metrics import r2_score


def evaluate_model(
    actual_values: list[float],
    predicted_values: list[float],
) -> dict:
    if len(actual_values) == 0 or len(predicted_values) == 0:
        raise ValueError("Input values cannot be empty.")

    if len(actual_values) != len(predicted_values):
        raise ValueError(
            "Actual and predicted values must have the same length."
        )

    mae = mean_absolute_error(
        actual_values,
        predicted_values,
    )

    rmse = np.sqrt(
        mean_squared_error(
            actual_values,
            predicted_values,
        )
    )

    r2 = (
        r2_score(actual_values, predicted_values)
        if len(actual_values) >= 2
        else None
    )

    return {
        "mae": float(mae),
        "rmse": float(rmse),
        "r2_score": float(r2) if r2 is not None else None,
    }