"""Dataset download is source-specific; use --help for the supported local workflow."""
import argparse


def main() -> None:
    parser = argparse.ArgumentParser(
        description="No third-party dataset URL is configured; place licensed CSV files in datasets/raw."
    )
    parser.parse_args()
    print("No external dataset is bundled. Add an authorized CSV to datasets/raw.")


if __name__ == "__main__":
    main()
