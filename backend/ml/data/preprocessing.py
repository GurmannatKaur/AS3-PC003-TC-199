import pandas as pd
from sklearn.preprocessing import MinMaxScaler

from ml.data.data_cleaning import clean_traffic_data
from ml.data.feature_engineering import create_time_features


MODEL_FEATURES = [
    "traffic_flow",
    "vehicle_count",
    "average_speed",
    "hour",
    "day_of_week",
]


def prepare_temporal_data(
    data: pd.DataFrame,
) -> tuple[pd.DataFrame, object, object, MinMaxScaler]:
    """Clean, time-feature, and scale records for the five-feature traffic model."""
    processed_data = clean_traffic_data(data)
    if "traffic_flow" not in processed_data.columns:
        raise ValueError("Traffic data must include a traffic_flow column.")

    processed_data = create_time_features(processed_data)
    if "hour" not in processed_data.columns:
        processed_data["hour"] = 0
    if "day_of_week" not in processed_data.columns:
        processed_data["day_of_week"] = 0
    for column in ("vehicle_count", "average_speed"):
        if column not in processed_data.columns:
            processed_data[column] = 0.0

    processed_data = processed_data.astype(
        {column: "float64" for column in MODEL_FEATURES}
    )
    scaler = MinMaxScaler()
    processed_data[MODEL_FEATURES] = scaler.fit_transform(
        processed_data[MODEL_FEATURES].to_numpy(dtype="float64")
    )
    features = processed_data[MODEL_FEATURES].to_numpy(dtype="float32")
    targets = processed_data["traffic_flow"].to_numpy(dtype="float32")
    return processed_data, features, targets, scaler


def preprocess_traffic_data(
    data: pd.DataFrame,
    timestamp_column: str = "timestamp",
) -> tuple[pd.DataFrame, MinMaxScaler]:
    """
    Clean and scale traffic data, returning both records and fitted scaler.
    """
    if timestamp_column != "timestamp" and timestamp_column in data.columns:
        data = data.rename(columns={timestamp_column: "timestamp"})
    processed_data, _, _, scaler = prepare_temporal_data(data)
    return processed_data, scaler