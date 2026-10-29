from pathlib import Path

import pandas as pd


def load_traffic_data(file_path: str | Path) -> pd.DataFrame:
    """
    Load traffic data from a CSV file.
    """

    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"Traffic dataset not found: {file_path}"
        )

    if file_path.suffix.lower() != ".csv":
        raise ValueError(
            "Currently, only CSV traffic datasets are supported."
        )

    data = pd.read_csv(file_path)

    if data.empty:
        raise ValueError(
            "The traffic dataset is empty."
        )

    return data