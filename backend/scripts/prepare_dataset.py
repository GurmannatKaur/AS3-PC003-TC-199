import argparse
from pathlib import Path

from ml.data.data_cleaning import clean_traffic_data
from ml.data.data_loader import load_traffic_csv


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path, default=Path("datasets/processed/traffic.csv"))
    args = parser.parse_args()
    cleaned = clean_traffic_data(load_traffic_csv(args.input))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    cleaned.to_csv(args.output, index=False)
    print(f"Prepared {len(cleaned)} rows at {args.output}")


if __name__ == "__main__":
    main()
