
import "../styles/dashboard.css";

const predictions = [
  {
    time: "Now",
    vehicles: 1240,
    level: "High",
  },
  {
    time: "+5 min",
    vehicles: 1080,
    level: "Moderate",
  },
  {
    time: "+10 min",
    vehicles: 920,
    level: "Moderate",
  },
  {
    time: "+15 min",
    vehicles: 760,
    level: "Low",
  },
];

const locations = [
  {
    name: "Chandigarh Sector 17",
    vehicles: "1,240",
    level: "High",
    confidence: "92%",
  },
  {
    name: "Zirakpur Airport Road",
    vehicles: "860",
    level: "Moderate",
    confidence: "88%",
  },
  {
    name: "Mohali Phase 7",
    vehicles: "420",
    level: "Low",
    confidence: "90%",
  },
  {
    name: "Panchkula Sector 5",
    vehicles: "730",
    level: "Moderate",
    confidence: "85%",
  },
];

export default function TrafficPrediction() {
  const currentTraffic = predictions[0].vehicles;
  const predictedTraffic = predictions[predictions.length - 1].vehicles;

  const maxVehicles = Math.max(
    ...predictions.map((item) => item.vehicles)
  );

  const trafficReduction = Math.round(
    ((currentTraffic - predictedTraffic) / currentTraffic) * 100
  );

  const predictedLevel = predictions[predictions.length - 1].level;

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

          <a className="nav-item" href="/">
            <span>▦</span>
            Overview
          </a>

          <a className="nav-item" href="/traffic-map">
            <span>⌁</span>
            Traffic Network
          </a>

          <a className="nav-item" href="/federated-learning">
            <span>◈</span>
            Federated Training
          </a>

          <a className="nav-item active" href="/traffic-prediction">
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
            <p className="breadcrumb">
              Workspace / Traffic Prediction
            </p>

            <h1>Traffic Prediction</h1>

            <p className="page-subtitle">
              Forecast traffic flow using federated intelligence.
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
          <div className="metric-card">
            <div className="metric-top">
              <p>Current Traffic</p>
              <span className="metric-icon">↗</span>
            </div>

            <h2>{currentTraffic.toLocaleString()}</h2>

            <p className="metric-subtitle">
              Vehicles detected
            </p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <p>Predicted Traffic</p>
              <span className="metric-icon">⌁</span>
            </div>

            <h2>{predictedTraffic.toLocaleString()}</h2>

            <p className="metric-subtitle">
              Next 15 minutes · {trafficReduction}% decrease
            </p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <p>Traffic Intensity</p>
              <span className="metric-icon">◉</span>
            </div>

            <h2>{predictedLevel}</h2>

            <p className="metric-subtitle">
              Expected traffic level
            </p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <p>Forecast Horizon</p>
              <span className="metric-icon">◷</span>
            </div>

            <h2>15 Min</h2>

            <p className="metric-subtitle">
              Prediction window
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Traffic Flow Forecast</h2>
              <p>
                Expected vehicle count over the next 15 minutes
              </p>
            </div>

            <span className="panel-badge">Forecast</span>
          </div>

          <div className="prediction-chart">
            <div className="prediction-y-axis">
              <span>1,500</span>
              <span>1,000</span>
              <span>500</span>
              <span>0</span>
            </div>

            <div className="prediction-bars">
              {predictions.map((item) => (
                <div
                  className="prediction-bar-column"
                  key={item.time}
                >
                  <span className="prediction-bar-value">
                    {item.vehicles.toLocaleString()}
                  </span>

                  <div className="prediction-bar-track">
                    <div
                      className={`prediction-bar ${item.level.toLowerCase()}`}
                      style={{
                        height: `${(item.vehicles / maxVehicles) * 100}%`,
                      }}
                    />
                  </div>

                  <span className="prediction-bar-time">
                    {item.time}
                  </span>

                  <span
                    className={`traffic-level ${item.level.toLowerCase()}`}
                  >
                    {item.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel prediction-table-panel">
          <div className="panel-heading">
            <div>
              <h2>Location-Based Predictions</h2>
              <p>
                Forecast details for monitored traffic locations
              </p>
            </div>
          </div>

          <div className="client-table-wrapper">
            <table className="client-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Predicted Vehicles</th>
                  <th>Traffic Level</th>
                  <th>Confidence</th>
                </tr>
              </thead>

              <tbody>
                {locations.map((location) => (
                  <tr key={location.name}>
                    <td>
                      <strong>{location.name}</strong>
                    </td>

                    <td>{location.vehicles}</td>

                    <td>
                      <span
                        className={`traffic-level ${location.level.toLowerCase()}`}
                      >
                        {location.level}
                      </span>
                    </td>

                    <td>
                      <strong>{location.confidence}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>MOSAIC · Federated Traffic Intelligence</span>
          <span>Demo Data · Backend Integration Pending</span>
        </footer>
      </main>
    </div>
  );
}
