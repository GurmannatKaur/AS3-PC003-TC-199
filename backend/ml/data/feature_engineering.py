import pandas as pd


def create_time_features(
    data: pd.DataFrame,
    timestamp_column: str = "timestamp",
) -> pd.DataFrame:
    """
    Extract time-based features from traffic data.

    Adds hour, day of week, and weekend indicators
    when a timestamp column is available.
    """

    if data.empty:
        raise ValueError("The traffic dataset is empty.")

    data = data.copy()

    if timestamp_column not in data.columns:
        return data

    data[timestamp_column] = pd.to_datetime(
        data[timestamp_column],
        errors="coerce",
    )

    data = data.dropna(subset=[timestamp_column])

    data["hour"] = data[timestamp_column].dt.hour
    data["day_of_week"] = data[timestamp_column].dt.dayofweek
    data["is_weekend"] = (
        data["day_of_week"] >= 5
    ).astype(int)

    return data.reset_index(drop=True)