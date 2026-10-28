
import "../styles/dashboard.css";
import ChandigarhMap from "../components/ChandigarhMap";

type OverviewProps = {
  onNavigate: (page: string) => void;
};

const metrics = [
  {
    title: "Training Round",
    value: "01",
    subtitle: "Current federated round",
    icon: "↻",
  },
  {
    title: "Participating Clients",
    value: "03",
    subtitle: "Connected traffic nodes",
    icon: "⌘",
  },
  {
    title: "Predicted Traffic",
    value: "Moderate",
    subtitle: "Next 15 minutes",
    icon: "↗",
  },
  {
    title: "Model Status",
    value: "Idle",
    subtitle: "Waiting for training",
    icon: "◉",
  },
];

const workflow = [
  {
    number: "01",
    title: "Local Training",
    description: "Each client trains its model using local traffic data.",
    status: "Ready",
  },
  {
    number: "02",
    title: "Model Updates",
    description: "Clients send model updates to the central server.",
    status: "Pending",
  },
  {
    number: "03",
    title: "Global Aggregation",
    description: "The server combines updates using FedAvg.",
    status: "Pending",
  },
  {
    number: "04",
    title: "Traffic Prediction",
    description: "The global model predicts upcoming traffic flow.",
    status: "Pending",
  },
];

export default function Overview({ onNavigate }: OverviewProps) {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <div>
            <h2>MOSAIC</h2>
            <p>Federated Intelligence</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">WORKSPACE</p>

          <a className="nav-item active" href="#">
            <span>▦</span>
            Overview
          </a>

          <a className="nav-item" href="#">
            <span>⌁</span>
            Traffic Network
          </a>

          <a className="nav-item" href="#">
            <span>◈</span>
            Federated Training
          </a>

          <a className="nav-item" href="#">
            <span>⌁</span>
            Predictions
          </a>

          <p className="nav-label second-label">SYSTEM</p>

          <a className="nav-item" href="#">
            <span>⚙</span>
            Settings
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <span>System Ready</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Overview</p>
            <h1>Dashboard Overview</h1>
            <p className="page-subtitle">
              Monitor your federated traffic prediction network.
            </p>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications">
              ♧
            </button>

            <button className="profile-button">
              <span className="profile-avatar">SK</span>
              <span className="profile-name">Admin</span>
              <span>⌄</span>
            </button>
          </div>
        </header>

        <section className="metrics-grid">
          {metrics.map((metric) => (
            <div className="metric-card" key={metric.title}>
              <div className="metric-top">
                <p>{metric.title}</p>
                <span className="metric-icon">{metric.icon}</span>
              </div>

              <h2>{metric.value}</h2>
              <p className="metric-subtitle">{metric.subtitle}</p>
            </div>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel workflow-panel">
            <div className="panel-heading">
              <div>
                <h2>Federated Learning Workflow</h2>
                <p>Overview of the model training pipeline</p>
              </div>
              <span className="panel-badge">FedAvg</span>
            </div>

            <div className="workflow-list">
              {workflow.map((step, index) => (
                <div className="workflow-step" key={step.number}>
                  <div className="workflow-number">{step.number}</div>

                  <div className="workflow-info">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>

                  <span
                    className={`workflow-status ${
                      index === 0 ? "ready" : "pending"
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel performance-panel">
            <div className="panel-heading">
              <div>
                <h2>Model Performance</h2>
                <p>Global model evaluation</p>
              </div>
              <span className="metric-icon">⌁</span>
            </div>

            <div className="performance-content">
              <div className="performance-value">
                <span>Accuracy</span>
                <strong>--</strong>
              </div>

              <div className="performance-value">
                <span>Loss</span>
                <strong>--</strong>
              </div>

              <div className="performance-chart">
                <div className="chart-placeholder">
                  <span>Model performance will appear here</span>
                </div>
              </div>

              <p className="performance-note">
                Metrics will update after federated training.
              </p>
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel traffic-panel">
            <div className="panel-heading">
              <div>
                <h2>Traffic Flow Prediction</h2>
                <p>Expected traffic for the next 15 minutes</p>
              </div>
              <span className="panel-badge">Demo View</span>
            </div>

            <div className="traffic-chart">
              <ChandigarhMap />
            </div>
          </div>

          <div className="panel quick-actions-panel">
            <div className="panel-heading">
              <div>
                <h2>Quick Actions</h2>
                <p>Manage your federated network</p>
              </div>
            </div>

            <button
              className="action-button"
              onClick={() =>
                alert("Training functionality will be implemented next.")
              }
            >
              <span className="action-icon">▶</span>
              <span>
                <strong>Start Training</strong>
                <small>Begin a federated round</small>
              </span>
              <span className="action-arrow">›</span>
            </button>

            <button
              className="action-button"
              onClick={() => onNavigate("clients")}
            >
              <span className="action-icon">⌘</span>
              <span>
                <strong>View Clients</strong>
                <small>Manage connected clients</small>
              </span>
              <span className="action-arrow">›</span>
            </button>

            <button
              className="action-button"
              onClick={() =>
                alert("Reports functionality will be implemented next.")
              }
            >
              <span className="action-icon">▤</span>
              <span>
                <strong>View Reports</strong>
                <small>Check model evaluation</small>
              </span>
              <span className="action-arrow">›</span>
            </button>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>MOSAIC · Federated Traffic Intelligence</span>
          <span>Backend integration pending</span>
        </footer>
      </main>
    </div>
  );
}
