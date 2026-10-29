import pandas as pd

from ml.data.data_cleaning import clean_traffic_data
from ml.data.feature_engineering import create_time_features


def preprocess_traffic_data(
    data: pd.DataFrame,
    timestamp_column: str = "timestamp",
) -> pd.DataFrame:
    """
    Prepare raw traffic data for model training.

    Steps:
    1. Clean missing and duplicate values.
    2. Extract time-based features.
    3. Return processed traffic data.
    """

    if data.empty:
        raise ValueError("Traffic dataset cannot be empty.")

    processed_data = clean_traffic_data(data)

    processed_data = create_time_features(
        processed_data,
        timestamp_column=timestamp_column,
    )

    return processed_data