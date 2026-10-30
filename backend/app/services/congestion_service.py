from math import isfinite
from typing import Optional


def classify_congestion(
    traffic_flow: float,
    average_speed: Optional[float] = None,
) -> str:
    """
    Classify congestion using traffic flow and average speed.

    These illustrative thresholds are shared by API and prediction paths.
    """

    if not isfinite(traffic_flow):
        raise ValueError("Traffic flow must be finite.")
    if traffic_flow < 0:
        raise ValueError("Traffic flow cannot be negative.")

    if average_speed is not None:
        if not isfinite(average_speed):
            raise ValueError("Average speed must be finite.")
        if average_speed < 0:
            raise ValueError("Average speed cannot be negative.")

    if traffic_flow >= 800 or (
        average_speed is not None and average_speed < 20
    ):
        return "High"
    if traffic_flow >= 400 or (
        average_speed is not None and average_speed < 40
    ):
        return "Moderate"

    return "Low"


def get_congestion_details(
    traffic_flow: float,
    average_speed: Optional[float] = None,
) -> dict:
    level = classify_congestion(
        traffic_flow=traffic_flow,
        average_speed=average_speed,
    )

    return {
        "traffic_flow": traffic_flow,
        "average_speed": average_speed,
        "congestion_level": level,
        "data_source": "sample_thresholds",
        "is_live": False,
    }