from app.services.prediction_service import congestion_level


def forecast_from_current_flow(flow: float, horizon_minutes: int) -> dict:
    if horizon_minutes not in (5, 10, 15):
        raise ValueError("horizon_minutes must be 5, 10, or 15")
    return {
        "predicted_flow": flow,
        "congestion_level": congestion_level(flow),
        "horizon_minutes": horizon_minutes,
        "method": "persistence baseline",
    }
