from pathlib import Path

import numpy as np
import pandas as pd


def generate_synthetic_clients(
    client_count: int = 3,
    rows_per_client: int = 240,
) -> dict[str, pd.DataFrame]:
    """Generate deterministic synthetic traffic records for local tests only."""
    if isinstance(client_count, bool) or not isinstance(client_count, int) or client_count < 1:
        raise ValueError("client_count must be a positive integer.")
    if isinstance(rows_per_client, bool) or not isinstance(rows_per_client, int) or rows_per_client < 1:
        raise ValueError("rows_per_client must be a positive integer.")

    index = np.arange(rows_per_client, dtype=np.float64)
    daily_pattern = np.sin(2 * np.pi * index / 288)
    short_pattern = np.sin(2 * np.pi * index / 24)
    traffic_flow = 500 + 150 * daily_pattern + 35 * short_pattern
    vehicle_count = 120 + 40 * daily_pattern + 10 * short_pattern
    average_speed = 45 - 12 * daily_pattern - 3 * short_pattern
    timestamps = pd.date_range(
        "2025-01-01T00:00:00Z",
        periods=rows_per_client,
        freq="5min",
    )

    return {
        f"client_{client_index:02d}": pd.DataFrame(
            {
                "timestamp": timestamps,
                "traffic_flow": traffic_flow.copy(),
                "vehicle_count": vehicle_count.copy(),
                "average_speed": average_speed.copy(),
                "road_segment": f"synthetic_segment_{client_index:02d}",
                "client_id": f"client_{client_index:02d}",
                "data_source": "synthetic",
            }
        )
        for client_index in range(1, client_count + 1)
    }


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