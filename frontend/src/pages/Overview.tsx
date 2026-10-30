import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";
import ChandigarhMap from "../components/ChandigarhMap";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import { getDashboard, getTrafficMap } from "../api/dashboardApi";
import { formatSpeed, usePreferences } from "../data/preferences";
import Icon from "../components/common/Icon";
import DecorativeCarAnimation from "../components/dashboard/DecorativeCarAnimation";
import type { DashboardResponse, TrafficMapResponse } from "../types/dashboard";

export default function Overview() {
  const { speedUnit } = usePreferences();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [trafficMap, setTrafficMap] = useState<TrafficMapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadCounter, setReloadCounter] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const [dashboardResponse, mapResponse] = await Promise.all([
          getDashboard(controller.signal),
          getTrafficMap({ signal: controller.signal }),
        ]);
        setDashboard(dashboardResponse);
        setTrafficMap(mapResponse);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErrorMessage(
          error instanceof Error ? error.message : "Dashboard data could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadDashboard();
    return () => controller.abort();
  }, [reloadCounter]);

  const selectedRoad = trafficMap?.nodes[0];
  const metrics = dashboard?.evaluation_metrics;

  return (
    <div className="page-stack page-overview">
      <header className="page-intro">
        <div className="page-intro-copy">
          <span className="eyebrow">FEDERATED TRAFFIC INTELLIGENCE</span>
          <h1>Dashboard overview</h1>
        </div>
      </header>

      <DecorativeCarAnimation />

      {isLoading && <LoadingState message="Loading dashboard…" />}
      {errorMessage && (
        <ErrorState
          message={errorMessage}
          onRetry={() => setReloadCounter((current) => current + 1)}
        />
      )}

      <section className="overview-hero map-reveal">
        <ChandigarhMap
          className="overview-map"
          trafficNodes={trafficMap?.nodes ?? []}
        />

        <div className="map-stats-float">
          <div className="map-stat-chip chip-blue">
            <span><Icon name="network" /></span>
            <strong>{trafficMap?.total_nodes.toString().padStart(2, "0") ?? "—"}</strong>
            <small>network locations</small>
          </div>

          <div className="map-stat-chip chip-mint">
            <span><Icon name="clients" /></span>
            <strong>{dashboard?.participating_clients.toString().padStart(2, "0") ?? "—"}</strong>
            <small>local partitions</small>
          </div>

          <div className="map-stat-chip chip-yellow">
            <span><Icon name="clock" /></span>
            <strong>5–15</strong>
            <small>min forecast</small>
          </div>
        </div>

        <div className="map-caption">
          <span className="map-caption-pulse" />
          <div>
            <strong>Chandigarh road network</strong>
            <small>Traffic locations</small>
          </div>
        </div>
      </section>

      {!isLoading && !errorMessage && trafficMap?.nodes.length === 0 && (
        <EmptyState message="No traffic locations are available." />
      )}

      <section className="summary-grid">
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Current training round</span>
            <span className="summary-icon"><Icon name="training" /></span>
          </div>
          <strong>{dashboard?.training_round ?? "—"}</strong>
          <small>Federated training</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Local partitions</span>
            <span className="summary-icon"><Icon name="clients" /></span>
          </div>
          <strong>{dashboard?.participating_clients.toString().padStart(2, "0") ?? "—"}</strong>
          <small>Configured for training</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Forecast status</span>
            <span className="summary-icon"><Icon name="predictions" /></span>
          </div>
          <strong>{dashboard?.predicted_traffic_status ?? "—"}</strong>
          <small>Traffic prediction service</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Global model</span>
            <span className="summary-icon"><Icon name="clock" /></span>
          </div>
          <strong>{dashboard?.global_model_status ?? "—"}</strong>
          <small>
            {metrics?.mae !== null && metrics?.mae !== undefined
              ? `MAE ${metrics.mae.toFixed(4)}`
              : "No evaluation metrics"}
          </small>
        </article>
      </section>

      <section className="overview-road-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ROAD NETWORK</span>
            <h2>Traffic corridors</h2>
          </div>
          <Link className="button-link" to="/traffic-map">
            Explore network <Icon name="arrow" />
          </Link>
        </div>

        <div className="overview-road-grid">
          {trafficMap?.nodes.map((road) => (
            <article className={`overview-road-card road-${road.id}`} key={road.id}>
              <span className="road-card-top">
                <span className={`road-marker ${road.traffic_level.toLowerCase()}`} />
                <span className={`traffic-level ${road.traffic_level.toLowerCase()}`}>
                  {road.traffic_level}
                </span>
              </span>
              <strong>{road.name}</strong>
              <small>{road.client_status}</small>
              <span className="road-card-foot">
                <span>{formatSpeed(road.average_speed, speedUnit)}</span>
                <span>{road.vehicle_count.toLocaleString()} vehicles</span>
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="overview-lower-grid">
        <article className="flow-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MODEL EVALUATION</span>
              <h2>Global model performance</h2>
            </div>
          </div>
          {metrics?.mae !== null && metrics?.mae !== undefined ? (
            <div className="selected-flow-stats">
              <span><small>MAE</small><strong>{metrics.mae.toFixed(4)}</strong></span>
              <span><small>RMSE</small><strong>{metrics.rmse?.toFixed(4) ?? "—"}</strong></span>
              <span><small>R²</small><strong>{metrics.r2?.toFixed(4) ?? "—"}</strong></span>
            </div>
          ) : (
            <EmptyState message="Model metrics will appear after training." />
          )}
        </article>

        <article className="federated-card">
          <span className="federated-orb" aria-hidden="true">
            <Icon name="sparkle" />
          </span>
          <span className="eyebrow">FEDERATED TRAINING</span>
          <h2>{dashboard?.global_model_status ?? "Loading status"}</h2>
          <p>
            {dashboard?.training_round
              ? `${dashboard.training_round} training rounds recorded.`
              : "Run a local training session and review its results."}
          </p>
          <Link className="button-link" to="/federated-learning">
            View training results <Icon name="arrow" />
          </Link>
        </article>

        <article className="selected-flow-card">
          <span className="selected-flow-icon" aria-hidden="true">
            <Icon name="predictions" />
          </span>
          <span className="eyebrow">SELECTED LOCATION</span>
          <h2>{selectedRoad?.name ?? "No location selected"}</h2>
          <p>{selectedRoad?.traffic_level ?? "Traffic data unavailable"}</p>
          {selectedRoad && (
            <div className="selected-flow-stats">
              <span>
                <small>Average speed</small>
                <strong>{formatSpeed(selectedRoad.average_speed, speedUnit)}</strong>
              </span>
              <span>
                <small>Vehicles</small>
                <strong>{selectedRoad.vehicle_count.toLocaleString()}</strong>
              </span>
            </div>
          )}
          <Link className="button-primary" to="/traffic-prediction">
            Explore predictions <Icon name="arrow" />
          </Link>
        </article>
      </section>
    </div>
  );
}
