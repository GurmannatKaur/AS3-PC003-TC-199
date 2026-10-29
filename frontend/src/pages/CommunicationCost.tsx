import "../styles/dashboard.css";
import "../styles/CommunicationCost.css";
import Icon from "../components/common/Icon";

const communicationData = [
  {
    location: "Chandigarh",
    localData: "1,240 records",
    updateSizeMB: 2.4,
    rounds: 12,
  },
  {
    location: "Zirakpur",
    localData: "980 records",
    updateSizeMB: 1.9,
    rounds: 12,
  },
  {
    location: "Mohali",
    localData: "1,105 records",
    updateSizeMB: 2.1,
    rounds: 12,
  },
];

export default function CommunicationCost() {
  const participatingClients = communicationData.length;

  const totalRounds = Math.max(
    ...communicationData.map((item) => item.rounds)
  );

  const totalUpdateSizeMB = communicationData.reduce(
    (total, item) => total + item.updateSizeMB,
    0
  );

  const totalCommunicationMB = communicationData.reduce(
    (total, item) => total + item.updateSizeMB * item.rounds,
    0
  );

  const formatMB = (value: number) => `${value.toFixed(1)} MB`;

  return (
    <div className="page-stack">
      <header className="page-intro">
        <div className="page-intro-copy">
          <span className="eyebrow">NETWORK EFFICIENCY</span>
          <h1>Communication Cost</h1>
          <p className="page-subtitle">
            Evaluate the communication overhead involved in sharing model
            updates during federated traffic prediction across the Chandigarh
            corridor network. Transfer figures are illustrative estimates, not
            measured network activity.
          </p>
        </div>

        <div className="status-pill active">
          <span />
          Analysis Ready
        </div>
      </header>

      <section className="summary-grid">
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Participating Clients</span>
            <span className="summary-icon">
              <Icon name="clients" />
            </span>
          </div>
          <strong>{participatingClients.toString().padStart(2, "0")}</strong>
          <small>Connected network nodes</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Training Rounds</span>
            <span className="summary-icon">
              <Icon name="training" />
            </span>
          </div>
          <strong>{totalRounds.toString().padStart(2, "0")}</strong>
          <small>Federated update cycles</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Update Size / Round</span>
            <span className="summary-icon">
              <Icon name="network" />
            </span>
          </div>
          <strong>{formatMB(totalUpdateSizeMB)}</strong>
          <small>Combined parameter payload</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Estimated Total Transfer</span>
            <span className="summary-icon">
              <Icon name="clock" />
            </span>
          </div>
          <strong>{formatMB(totalCommunicationMB)}</strong>
          <small>Across all 12 rounds</small>
        </article>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ARCHITECTURAL OVERVIEW</span>
            <h2>Centralized vs. Federated Overhead</h2>
            <p>Comparing raw sensor data streaming with decentralized gradient parameter sharing.</p>
          </div>
        </div>

        <div className="comm-compare-grid">
          <div className="comm-compare-card">
            <div className="comm-compare-head">
              <h3>Centralized Learning</h3>
              <span className="comm-badge high">High Transfer</span>
            </div>
            <p>
              Raw continuous traffic telemetry and video/sensor logs from all intersections
              are transmitted to a central server for batch training, incurring heavy bandwidth
              and privacy costs.
            </p>
            <div className="comm-compare-stat">
              <span>Estimated Raw Ingestion</span>
              <strong>~420 MB / hr</strong>
            </div>
          </div>

          <div className="comm-compare-card recommended">
            <div className="comm-compare-head">
              <h3>Federated Learning</h3>
              <span className="comm-badge efficient">82% Reduction</span>
            </div>
            <p>
              Local models are trained privately on edge clients at each corridor. Only compact
              model weight updates are transmitted to the coordinator during aggregation rounds.
            </p>
            <div className="comm-compare-stat">
              <span>Model Update Transfer</span>
              <strong>6.4 MB / round</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CORRIDOR TELEMETRY PAYLOAD</span>
            <h2>Client Communication Details</h2>
            <p>Breakdown of model update payload and round transfers per participating traffic client.</p>
          </div>
          <span className="count-pill">{communicationData.length} clients</span>
        </div>

        <div className="comm-table-container">
          <table className="comm-table">
            <thead>
              <tr>
                <th>Location / Corridor</th>
                <th>Local Dataset</th>
                <th>Update Size</th>
                <th>Training Rounds</th>
                <th>Total Cumulative Transfer</th>
              </tr>
            </thead>

            <tbody>
              {communicationData.map((item) => (
                <tr key={item.location}>
                  <td>
                    <strong>{item.location}</strong>
                    <small>Chandigarh Capital Region</small>
                  </td>
                  <td>{item.localData}</td>
                  <td>{formatMB(item.updateSizeMB)}</td>
                  <td>{item.rounds} rounds</td>
                  <td>
                    <span className="comm-transfer-pill">
                      {formatMB(item.updateSizeMB * item.rounds)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MATHEMATICAL FORMULATION</span>
            <h2>Communication Cost Formula</h2>
            <p>Analytical method used to calculate distributed training communication overhead.</p>
          </div>
        </div>

        <div className="comm-formula-box">
          <div className="comm-formula-equation">
            <span className="comm-formula-plain">
              Total Communication Cost = Update Size &times; Training Rounds &times; Clients
            </span>
          </div>
          <p className="comm-formula-detail">
            In federated traffic prediction, total uplink cost is bounded by the model architecture
            parameter count and client participation frequency. Local data remains on client nodes,
            preserving corridor privacy while reducing bandwidth consumption by over 80% relative to
            raw video/sensor streaming.
          </p>
        </div>
      </section>
    </div>
  );
}
