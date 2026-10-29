import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

print("Project root:", ROOT)
print("Loading traffic dataset...")

from backend.ml.data.traffic_mat_loader import load_traffic_dataset

data = load_traffic_dataset()

for name, array in data.items():
    print(f"{name}: shape={array.shape}, dtype={array.dtype}")

print("Dataset loader test passed!")
