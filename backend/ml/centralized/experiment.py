from pathlib import Path
import json
from datetime import datetime

from app.core.config import settings
from ml.centralized.evaluator import evaluate_model


def save_experiment_results(
    experiment_name: str,
    metrics: dict,
    parameters: dict | None = None,
) -> dict:
    """
    Save experiment metrics and parameters to a JSON file.
    """

    settings.RESULTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    experiment_data = {
        "experiment_name": experiment_name,
        "created_at": datetime.utcnow().isoformat(),
        "parameters": parameters or {},
        "metrics": metrics,
        "data_source": "synthetic",
    }

    filename = (
        f"{experiment_name.replace(' ', '_')}_"
        f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    )

    file_path = settings.RESULTS_DIR / filename

    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(
            experiment_data,
            file,
            indent=4,
        )

    return {
        "status": "saved",
        "file_path": str(file_path),
        "experiment": experiment_data,
    }


def run_evaluation(
    actual_values: list[float],
    predicted_values: list[float],
) -> dict:
    return evaluate_model(
        actual_values=actual_values,
        predicted_values=predicted_values,
    )