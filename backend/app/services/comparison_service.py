from typing import Optional

from app.schemas.comparison import ModelMetrics, ModelComparisonResponse


def get_model_metrics(
    model_name: str,
    mae: Optional[float] = None,
    rmse: Optional[float] = None,
    r2_score: Optional[float] = None,
    training_time_seconds: Optional[float] = None,
    communication_cost_mb: Optional[float] = None,
    status: str = "not_trained",
) -> ModelMetrics:
    return ModelMetrics(
        model_name=model_name,
        mae=mae,
        rmse=rmse,
        r2_score=r2_score,
        training_time_seconds=training_time_seconds,
        communication_cost_mb=communication_cost_mb,
        status=status,
    )


def get_model_comparison() -> ModelComparisonResponse:
    centralized = get_model_metrics(
        model_name="Centralized Learning",
    )

    federated = get_model_metrics(
        model_name="Federated Learning (FedAvg)",
    )

    return ModelComparisonResponse(
        centralized=centralized,
        federated=federated,
        comparison_note=(
            "Model metrics will be populated after training "
            "and evaluation are completed."
        ),
    )