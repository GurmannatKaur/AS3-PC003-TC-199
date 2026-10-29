
import { sampleDataNote, roads } from "../data/trafficSamples";
import Icon from "../components/common/Icon";

const stages = [
  {
    number: "01",
    name: "Local training",
    detail: "Each road client trains using locally held traffic data.",
    state: "Planned",
  },
  {
    number: "02",
    name: "Model updates",
    detail: "Clients submit model parameters to the coordinating server.",
    state: "Planned",
  },
  {
    number: "03",
    name: "Aggregation",
    detail: "The server combines model updates into a global model.",
    state: "Planned",
  },
  {
    number: "04",
    name: "Distribution",
    detail: "The global model is returned to participating clients.",
    state: "Planned",
  },
];

export default function FederatedLearning() {
  return (
    <div className="page-stack">
      <section className="training-hero surface">
        <div className="training-hero-copy">
          <span className="eyebrow">MODEL COLLABORATION</span>
          <h2>Intelligence, without moving raw data</h2>
          <p>
            Federated learning lets road clients learn locally and share model
            updates. The workflow below describes the design; model operations
            are not available in this build.
          </p>
          <a className="button-primary" href="/clients">
            Review configured clients <Icon name="arrow" />
          </a>
        </div>

        <div className="training-hero-state">
          <span className="state-orbit" aria-hidden="true">
            <Icon name="training" />
          </span>
          <span className="status-pill offline">
            <span />
            Model service unavailable
          </span>
          <small>No model operations have been performed.</small>
        </div>
      </section>

      <section className="summary-grid training-summary-grid">
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Global model</span>
            <span className="summary-icon">
              <Icon name="training" />
            </span>
          </div>
          <strong>—</strong>
          <small>Not deployed</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Completed rounds</span>
            <span className="summary-icon">
              <Icon name="clock" />
            </span>
          </div>
          <strong>0</strong>
          <small>No training runs recorded</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Participating nodes</span>
            <span className="summary-icon">
              <Icon name="clients" />
            </span>
          </div>
          <strong>0 / {roads.length}</strong>
          <small>Road clients are offline</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Model metrics</span>
            <span className="summary-icon">
              <Icon name="predictions" />
            </span>
          </div>
          <strong>—</strong>
          <small>Unavailable until model integration</small>
        </article>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FEDERATED WORKFLOW</span>
            <h2>How a training round works</h2>
            <p>Four steps take local learning toward shared traffic intelligence.</p>
          </div>
          <span className="count-pill">Workflow guide</span>
        </div>

        <div className="workflow-grid">
          {stages.map((stage, index) => (
            <article className="workflow-card" key={stage.number}>
              <span className="workflow-step-number">{stage.number}</span>
              {index < stages.length - 1 && (
                <span className="workflow-connector" aria-hidden="true" />
              )}
              <h3>{stage.name}</h3>
              <p>{stage.detail}</p>
              <span className="status-pill planned">
                <span />
                {stage.state}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ROAD CLIENTS</span>
            <h2>Local contributors</h2>
            <p>Each mapped road has a corresponding client location.</p>
          </div>
          <span className="count-pill">
            {roads.length.toString().padStart(2, "0")} configured
          </span>
        </div>

        <div className="training-client-list">
          {roads.map((road) => (
            <div className="training-client-row" key={road.id}>
              <span
                className={`road-marker ${road.congestion.toLowerCase()}`}
              />
              <div>
                <strong>{road.name}</strong>
                <small>
                  {road.junction} · local model {road.modelState.toLowerCase()}
                </small>
              </div>
              <span className="status-pill offline">
                <span />
                Offline
              </span>
            </div>
          ))}
        </div>

        <p className="inline-note">
          {sampleDataNote} Client participation, aggregation, and model metrics
          are not available.
        </p>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PRIVACY & COMMUNICATION</span>
            <h2>Why federated learning?</h2>
            <p>How distributed learning can support traffic intelligence.</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h3>Data Privacy</h3>
            <p>
              Raw traffic data can remain at each participating client while
              model updates are shared.
            </p>
          </div>

          <div className="info-card">
            <h3>Collaborative Learning</h3>
            <p>
              Multiple locations can contribute to a shared model that learns
              from distributed traffic patterns.
            </p>
          </div>

          <div className="info-card">
            <h3>Communication Efficiency</h3>
            <p>
              Model updates can be exchanged instead of transferring complete
              local datasets.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
