import { useEffect, useState } from "react";
import "../styles/dashboard.css";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import Icon from "../components/common/Icon";
import { getTrafficMap } from "../api/dashboardApi";
import { predictTraffic } from "../api/predictionApi";
import { usePreferences } from "../data/preferences";
import type { TrafficMapNode } from "../types/dashboard";
import type {
  PredictionHorizon,
  TrafficPredictionResponse,
} from "../types/prediction";

const horizons: PredictionHorizon[] = [5, 10, 15];

export default function TrafficPrediction() {
  const { defaultHorizon, setDefaultHorizon } = usePreferences();
  const [trafficNodes, setTrafficNodes] = useState<TrafficMapNode[]>([]);
  const [selectedRoadId, setSelectedRoadId] = useState("");
  const [currentFlow, setCurrentFlow] = useState(500);
  const [submittedFlow, setSubmittedFlow] = useState(500);
  const [predictionRequestKey, setPredictionRequestKey] = useState(0);
  const [mapRetryKey, setMapRetryKey] = useState(0);
  const [mapLoading, setMapLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mapError, setMapError] = useState("");
  const [forecastByHorizon, setForecastByHorizon] = useState<
    Partial<Record<PredictionHorizon, TrafficPredictionResponse>>
  >({});
  const [comparisonForecasts, setComparisonForecasts] = useState<
    Record<string, TrafficPredictionResponse>
  >({});

  useEffect(() => {
    const controller = new AbortController();
    const loadMap = async () => {
      setMapLoading(true);
      setMapError("");
      try {
        const response = await getTrafficMap({ signal: controller.signal });
        setTrafficNodes(response.nodes);
        setSelectedRoadId((current) =>
          response.nodes.some((node) => node.id === current)
            ? current
            : response.nodes[0]?.id ?? "",
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMapError(
          error instanceof Error ? error.message : "Traffic locations could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setMapLoading(false);
      }
    };

    void loadMap();
    return () => controller.abort();
  }, [mapRetryKey]);

  const selectedRoad = trafficNodes.find((road) => road.id === selectedRoadId);

  useEffect(() => {
    if (!selectedRoad || trafficNodes.length === 0) return;

    const controller = new AbortController();
    const loadForecasts = async () => {
      setForecastLoading(true);
      setErrorMessage("");
      setForecastByHorizon({});
      setComparisonForecasts({});
      try {
        const requestPrediction = (
          road: TrafficMapNode,
          horizon: PredictionHorizon,
        ) =>
          predictTraffic(
            {
              location: road.name,
              current_flow: submittedFlow,
              vehicle_count: road.vehicle_count,
              average_speed: road.average_speed,
              horizon_minutes: horizon,
            },
            controller.signal,
          );

        const [horizonResults, comparisonResults] = await Promise.all([
          Promise.all(
            horizons.map((horizon) => requestPrediction(selectedRoad, horizon)),
          ),
          Promise.all(
            trafficNodes.map((road) => requestPrediction(road, defaultHorizon)),
          ),
        ]);
        if (controller.signal.aborted) return;
        setForecastByHorizon(
          Object.fromEntries(
            horizonResults.map((result) => [result.horizon_minutes, result]),
          ),
        );
        setComparisonForecasts(
          Object.fromEntries(
            comparisonResults.map((result) => [result.location, result]),
          ),
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErrorMessage(
          error instanceof Error ? error.message : "Traffic predictions could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setForecastLoading(false);
      }
    };

    void loadForecasts();
    return () => controller.abort();
  }, [selectedRoad, trafficNodes, defaultHorizon, submittedFlow, predictionRequestKey]);

  const selectedForecast = forecastByHorizon[defaultHorizon];
  const chartPoints = selectedRoad && selectedForecast
    ? [
        {
          label: "Now",
          value: submittedFlow,
          level: selectedRoad.traffic_level,
        },
        {
          label: `+${selectedForecast.horizon_minutes} min`,
          value: selectedForecast.predicted_flow,
          level: selectedForecast.congestion_level,
        },
      ]
    : [];
  const maxFlow = Math.max(1, ...chartPoints.map((point) => point.value));

  return (
    <div className="page-stack">
      <section className="prediction-controls surface">
        <div>
          <span className="eyebrow">FORECAST EXPLORER</span>
          <h2>Corridor outlook</h2>
          <p>Set a flow input and location to request a backend estimate.</p>
        </div>

        <div className="prediction-selectors">
          <label className="select-control">
            Road
            <select
              value={selectedRoadId}
              onChange={(event) => setSelectedRoadId(event.target.value)}
              disabled={mapLoading || trafficNodes.length === 0}
            >
              {trafficNodes.map((road) => (
                <option value={road.id} key={road.id}>
                  {road.name}
                </option>
              ))}
            </select>
          </label>

          <label className="select-control">
            Flow input (veh/h)
            <input
              type="number"
              min="0"
              step="1"
              value={currentFlow}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value) && value >= 0) setCurrentFlow(value);
              }}
            />
          </label>

          <button
            className="button-primary"
            type="button"
            onClick={() => {
              setSubmittedFlow(currentFlow);
              setPredictionRequestKey((current) => current + 1);
            }}
          >
            Run prediction
          </button>

          <fieldset className="segmented-control">
            <legend>Forecast window</legend>
            {horizons.map((value) => (
              <button
                type="button"
                key={value}
                className={defaultHorizon === value ? "active" : ""}
                onClick={() => setDefaultHorizon(value)}
                aria-pressed={defaultHorizon === value}
              >
                {value} min
              </button>
            ))}
          </fieldset>
        </div>
      </section>

      {mapLoading && <LoadingState message="Loading prediction locations…" />}
      {mapError && (
        <ErrorState
          message={mapError}
          onRetry={() => setMapRetryKey((current) => current + 1)}
        />
      )}
      {!mapLoading && !mapError && trafficNodes.length === 0 && (
        <EmptyState message="No traffic locations are available for prediction." />
      )}
      {forecastLoading && <LoadingState message="Requesting traffic predictions…" />}
      {errorMessage && (
        <ErrorState
          message={errorMessage}
          onRetry={() => setPredictionRequestKey((current) => current + 1)}
        />
      )}

      {selectedRoad && selectedForecast && (
        <div className="forecast-disclaimer">
          <span aria-hidden="true">
            <Icon name="sparkle" />
          </span>
          <p>
            <strong>
              {selectedForecast.is_model_prediction
                ? "Trained-model inference"
                : "Sample calculation"}
            </strong>
            {" · "}{selectedForecast.data_source}
          </p>
        </div>
      )}

      {selectedRoad && selectedForecast && (
        <>
          <section className="summary-grid prediction-summary-grid">
            <article className="summary-card">
              <div className="summary-card-heading">
                <span>Current flow input</span>
                <span className="summary-icon">
                  <Icon name="predictions" />
                </span>
              </div>
              <strong>
                {submittedFlow.toLocaleString()} <em>veh/h</em>
              </strong>
              <small>{selectedRoad.name}</small>
            </article>

            <article className="summary-card">
              <div className="summary-card-heading">
                <span>Predicted flow</span>
                <span className="summary-icon">
                  <Icon name="clock" />
                </span>
              </div>
              <strong>
                {selectedForecast.predicted_flow.toLocaleString()} <em>veh/h</em>
              </strong>
              <small>At +{defaultHorizon} minutes</small>
            </article>

            <article className="summary-card">
              <div className="summary-card-heading">
                <span>Predicted congestion</span>
                <span className="summary-icon">
                  <Icon name="network" />
                </span>
              </div>
              <strong>
                <span
                  className={`congestion-dot ${selectedForecast.congestion_level.toLowerCase()}`}
                />
                {selectedForecast.congestion_level}
              </strong>
              <small>
                {selectedForecast.is_model_prediction
                  ? "Classified from model output"
                  : "Sample calculation classification"}
              </small>
            </article>
          </section>

          <section className="surface forecast-chart-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">TRAFFIC FLOW</span>
                <h2>{selectedRoad.name} forecast</h2>
                <p>Backend prediction for the selected {defaultHorizon}-minute horizon</p>
              </div>
            </div>

            <div
              className="forecast-chart"
              role="img"
              aria-label={`Traffic prediction for ${selectedRoad.name}`}
            >
              <div className="forecast-scale">
                <span>{maxFlow.toLocaleString()}</span>
                <span>{Math.round(maxFlow * 0.66).toLocaleString()}</span>
                <span>{Math.round(maxFlow * 0.33).toLocaleString()}</span>
                <span>0</span>
              </div>

              <div className="forecast-bars">
                {chartPoints.map((point) => (
                  <div className="forecast-column" key={point.label}>
                    <strong className="forecast-value">
                      {point.value.toLocaleString()}
                    </strong>
                    <div className="forecast-bar-track">
                      <span
                        className={`forecast-bar ${point.level.toLowerCase()}`}
                        style={{ height: `${(point.value / maxFlow) * 100}%` }}
                      />
                    </div>
                    <span className="forecast-time">{point.label}</span>
                    <span className={`traffic-level ${point.level.toLowerCase()}`}>
                      {point.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="surface">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ROAD COMPARISON</span>
                <h2>Corridor outlook</h2>
                <p>Backend predictions for each corridor at the selected horizon.</p>
              </div>
              <span className="count-pill">+{defaultHorizon} minutes</span>
            </div>

            <div className="road-forecast-list">
              {trafficNodes.map((road) => {
                const forecast = comparisonForecasts[road.name];
                return (
                  <button
                    type="button"
                    className={`road-forecast-row ${
                      road.id === selectedRoad.id ? "selected" : ""
                    }`}
                    key={road.id}
                    onClick={() => setSelectedRoadId(road.id)}
                  >
                    <span
                      className={`road-marker ${(forecast?.congestion_level ?? road.traffic_level).toLowerCase()}`}
                    />
                    <span className="road-row-info">
                      <strong>{road.name}</strong>
                      <small>{forecast?.data_source ?? "Prediction pending"}</small>
                    </span>
                    <span className="forecast-flow">
                      {forecast?.predicted_flow.toLocaleString() ?? "—"}{" "}
                      <small>veh/h</small>
                    </span>
                    {forecast ? (
                      <span
                        className={`traffic-level ${forecast.congestion_level.toLowerCase()}`}
                      >
                        {forecast.congestion_level}
                      </span>
                    ) : (
                      <span className="traffic-level">Pending</span>
                    )}
                    <Icon className="row-chevron" name="arrow" />
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
