import argparse

from ml.centralized.trainer import train_centralized


def main() -> None:
    parser = argparse.ArgumentParser(description="Train and evaluate the centralized sample baseline.")
    parser.parse_args()
    print(train_centralized())


if __name__ == "__main__":
    main()
