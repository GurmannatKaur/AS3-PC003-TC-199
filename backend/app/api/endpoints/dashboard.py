from fastapi import APIRouter

router = APIRouter()


@router.get("/dashboard")
def get_dashboard():
    return {
        "training_round": 0,
        "participating_clients": 4,
        "predicted_traffic_status": "Moderate",
        "global_model_status": "Idle",
        "evaluation_metrics": {
            "mae": None,
            "mse": None,
            "rmse": None,
            "r2": None,
        },
        "communication_cost_mb": 0.0,
        "recent_training_rounds": [],
        "data_source": "Sample data",
    }