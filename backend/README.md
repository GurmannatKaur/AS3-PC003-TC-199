# MOSAIC Backend

FastAPI service and research pipeline for the MOSAIC federated traffic-flow prediction
hackathon project (AS3-PC003-TC-199). This repository contains no real traffic feed or
trained model. Synthetic Chandigarh–Zirakpur-style segments and generated traffic records
are explicitly labeled sample data.

## Features

- FastAPI endpoints with consistent `{ "success", "message", "data" }` responses and Swagger UI.
- CSV validation, cleaning, UTC timestamp parsing, temporal feature engineering, and leakage-safe time splits.
- Configurable PyTorch LSTM model, centralized sample baseline, custom sample-count-weighted FedAvg, and training scripts.
- Federated clients train locally; only serialized parameter state dictionaries are used as server updates.
- Upload/download byte counts are measured from actual `torch.save`-serialized payloads; client download bytes count the serialized global parameters delivered to each client in that round.
- MAE, MSE, RMSE, and R² calculation, SQLite SQLAlchemy models, and result/model output folders.
- Sample traffic map, congestion status, baseline predictions, and shortest-time sample route support.

## Setup

Use Python 3.10 or later (3.11 recommended):

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

`.env` controls the database, CORS origins, data/result/model directories, and training defaults.
The checked-in local `.env` contains development defaults only; do not put credentials in it.
SQLite is used by default and requires no separate service.

## Run the API

From `backend/`:

```powershell
uvicorn main:app --reload
```

Interactive API documentation: <http://127.0.0.1:8000/docs>. Health check:
<http://127.0.0.1:8000/api/health>. CORS permits `http://localhost:5173` by default.

## Sample data and model workflows

Generate synthetic client data in a Python shell:

```python
from ml.data.data_loader import generate_synthetic_clients
clients = generate_synthetic_clients(client_count=3, rows_per_client=240)
```

Write sample CSV files for local testing:

```powershell
python scripts/generate_sample_data.py --clients 3 --rows 240
```

Generated frames contain `timestamp`, `traffic_flow`, `vehicle_count`, `average_speed`,
`road_segment`, and `client_id`. This is simulated sample data, not a sensor measurement.

```powershell
python scripts/train_centralized.py --epochs 5
python scripts/train_federated.py --rounds 3 --local-epochs 2
python scripts/run_experiment.py
python scripts/prepare_dataset.py datasets/raw/client-1.csv
pytest
```

Federated training stores the global PyTorch weights after every completed round under
`saved_models/federated/global.pt`. Clients' raw records remain local within the training
process; only state dictionaries are aggregated. The API's start operation runs training in a
background thread and its stop request takes effect between rounds.

CSV integration: place one CSV per client in `datasets/raw/`. `timestamp` and `traffic_flow`
are required; `vehicle_count`, `average_speed`, `road_segment`, and `client_id` are optional.
The centralized and federated trainers load each CSV as a distinct client when CSVs are
present; otherwise they fall back to the included generator. Use the prepare script to
parse/clean and write the result into `datasets/processed/`. Point each training process to a
local copy of client files in its configured raw-data directory. No real dataset or provider-
specific column mapping was supplied, so provider-specific integration remains a TODO.

The evaluation metrics utility computes errors from paired predictions/labels. There is no
claim of model accuracy until a model has actually been trained and evaluated. The
`/api/model-comparison` route reports `not_evaluated` until both training approaches have
been evaluated on the same held-out dataset.

## API

All routes are prefixed with `/api`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Service status |
| GET | `/dashboard` | Dashboard summary and latest training information |
| GET | `/traffic/map` | Sample nodes/segments; accepts `status=low\|moderate\|high` and `include_offline` |
| GET | `/traffic/predictions?horizon_minutes=5` | Sample-data forecast |
| POST | `/traffic/predict` | Predict from flow/speed/count; uses trained model if present, otherwise labels a persistence baseline |
| GET | `/federated/status` | Lifecycle state |
| POST | `/federated/start` | Start background FedAvg run |
| POST | `/federated/stop` | Request stop between rounds |
| GET | `/federated/rounds` | Round history |
| GET | `/federated/clients` | Simulated client list |
| GET | `/communication-cost` | Aggregate serialized payload byte totals |
| GET | `/communication-cost/rounds` | Per-round and per-client byte totals |
| GET | `/model-comparison` | Latest evaluation report or not-evaluated status |
| GET | `/congestion` | Sample congestion levels |
| POST | `/emergency-route` | Route between known sample locations; not live emergency dispatch |

Supported prediction horizons: 5, 10, and 15 minutes. A sample emergency route body:
`{"origin":"Chandigarh","destination":"Zirakpur"}`.

## Project layout

`app/` contains the HTTP API, configuration, SQLAlchemy entities, validation schemas, and
business services. `ml/data`, `ml/models`, `ml/centralized`, `ml/federated`,
`ml/evaluation`, `ml/communication`, and `ml/prediction` separate ML responsibilities.
`scripts/` provides local commands; `datasets/`, `saved_models/`, and `results/` are runtime
data/output locations. SQLite tables are created on startup; `migrations/README.md` documents
the future migration location.
