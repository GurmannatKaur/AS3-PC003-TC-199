
from scipy.io import loadmat
from scipy import sparse
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
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

# Start with sensor 0
sensor_id = 0

X_train_sensor = X_train[:, sensor_id, :]
X_test_sensor = X_test[:, sensor_id, :]

y_train_sensor = Y_train[:, sensor_id]
y_test_sensor = Y_test[:, sensor_id]

# Train the model
model = LinearRegression()
model.fit(X_train_sensor, y_train_sensor)

# Predict unseen test data
predictions = model.predict(X_test_sensor)

mae = mean_absolute_error(y_test_sensor, predictions)
rmse = np.sqrt(mean_squared_error(y_test_sensor, predictions))

print("MOSAIC - Linear Regression Baseline")
print("Sensor:", sensor_id)
print("Training samples:", len(y_train_sensor))
print("Testing samples:", len(y_test_sensor))
print(f"MAE:  {mae:.6f}")
print(f"RMSE: {rmse:.6f}")

print("\nFirst 5 predictions vs actual values:")
for predicted, actual in zip(predictions[:5], y_test_sensor[:5]):
    print(f"Predicted: {predicted:.6f} | Actual: {actual:.6f}")
