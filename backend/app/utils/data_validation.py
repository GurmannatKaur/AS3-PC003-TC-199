from pathlib import Path

import pandas as pd

REQUIRED_COLUMNS = {"timestamp", "traffic_flow"}


def validate_traffic_frame(frame: pd.DataFrame) -> pd.DataFrame:
    missing = REQUIRED_COLUMNS - set(frame.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {', '.join(sorted(missing))}")
    if frame.empty:
        raise ValueError("Traffic dataset must contain at least one row")
    return frame


def validate_csv_path(path: Path) -> Path:
    resolved = path.expanduser().resolve()
    if not resolved.is_file() or resolved.suffix.lower() != ".csv":
        raise ValueError(f"Expected an existing CSV file, got: {resolved}")
    return resolved
