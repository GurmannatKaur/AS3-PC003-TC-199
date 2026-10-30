
from pathlib import Path

import numpy as np
from scipy.io import loadmat


DEFAULT_DATA_PATH = (
    Path(__file__).resolve().parents[2]
    / "datasets"
    / "raw"
    / "traffic_dataset.mat"
)


def _unpack_samples(values, name):
    """Convert MATLAB object cells containing sparse matrices to a dense array."""
    samples = []

    for index, sample in enumerate(np.asarray(values).ravel()):
        if hasattr(sample, "toarray"):
            sample = sample.toarray()

        sample = np.asarray(sample, dtype=np.float32)

        if sample.shape != (36, 48):
            raise ValueError(
                f"{name}[{index}] has shape {sample.shape}; expected (36, 48)"
            )

        samples.append(sample)

    result = np.stack(samples, axis=0)

    if not np.isfinite(result).all():
        raise ValueError(f"{name} contains NaN or infinite values")

    return result


def load_traffic_dataset(path=DEFAULT_DATA_PATH):
    """Load the official traffic-flow train/test split and sensor adjacency matrix."""
    path = Path(path)

    if not path.is_file():
        raise FileNotFoundError(f"Traffic dataset not found: {path}")

    data = loadmat(path)

    required = {
        "tra_X_tr",
        "tra_X_te",
        "tra_Y_tr",
        "tra_Y_te",
        "tra_adj_mat",
    }
    missing = required.difference(data)

    if missing:
        raise ValueError(f"Missing MATLAB variables: {sorted(missing)}")

    X_train = _unpack_samples(data["tra_X_tr"], "tra_X_tr")
    X_test = _unpack_samples(data["tra_X_te"], "tra_X_te")

    Y_train = np.asarray(data["tra_Y_tr"], dtype=np.float32).T
    Y_test = np.asarray(data["tra_Y_te"], dtype=np.float32).T
    adjacency = np.asarray(data["tra_adj_mat"], dtype=np.float32)

    if Y_train.shape != (len(X_train), 36):
        raise ValueError(f"Unexpected Y_train shape: {Y_train.shape}")

    if Y_test.shape != (len(X_test), 36):
        raise ValueError(f"Unexpected Y_test shape: {Y_test.shape}")

    if adjacency.shape != (36, 36):
        raise ValueError(f"Unexpected adjacency shape: {adjacency.shape}")

    for name, array in {
        "Y_train": Y_train,
        "Y_test": Y_test,
        "adjacency": adjacency,
    }.items():
        if not np.isfinite(array).all():
            raise ValueError(f"{name} contains NaN or infinite values")

    return {
        "X_train": X_train,
        "Y_train": Y_train,
        "X_test": X_test,
        "Y_test": Y_test,
        "adjacency": adjacency,
    }
