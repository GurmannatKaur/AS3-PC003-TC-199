
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


def inspect_samples(name, values):
    values = np.asarray(values)
    print(f"\n{name}: shape={values.shape}, dtype={values.dtype}")

    for index in [0, 1, 2]:
        sample = values.flat[index]
        print(f"\n  Sample {index}:")
        print(f"    Python type: {type(sample)}")

        if hasattr(sample, "shape"):
            print(f"    Shape: {sample.shape}")
            print(f"    Dtype: {getattr(sample, 'dtype', None)}")

        try:
            unpacked = np.asarray(sample.toarray() if hasattr(sample, "toarray") else sample)
            print(f"    Array shape: {unpacked.shape}")
            print(f"    Array size: {unpacked.size}")

            if unpacked.size:
                print(f"    First values: {unpacked.reshape(-1)[:8]}")
        except Exception as exc:
            print(f"    Inspection error: {exc}")


def main():
    data = loadmat(DATA_PATH)

    inspect_samples("tra_X_tr", data["tra_X_tr"])
    inspect_samples("tra_X_te", data["tra_X_te"])

    for name in ["tra_Y_tr", "tra_Y_te", "tra_adj_mat"]:
        array = np.asarray(data[name])
        print(f"\n{name}: shape={array.shape}, dtype={array.dtype}")


if __name__ == "__main__":
    main()
