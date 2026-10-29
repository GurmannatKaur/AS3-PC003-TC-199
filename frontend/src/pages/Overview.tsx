
import { Link } from "react-router-dom";
import "../styles/dashboard.css";
import ChandigarhMap from "../components/ChandigarhMap";
import { roads } from "../data/trafficSamples";
import { formatSpeed, usePreferences } from "../data/preferences";
import Icon from "../components/common/Icon";

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

  return (
    <div className="page-stack">
      <section className="overview-hero map-reveal">
        <ChandigarhMap className="overview-map" />

        <div className="map-stats-float">
          <div className="map-stat-chip chip-blue">
            <span><Icon name="network" /></span>
            <strong>{roads.length.toString().padStart(2, "0")}</strong>
            <small>key corridors</small>
          </div>

          <div className="map-stat-chip chip-mint">
            <span><Icon name="clients" /></span>
            <strong>{roads.length.toString().padStart(2, "0")}</strong>
            <small>road clients</small>
          </div>

          <div className="map-stat-chip chip-yellow">
            <span><Icon name="clock" /></span>
            <strong>15–60</strong>
            <small>min outlook</small>
          </div>
        </div>

        <div className="map-caption">
          <span className="map-caption-pulse" />
          <div>
            <strong>Chandigarh road network</strong>
            <small>Sample scenario · approximate corridor markers</small>
          </div>
        </div>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Training rounds</span>
            <span className="summary-icon"><Icon name="training" /></span>
          </div>
          <strong>0</strong>
          <small>No training runs recorded</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Configured clients</span>
            <span className="summary-icon"><Icon name="clients" /></span>
          </div>
          <strong>{roads.length.toString().padStart(2, "0")}</strong>
          <small>Sample road locations</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Traffic outlook</span>
            <span className="summary-icon"><Icon name="predictions" /></span>
          </div>
          <strong>Sample</strong>
          <small>Not a live prediction</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Model status</span>
            <span className="summary-icon"><Icon name="clock" /></span>
          </div>
          <strong>Offline</strong>
          <small>Model integration pending</small>
        </article>
      </section>

      <section className="overview-road-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THREE ROADS, ONE CITY</span>
            <h2>Get to know your corridors</h2>
            <p>Explore the sample traffic picture for each route.</p>
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
              <p>Sample traffic-flow pattern · not sensor history</p>
            </div>
            <span className="sample-pill">SAMPLE</span>
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
          <span className="eyebrow">SAMPLE ROAD</span>
          <h2>{selectedRoad.name}</h2>
          <p>{selectedRoad.junction} · Chandigarh</p>

          <div className="selected-flow-stats">
            <span>
              <small>Average speed</small>
              <strong>{formatSpeed(selectedRoad.averageSpeed, speedUnit)}</strong>
            </span>
            <span>
              <small>Sample flow</small>
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

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">QUICK ACTIONS</span>
            <h2>Explore MOSAIC</h2>
            <p>Navigate to the main dashboard features.</p>
          </div>
        </div>

        <div className="info-grid">
          <Link className="info-card" to="/traffic-map">
            <h3>Traffic Network <Icon name="arrow" /></h3>
            <p>Explore the mapped sample road corridors.</p>
          </Link>

          <Link className="info-card" to="/clients">
            <h3>Federated Clients <Icon name="arrow" /></h3>
            <p>Review the configured traffic clients.</p>
          </Link>

          <Link className="info-card" to="/communication-cost">
            <h3>Communication Cost <Icon name="arrow" /></h3>
            <p>Review the illustrative model-update transfer estimates.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
