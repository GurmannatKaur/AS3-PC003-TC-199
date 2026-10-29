import numpy as np

from ml.evaluation.metrics import calculate_metrics


class TrafficModelEvaluator:
    """
    Evaluate traffic-flow prediction performance.
    """

    def evaluate(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
    ) -> dict:
        """
        Calculate regression metrics for traffic predictions.
        """

        return calculate_metrics(y_true, y_pred)

    def compare_models(
        self,
        actual: np.ndarray,
        predictions: dict[str, np.ndarray],
    ) -> dict:
        """
        Evaluate multiple traffic prediction models.
        """

        results = {}

        for model_name, predicted_values in predictions.items():
            results[model_name] = calculate_metrics(
                actual,
                predicted_values,
            )

        return results