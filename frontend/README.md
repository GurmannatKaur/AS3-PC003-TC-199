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
Federated Training, Predictions, and Settings. The dashboard currently uses
in-app page state rather than URL routing.

Traffic values and forecast series are demonstration data, and the map markers
are approximate. Live traffic, client connections, model training, aggregation,
and prediction services are not connected. Display preferences are held for the
current session.

The API modules remain available for future backend integration. Set
`VITE_API_BASE_URL` in `.env` when a backend URL is available.

Emergency Response Routing requests road directions from the public OSRM
service using OpenStreetMap road data. To use a self-hosted OSRM instance, set
`VITE_ROUTING_BASE_URL` to its base URL (without the `/route/v1` path). Route
distance, duration, and road names come from the provider response. OSRM uses
standard driving directions here; the emergency-service selection is context
only, and routes do not include live traffic or emergency priority. Congestion
aware routing requires a provider that exposes traffic data.
