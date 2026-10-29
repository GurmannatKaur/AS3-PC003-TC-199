import argparse

from ml.federated.trainer import train_federated_sync


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--rounds", type=int, default=3)
    parser.add_argument("--local-epochs", type=int, default=2)
    args = parser.parse_args()
    print(train_federated_sync(rounds=args.rounds, local_epochs=args.local_epochs))


if __name__ == "__main__":
    main()
