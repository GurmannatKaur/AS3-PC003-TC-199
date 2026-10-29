from backend.ml.data.traffic_mat_loader import load_traffic_dataset

data = load_traffic_dataset()

for name, array in data.items():
    print(f"{name}: shape={array.shape}, dtype={array.dtype}")

print("\nDataset loader test passed!")