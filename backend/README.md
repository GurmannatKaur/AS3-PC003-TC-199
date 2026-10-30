# MOSAIC Backend

FastAPI service and research pipeline for the MOSAIC federated traffic-flow prediction
hackathon project (AS3-PC003-TC-199). This repository contains no real traffic feed or
trained model. Synthetic Chandigarh–Zirakpur-style segments and generated traffic records
are explicitly labeled sample data.

## Features

- FastAPI endpoints with consistent `{ "success", "message", "data" }` responses and Swagger UI.
- CSV validation, cleaning, UTC timestamp parsing, temporal feature engineering, and leakage-safe time splits.
- Configurable PyTorch LSTM model, sample-count-weighted FedAvg helpers, and local ML modules.
- The HTTP federated start endpoint is not wired to a training pipeline.
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
Copy `.env.example` to `.env`; do not put credentials in this development configuration.
SQLite is used by default and requires no separate service.

## Run the API

From `backend/`:

```powershell
uvicorn main:app --reload
```

Interactive API documentation: <http://127.0.0.1:8000/docs>. Health check:
<http://127.0.0.1:8000/api/health>. CORS permits the Vite origins
`http://localhost:5173` and `http://127.0.0.1:5173` by default.

## Data and model status

No real traffic feed or trained weights are bundled. Authorized CSV files may be
placed under `datasets/raw/`; `timestamp` and `traffic_flow` are required for
the current data-preparation helpers. Provider-specific column mapping is not
implemented.

The sample generator and federated training command currently reference
`generate_synthetic_clients` and `train_federated_sync`, which are not defined
in the checked-in ML modules. The HTTP federated start endpoint accepts a
configuration only; it does not start a training thread or load client CSVs.
The prediction endpoint reads global PyTorch weights from
`saved_models/federated/global.pt` and the matching `input_scaler.json` when both
are present; no such artifacts are currently checked in.
The scaler JSON must contain five-element `mean` and `scale` arrays in the
feature order `[traffic_flow, vehicle_count, average_speed, UTC hour, UTC day
of week]`. The request currently supplies one observation, which is repeated
to fill the model's input window and is identified as such in the response.

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
| GET | `/traffic/map` | Sample nodes; accepts `traffic_level` (or `status`) and `include_offline` filters |
| GET | `/traffic/predictions?horizon_minutes=5` | Sample-data forecast |
| POST | `/traffic/predict` | Predict from location, flow, vehicle count, speed, and horizon; uses federated weights plus scaler when both exist, otherwise returns a labeled sample calculation |
| GET | `/federated/status` | Lifecycle state |
| POST | `/federated/start` | Accept training configuration; does not execute training |
| POST | `/federated/stop` | Clear configured state; no active trainer is connected |
| GET | `/federated/rounds` | Round history |
| GET | `/federated/clients` | Simulated client list |
| GET | `/communication-cost` | Aggregate serialized payload byte totals |
| GET | `/communication-cost/rounds` | Per-round byte totals |
| GET | `/model-comparison` | Latest evaluation report or not-evaluated status |
| GET | `/congestion` | Sample congestion levels |
| POST | `/emergency-route` | Route between known sample locations; not live emergency dispatch |

Supported prediction horizons: 5, 10, and 15 minutes. A sample emergency route body:
`{"origin":"Chandigarh","destination":"Zirakpur"}`.

`POST /traffic/predict` accepts `location`, `current_flow`, `vehicle_count`,
`average_speed`, and `horizon_minutes`. It loads
`saved_models/federated/global.pt` and `saved_models/federated/input_scaler.json`
when both artifacts are present. If neither exists, the endpoint returns the
explicitly labeled sample calculation and `is_model_prediction: false`; if only
one artifact exists, it returns HTTP 503 rather than silently falling back.
For model inference, the current observation is repeated to fill the model's
input window; the response data source explicitly identifies this limitation.
The repository currently has no trained federated weights/scaler. The federated
start endpoint accepts a configuration but does not execute the ML training
pipeline, and reports that limitation explicitly.

## Project layout

`app/` contains the HTTP API, configuration, SQLAlchemy entities, validation schemas, and
business services. `ml/data`, `ml/models`, `ml/centralized`, `ml/federated`,
`ml/evaluation`, `ml/communication`, and `ml/prediction` separate ML responsibilities.
`scripts/` provides local commands; `datasets/`, `saved_models/`, and `results/` are runtime
data/output locations. SQLite tables are created on startup; `migrations/README.md` documents
the future migration location.
