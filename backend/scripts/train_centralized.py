import argparse

from ml.centralized.trainer import train_centralized


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=5)
    args = parser.parse_args()
    print(train_centralized(epochs=args.epochs))


if __name__ == "__main__":
    main()
