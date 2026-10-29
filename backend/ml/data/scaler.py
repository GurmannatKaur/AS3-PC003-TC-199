import numpy as np
from sklearn.preprocessing import MinMaxScaler


class TrafficDataScaler:
    """
    Scale traffic features to the range [0, 1].

    Fit the scaler on training data only to avoid data leakage.
    """

    def __init__(self):
        self.scaler = MinMaxScaler()
        self.is_fitted = False

    def fit(self, data: np.ndarray):
        data = np.asarray(data, dtype=np.float32)

        if data.ndim == 1:
            data = data.reshape(-1, 1)

        self.scaler.fit(data)
        self.is_fitted = True

        return self

    def transform(self, data: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError(
                "Scaler must be fitted before transforming data."
            )

        data = np.asarray(data, dtype=np.float32)

        if data.ndim == 1:
            data = data.reshape(-1, 1)

        return self.scaler.transform(data).astype(np.float32)

    def fit_transform(self, data: np.ndarray) -> np.ndarray:
        self.fit(data)
        return self.transform(data)

    def inverse_transform(self, data: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError(
                "Scaler must be fitted before inverse transforming data."
            )

        data = np.asarray(data, dtype=np.float32)

        if data.ndim == 1:
            data = data.reshape(-1, 1)

        return self.scaler.inverse_transform(data).astype(np.float32)