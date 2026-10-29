
from pathlib import Path
import numpy as np
from scipy.io import loadmat

DATA_PATH = (
    Path(__file__).resolve().parents[1]
    / "backend"
    / "datasets"
    / "raw"
    / "traffic_dataset.mat"
)


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    data = loadmat(DATA_PATH)

    print(f"Dataset: {DATA_PATH}")
    print("\nMATLAB variables:")

    for name, value in data.items():
        if name.startswith("__"):
            continue

        array = np.asarray(value)
        print(f"\n{name}: shape={array.shape}, dtype={array.dtype}")

        if name in {"tra_X_tr", "tra_X_te"} and array.size:
            sample = array.flat[0]
            print(f"  First sample shape: {np.asarray(sample).shape}")

        if np.issubdtype(array.dtype, np.number):
            print(f"  Contains NaN: {np.isnan(array).any()}")
            print(f"  Contains infinity: {np.isinf(array).any()}")


if __name__ == "__main__":
    main()
