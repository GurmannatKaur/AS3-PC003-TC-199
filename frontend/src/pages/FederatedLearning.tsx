import "../styles/dashboard.css";

const clients = [
  {
    name: "Chandigarh",
    status: "Active",
    data: "1,240 samples",
    accuracy: "94.2%",
  },
  {
    name: "Zirakpur",
    status: "Active",
    data: "980 samples",
    accuracy: "92.8%",
  },
  {
    name: "Mohali",
    status: "Waiting",
    data: "1,105 samples",
    accuracy: "93.5%",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Local Training",
    description: "Each location trains its model using its own traffic data.",
  },
  {
    number: "02",
    title: "Model Updates",
    description: "Only model parameters are shared with the central server.",
  },
  {
    number: "03",
    title: "Aggregation",
    description: "The server combines updates to improve the global model.",
  },
  {
    number: "04",
    title: "Global Distribution",
    description: "The improved model is sent back to participating clients.",
  },
];

export default function FederatedLearning() {
  const activeClients = clients.filter(
    (client) => client.status === "Active"
  ).length;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">MODEL COLLABORATION</p>
          <h1>Federated Learning</h1>
          <p className="page-description">
            Train a shared traffic prediction model across multiple locations
            without transferring raw traffic data.
          </p>
        </div>

        <span className="status-badge status-active">
          ● System Ready
        </span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Connected Clients</span>
          <h2>{activeClients}</h2>
          <p>Traffic data sources</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Global Model Accuracy</span>
          <h2>93.5%</h2>
          <p>Current model performance</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Training Rounds</span>
          <h2>12</h2>
          <p>Completed rounds</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Data Privacy</span>
          <h2>100%</h2>
          <p>Raw data stays local</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Federated Learning Workflow</h2>
            <p>How local models contribute to the global model</p>
          </div>

          <span className="panel-badge">FedAvg</span>
        </div>

        <div className="workflow-grid">
          {workflowSteps.map((step) => (
            <div className="workflow-step" key={step.number}>
              <div className="workflow-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Participating Clients</h2>
            <p>Local training status across traffic locations</p>
          </div>

          <span className="panel-badge">
            {clients.length} Clients
          </span>
        </div>

        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Client Status</th>
                <th>Local Data</th>
                <th>Model Accuracy</th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => (
                <tr key={client.name}>
                  <td>
                    <strong>{client.name}</strong>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        client.status === "Active"
                          ? "status-active"
                          : "status-waiting"
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>

                  <td>{client.data}</td>
                  <td>{client.accuracy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Privacy & Communication</h2>
            <p>Federated training principles</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h3>Data Privacy</h3>
            <p>
              Raw traffic data remains on each participating client.
              Only model updates are shared.
            </p>
          </div>

          <div className="info-card">
            <h3>Collaborative Learning</h3>
            <p>
              Multiple locations contribute to a shared model that can
              learn from distributed traffic patterns.
            </p>
          </div>

          <div className="info-card">
            <h3>Communication Efficiency</h3>
            <p>
              Model updates are exchanged instead of transferring complete
              local datasets.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}