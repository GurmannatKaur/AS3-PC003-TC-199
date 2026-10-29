from typing import Dict

import numpy as np

from ml.evaluation.metrics import calculate_metrics


def compare_model_predictions(
    y_true: np.ndarray,
    predictions: Dict[str, np.ndarray],
) -> dict:
    """
    Compare the performance of multiple traffic prediction models.

    Args:
        y_true: Actual traffic-flow values.
        predictions: Dictionary mapping model names to predictions.

    Returns:
        Dictionary containing evaluation metrics for each model.
    """

    if not predictions:
        raise ValueError(
            "At least one model prediction is required."
        )

    results = {}

    for model_name, y_pred in predictions.items():
        results[model_name] = calculate_metrics(
            y_true,
            y_pred,
        )

    return results