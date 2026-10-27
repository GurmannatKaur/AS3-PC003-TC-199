import "../styles/dashboard.css";

const communicationData = [
  {
    location: "Chandigarh",
    localData: "1,240 samples",
    updateSize: "2.4 MB",
    rounds: 12,
  },
  {
    location: "Zirakpur",
    localData: "980 samples",
    updateSize: "1.9 MB",
    rounds: 12,
  },
  {
    location: "Mohali",
    localData: "1,105 samples",
    updateSize: "2.1 MB",
    rounds: 12,
  },
];

export default function CommunicationCost() {
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
          <span className="stat-label">Participating Clients</span>
          <h2>3</h2>
          <p>Connected locations</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Training Rounds</span>
          <h2>12</h2>
          <p>Model update rounds</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Update Size</span>
          <h2>6.4 MB</h2>
          <p>Illustrative per-round estimate</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Data Transfer Strategy</span>
          <h2>FL</h2>
          <p>Model updates instead of raw data</p>
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
            <p>Illustrative values for the dashboard prototype</p>
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
              </tr>
            </thead>

            <tbody>
              {communicationData.map((item) => (
                <tr key={item.location}>
                  <td>{item.location}</td>
                  <td>{item.localData}</td>
                  <td>{item.updateSize}</td>
                  <td>{item.rounds}</td>
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
            <p>Estimate total transmitted model updates</p>
          </div>
        </div>

        <div className="formula-card">
          <p className="formula">
            Total Communication Cost = Update Size × Training Rounds × Clients
          </p>

          <p className="formula-note">
            Actual communication cost depends on model size, number of clients,
            training rounds, and the frequency of model synchronization.
          </p>
        </div>
      </section>
    </div>
  );
}