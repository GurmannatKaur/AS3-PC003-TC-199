# MOSAIC Frontend

MOSAIC's traffic-intelligence interface, built with React, Vite, TypeScript, and
React Leaflet.

## Getting started

```sh
npm install
npm run dev
```

Run a production TypeScript check and build with:

```sh
npm run build
```

## Application

The shared navigation provides Overview, Traffic Network, Federated Clients,
Federated Training, Predictions, and Settings.

The frontend uses React 18, TypeScript, Vite, React Router, and React Leaflet.
Run `npm run dev` from this folder (Vite's default development origin is
`http://localhost:5173`). Run `npm run build` for the TypeScript check and
production bundle.

Copy `.env.example` to `.env` to set `VITE_API_BASE_URL`; the default backend
address is `http://127.0.0.1:8000/api`. The API modules unwrap the backend's
`{ success, message, data }` response envelope. Dashboard, traffic-map,
prediction, client, federated status/configuration, and communication-cost
pages call their corresponding FastAPI endpoints. The Settings page identifies
the application as demonstration mode. Federated training runs deterministic
local client partitions in the backend process and reports actual round,
evaluation, and serialized model-payload results. These runtime results are
held in memory and reset when the backend restarts.

The traffic-prediction endpoint uses trained weights only when both the model
and scaler artifacts exist; otherwise it reports the source as a baseline
calculation. A federated run does not create persisted model artifacts or
automatically connect its in-memory global model to that prediction endpoint.

Emergency Response Routing requests road directions from the public OSRM
service using OpenStreetMap road data. To use a self-hosted OSRM instance, set
`VITE_ROUTING_BASE_URL` to its base URL (without the `/route/v1` path). Route
distance, duration, and road names come from the provider response. OSRM uses
standard driving directions here; the emergency-service selection is context
only, and routes do not include live traffic or emergency priority. Congestion
aware routing requires a provider that exposes traffic data.
