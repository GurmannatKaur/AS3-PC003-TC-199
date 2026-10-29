
from scipy.io import loadmat
from scipy import sparse
import numpy as np

file_path = r"C:\Users\Admin\Downloads\traffic+flow+forecasting\traffic_dataset.mat"
data = loadmat(file_path)

def convert_inputs(raw_inputs):
    intervals = []

    for i in range(raw_inputs.shape[1]):
        matrix = raw_inputs[0, i]

        if sparse.issparse(matrix):
            matrix = matrix.toarray()

        intervals.append(np.asarray(matrix, dtype=np.float64))

    return np.stack(intervals)

X_train = convert_inputs(data["tra_X_tr"])
X_test = convert_inputs(data["tra_X_te"])

Y_train = data["tra_Y_tr"].T
Y_test = data["tra_Y_te"].T

print("Data preparation complete!")
print("X_train:", X_train.shape)
print("Y_train:", Y_train.shape)
print("X_test:", X_test.shape)
print("Y_test:", Y_test.shape)

print("\nTraining inputs contain NaN:", np.isnan(X_train).any())
print("Training targets contain NaN:", np.isnan(Y_train).any())
print("Test inputs contain NaN:", np.isnan(X_test).any())
print("Test targets contain NaN:", np.isnan(Y_test).any())
