from typing import Optional


def classify_congestion(
    traffic_flow: float,
    average_speed: Optional[float] = None,
) -> str:
    """
    Classify congestion using traffic flow and average speed.

    These are configurable sample thresholds, not live traffic data.
    """

    if traffic_flow < 0:
        raise ValueError("Traffic flow cannot be negative.")

    if average_speed is not None and average_speed < 0:
        raise ValueError("Average speed cannot be negative.")

    if average_speed is not None:
        if average_speed < 15:
            return "High"
        if average_speed < 30:
            return "Moderate"
        return "Low"

    if traffic_flow >= 700:
        return "High"
    if traffic_flow >= 400:
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