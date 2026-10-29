
import "../styles/dashboard.css";

const communicationData = [
  {
    location: "Chandigarh",
    localData: "1,240 samples",
    updateSizeMB: 2.4,
    rounds: 12,
  },
  {
    location: "Zirakpur",
    localData: "980 samples",
    updateSizeMB: 1.9,
    rounds: 12,
  },
  {
    location: "Mohali",
    localData: "1,105 samples",
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
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">NETWORK EFFICIENCY</p>

          <h1>Communication Cost</h1>

          <p className="page-description">
            Evaluate the communication overhead involved in sharing model
            updates during federated traffic prediction.
          </p>
        </div>

        <span className="status-badge status-active">
          ● Analysis Ready
        </span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">
            Participating Clients
          </span>

          <h2>{participatingClients}</h2>

          <p>Connected locations</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            Training Rounds
          </span>

          <h2>{totalRounds}</h2>

          <p>Model update rounds</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            Update Size Per Round
          </span>

          <h2>{formatMB(totalUpdateSizeMB)}</h2>

          <p>Combined client updates</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            Estimated Total Transfer
          </span>

          <h2>{formatMB(totalCommunicationMB)}</h2>

          <p>Across all training rounds</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Communication Overview</h2>

            <p>
              Comparison of data sharing approaches
            </p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h3>Centralized Learning</h3>

            <p>
              Raw traffic data from each location is transferred to a central
              server for training.
            </p>

            <div className="cost-indicator">
              <span>Data Transfer</span>
              <strong>High</strong>
            </div>
          </div>

          <div className="info-card">
            <h3>Federated Learning</h3>

            <p>
              Local models are trained at each location. Only model updates
              are sent to the central server.
            </p>

            <div className="cost-indicator">
              <span>Data Transfer</span>
              <strong>Reduced</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Client Communication Details</h2>

            <p>
              Illustrative values for the dashboard prototype
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Local Data</th>
                <th>Update Size</th>
                <th>Training Rounds</th>
                <th>Total Transfer</th>
              </tr>
            </thead>

            <tbody>
              {communicationData.map((item) => (
                <tr key={item.location}>
                  <td>{item.location}</td>

                  <td>{item.localData}</td>

                  <td>{formatMB(item.updateSizeMB)}</td>

                  <td>{item.rounds}</td>

                  <td>
                    {formatMB(item.updateSizeMB * item.rounds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Communication Cost Formula</h2>

            <p>
              Estimate total transmitted model updates
            </p>
          </div>
        </div>

        <div className="formula-card">
          <p className="formula">
            Total Communication Cost = Update Size × Training Rounds × Clients
          </p>

          <p className="formula-note">
            For this prototype, the total is calculated by adding the update
            size of each client across its training rounds. Actual communication
            cost depends on model size, number of clients, training rounds,
            synchronization frequency, and network overhead.
          </p>
        </div>
      </section>

      <footer className="dashboard-footer">
        <span>MOSAIC · Federated Traffic Intelligence</span>

        <span>Illustrative Data · Backend Integration Pending</span>
      </footer>
    </div>
  );
}
