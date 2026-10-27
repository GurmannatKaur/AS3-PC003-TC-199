import "../styles/dashboard.css";

const clients = [
  {
    id: "CLIENT-01",
    location: "Chandigarh",
    area: "Sector 17",
    traffic: "High",
    vehicles: "1,240",
    status: "Connected",
  },
  {
    id: "CLIENT-02",
    location: "Zirakpur",
    area: "Airport Road",
    traffic: "Moderate",
    vehicles: "860",
    status: "Connected",
  },
  {
    id: "CLIENT-03",
    location: "Mohali",
    area: "Phase 7",
    traffic: "Low",
    vehicles: "420",
    status: "Connected",
  },
  {
    id: "CLIENT-04",
    location: "Panchkula",
    area: "Sector 5",
    traffic: "Moderate",
    vehicles: "730",
    status: "Offline",
  },
];

export default function TrafficNetwork() {
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

          <a className="nav-item active" href="/traffic-network">
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
            <p className="breadcrumb">
              Workspace / Traffic Network
            </p>

            <h1>Traffic Network</h1>

            <p className="page-subtitle">
              Monitor traffic clients and their network status.
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
              <p>Total Clients</p>
              <span className="metric-icon">⌘</span>
            </div>
            <h2>04</h2>
            <p className="metric-subtitle">
              Registered traffic nodes
            </p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <p>Connected Clients</p>
              <span className="metric-icon">◉</span>
            </div>
            <h2>03</h2>
            <p className="metric-subtitle">
              Currently online
            </p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <p>Offline Clients</p>
              <span className="metric-icon">⌁</span>
            </div>
            <h2>01</h2>
            <p className="metric-subtitle">
              Waiting to reconnect
            </p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <p>Network Coverage</p>
              <span className="metric-icon">◎</span>
            </div>
            <h2>Tricity</h2>
            <p className="metric-subtitle">
              Chandigarh · Mohali · Panchkula
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Connected Traffic Clients</h2>
              <p>
                Overview of participating traffic data nodes
              </p>
            </div>

            <span className="panel-badge">4 Clients</span>
          </div>

          <div className="client-table-wrapper">
            <table className="client-table">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Location</th>
                  <th>Traffic Level</th>
                  <th>Vehicles</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <strong>{client.id}</strong>
                    </td>

                    <td>
                      <div className="client-location">
                        <strong>{client.location}</strong>
                        <small>{client.area}</small>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`traffic-level ${client.traffic.toLowerCase()}`}
                      >
                        {client.traffic}
                      </span>
                    </td>

                    <td>{client.vehicles}</td>

                    <td>
                      <span
                        className={`client-status ${
                          client.status === "Connected"
                            ? "connected"
                            : "offline"
                        }`}
                      >
                        <span className="status-dot" />
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel network-info-panel">
          <div className="panel-heading">
            <div>
              <h2>Network Overview</h2>
              <p>
                Distributed traffic monitoring across the Tricity region
              </p>
            </div>
          </div>

          <div className="network-info-grid">
            <div className="network-info-card">
              <span className="network-info-icon">⌘</span>
              <h3>Distributed Clients</h3>
              <p>
                Each traffic client processes its local traffic data
                independently.
              </p>
            </div>

            <div className="network-info-card">
              <span className="network-info-icon">⇄</span>
              <h3>Secure Updates</h3>
              <p>
                Model updates are shared with the central server
                instead of raw local data.
              </p>
            </div>

            <div className="network-info-card">
              <span className="network-info-icon">✦</span>
              <h3>Global Intelligence</h3>
              <p>
                Aggregated model updates support improved traffic
                flow prediction.
              </p>
            </div>
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