
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";
import ChandigarhMap from "../components/ChandigarhMap";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import { getDashboard, getTrafficMap } from "../api/dashboardApi";
import { roads } from "../data/trafficSamples";
import { formatSpeed, usePreferences } from "../data/preferences";
import Icon from "../components/common/Icon";
import DecorativeCarAnimation from "../components/dashboard/DecorativeCarAnimation";
import type { DashboardResponse, TrafficMapResponse } from "../types/dashboard";

const trend = [38, 48, 44, 61, 58, 72, 64, 82, 77, 91, 83, 96];

const workflow = [
  {
    number: "01",
    title: "Local Training",
    description: "Each client trains its model using local traffic data.",
    status: "Planned",
  },
  {
    number: "02",
    title: "Model Updates",
    description: "Clients share model updates with the coordinating server.",
    status: "Planned",
  },
  {
    number: "03",
    title: "Global Aggregation",
    description: "The server combines updates to improve the global model.",
    status: "Planned",
  },
  {
    number: "04",
    title: "Traffic Prediction",
    description: "The global model can support future traffic predictions.",
    status: "Planned",
  },
];

export default function Overview() {
  const { speedUnit } = usePreferences();
  const selectedRoad = roads[0];
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

  return (
    <div className="page-stack page-overview">
      <header className="page-intro">
        <div className="page-intro-copy">
          <span className="eyebrow">FEDERATED TRAFFIC INTELLIGENCE</span>
          <h1>Dashboard Overview</h1>
        </div>
      </header>

      <DecorativeCarAnimation />

      {isLoading && <LoadingState message="Loading dashboard data…" />}
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
            <small>sample locations</small>
          </div>

          <div className="map-stat-chip chip-mint">
            <span><Icon name="clients" /></span>
            <strong>{dashboard?.participating_clients.toString().padStart(2, "0") ?? "—"}</strong>
            <small>configured clients</small>
          </div>

          <div className="map-stat-chip chip-yellow">
            <span><Icon name="clock" /></span>
            <strong>5–15</strong>
            <small>min prediction</small>
          </div>
        </div>

        <div className="map-caption">
          <span className="map-caption-pulse" />
          <div>
            <strong>Chandigarh road network</strong>
            <small>{trafficMap?.data_source ?? "Loading sample traffic locations"}</small>
          </div>
        </div>
      </section>

      {!isLoading && !errorMessage && trafficMap?.nodes.length === 0 && (
        <EmptyState message="No traffic locations are available from the backend." />
      )}

      <section className="summary-grid">
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Training rounds</span>
            <span className="summary-icon"><Icon name="training" /></span>
          </div>
          <strong>{dashboard?.training_round ?? "—"}</strong>
          <small>{dashboard?.data_source ?? "Awaiting backend data"}</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Configured clients</span>
            <span className="summary-icon"><Icon name="clients" /></span>
          </div>
          <strong>{dashboard?.participating_clients.toString().padStart(2, "0") ?? "—"}</strong>
          <small>Backend-reported clients</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Traffic outlook</span>
            <span className="summary-icon"><Icon name="predictions" /></span>
          </div>
          <strong>{dashboard?.predicted_traffic_status ?? "—"}</strong>
          <small>{dashboard?.data_source ?? "Awaiting backend data"}</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Model status</span>
            <span className="summary-icon"><Icon name="clock" /></span>
          </div>
          <strong>{dashboard?.global_model_status ?? "—"}</strong>
          <small>
            {dashboard && dashboard.evaluation_metrics.mae !== null
              ? `MAE ${dashboard.evaluation_metrics.mae}`
              : "No evaluated model metrics"}
          </small>
        </article>
      </section>

      <section className="overview-road-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THREE ROADS, ONE CITY</span>
            <h2>Get to know your corridors</h2>
            <p>Explore illustrative traffic conditions for each route.</p>
          </div>
          <Link className="button-link" to="/traffic-map">
            Explore the network <Icon name="arrow" />
          </Link>
        </div>

        <div className="overview-road-grid">
          {roads.map((road) => (
            <article className={`overview-road-card road-${road.id}`} key={road.id}>
              <span className="road-card-top">
                <span className={`road-marker ${road.congestion.toLowerCase()}`} />
                <span className={`traffic-level ${road.congestion.toLowerCase()}`}>
                  {road.congestion}
                </span>
              </span>

              <strong>{road.name}</strong>
              <small>{road.junction}</small>

              <span className="road-card-foot">
                <span>{formatSpeed(road.averageSpeed, speedUnit)}</span>
                <span>{road.flow.toLocaleString()} veh/h</span>
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="overview-lower-grid">
        <article className="flow-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">TRAFFIC RHYTHM</span>
              <h2>A day on the move</h2>
              <p>Illustrative traffic-flow pattern · not sensor history</p>
            </div>
          </div>

          <div
            className="trend-chart"
            role="img"
            aria-label="Illustrative traffic-flow pattern increasing through the day"
          >
            <div className="chart-y-labels">
              <span>Busy</span>
              <span>Steady</span>
              <span>Clear</span>
            </div>

            <div className="chart-bars">
              {trend.map((height, index) => (
                <span
                  key={index}
                  className="chart-bar"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${index * 35}ms`,
                  }}
                />
              ))}
            </div>

            <div className="chart-x-labels">
              <span>6 AM</span>
              <span>10 AM</span>
              <span>2 PM</span>
              <span>6 PM</span>
              <span>10 PM</span>
            </div>
          </div>
        </article>

        <article className="federated-card">
          <span className="federated-orb" aria-hidden="true">
            <Icon name="sparkle" />
          </span>
          <span className="eyebrow">FEDERATED NETWORK</span>
          <h2>Local roads. Shared intelligence.</h2>
          <p>
            Road clients represent distributed traffic locations. Model
            training and aggregation are not yet available.
          </p>

          <div className="federated-road-pills">
            {roads.map((road) => (
              <span key={road.id}>{road.name}</span>
            ))}
          </div>

          <Link className="button-link" to="/federated-learning">
            How federated learning works <Icon name="arrow" />
          </Link>
        </article>

        <article className="selected-flow-card">
          <span className="selected-flow-icon" aria-hidden="true">
            <Icon name="predictions" />
          </span>
          <span className="eyebrow">SELECTED ROAD</span>
          <h2>{selectedRoad.name}</h2>
          <p>{selectedRoad.junction} · Chandigarh</p>

          <div className="selected-flow-stats">
            <span>
              <small>Average speed</small>
              <strong>{formatSpeed(selectedRoad.averageSpeed, speedUnit)}</strong>
            </span>
            <span>
              <small>Illustrative flow</small>
              <strong>{selectedRoad.flow.toLocaleString()} veh/h</strong>
            </span>
          </div>

          <Link className="button-primary" to="/traffic-prediction">
            Explore predictions <Icon name="arrow" />
          </Link>
        </article>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FEDERATED WORKFLOW</span>
            <h2>From local learning to shared intelligence</h2>
            <p>This is the intended workflow, not a record of completed training.</p>
          </div>
          <span className="count-pill">4 stages</span>
        </div>

        <div className="workflow-grid">
          {workflow.map((step) => (
            <article className="workflow-card" key={step.number}>
              <span className="workflow-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <span className="status-pill planned">
                <span />
                {step.status}
              </span>
            </article>
          ))}
        </div>
      </section>


    </div>
  );
}
