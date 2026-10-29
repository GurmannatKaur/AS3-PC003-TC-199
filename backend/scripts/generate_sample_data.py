import argparse
from pathlib import Path

from ml.data.data_loader import generate_synthetic_clients


def main() -> None:
    parser = argparse.ArgumentParser(description="Write clearly labeled synthetic client CSVs.")
    parser.add_argument("--clients", type=int, default=3)
    parser.add_argument("--rows", type=int, default=240)
    parser.add_argument("--output", type=Path, default=Path("datasets/raw"))
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    for client_id, frame in generate_synthetic_clients(args.clients, args.rows).items():
        path = args.output / f"{client_id}-sample.csv"
        frame.to_csv(path, index=False)
        print(f"Wrote {len(frame)} sample rows to {path}")


if __name__ == "__main__":
    main()
