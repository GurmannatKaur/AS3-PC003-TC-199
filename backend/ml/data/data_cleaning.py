import pandas as pd
import numpy as np


def clean_traffic_data(data: pd.DataFrame) -> pd.DataFrame:
    """
    Clean traffic data by handling missing values,
    duplicate rows, and invalid numeric values.
    """

    if data.empty:
        raise ValueError("The traffic dataset is empty.")

    data = data.copy()

    # Remove duplicate rows
    data = data.drop_duplicates()

    # Replace infinite values with NaN
    data = data.replace([np.inf, -np.inf], np.nan)

    # Handle missing numeric values
    numeric_columns = data.select_dtypes(
        include=[np.number]
    ).columns

    for column in numeric_columns:
        data[column] = data[column].fillna(
            data[column].median()
        )

    # Handle missing non-numeric values
    non_numeric_columns = data.select_dtypes(
        exclude=[np.number]
    ).columns

    for column in non_numeric_columns:
        if data[column].isna().any():
            mode_values = data[column].mode()

            if not mode_values.empty:
                data[column] = data[column].fillna(
                    mode_values.iloc[0]
                )

    # Remove rows that still contain missing values
    data = data.dropna()

    return data.reset_index(drop=True)