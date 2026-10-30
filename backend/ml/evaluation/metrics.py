import numpy as np
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)


def calculate_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
) -> dict:
    """
    Calculate regression metrics for traffic-flow predictions.
    """

    y_true = np.asarray(y_true, dtype=np.float64).reshape(-1)
    y_pred = np.asarray(y_pred, dtype=np.float64).reshape(-1)

    if y_true.size == 0 or y_pred.size == 0:
        raise ValueError("Actual and predicted values cannot be empty.")

    if y_true.shape != y_pred.shape:
        raise ValueError(
            "Actual and predicted values must have the same shape."
        )

    if not np.isfinite(y_true).all() or not np.isfinite(y_pred).all():
        raise ValueError(
            "Actual and predicted values must be finite."
        )

    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = float(np.sqrt(mse))
    r2 = r2_score(y_true, y_pred)

    return {
        "MAE": float(mae),
        "MSE": float(mse),
        "RMSE": rmse,
        "R2": float(r2),
        "mae": float(mae),
        "mse": float(mse),
        "rmse": rmse,
        "r2": float(r2),
    }