# Datasets

Put authorized client CSV files under `raw/`; normalized output belongs in `processed/`.
Required columns are `timestamp` and `traffic_flow`. Optional columns are `vehicle_count`,
`average_speed`, `road_segment`, and `client_id`. Missing optional values are handled during
cleaning. Timestamps are parsed as UTC and records are sorted chronologically.

No real traffic data is bundled. The built-in synthetic generator is for testing the pipeline
only and its output is labeled as sample data in API responses and training reports.

Run `python scripts/prepare_dataset.py datasets/raw/client-1.csv` from `backend/` to clean a
CSV. Keep different client datasets separate; federated clients train locally from their own
files and upload serialized model parameters only.
