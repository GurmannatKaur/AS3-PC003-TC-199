from fastapi import APIRouter

router = APIRouter()

comparison_results = {
    "centralized": {
        "mae": None,
        "mse": None,
        "rmse": None,
        "r2": None,
    },
    "federated": {
        "mae": None,
        "mse": None,
        "rmse": None,
        "r2": None,
    },
    "status": "Models have not been trained or evaluated",
}


@router.get("")
def get_model_comparison():
    return {
        "comparison": comparison_results,
        "data_source": "No evaluation results available yet",
    }


@router.get("/metrics")
def get_model_metrics():
    return {
        "metrics": comparison_results,
        "available_metrics": ["MAE", "MSE", "RMSE", "R2"],
    }