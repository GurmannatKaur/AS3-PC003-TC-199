
import { useMemo, useState } from "react";
import "../styles/dashboard.css";

type TrafficClient = {
  id: string;
  location: string;
  area: string;
  traffic: "High" | "Moderate" | "Low";
  vehicles: string;
  status: "Connected" | "Offline";
  x: number;
  y: number;
};

const clients: TrafficClient[] = [
  {
    id: "CLIENT-01",
    location: "Chandigarh",
    area: "Sector 17",
    traffic: "High",
    vehicles: "1,240",
    status: "Connected",
    x: 47,
    y: 35,
  },
  {
    id: "CLIENT-02",
    location: "Zirakpur",
    area: "Airport Road",
    traffic: "Moderate",
    vehicles: "860",
    status: "Connected",
    x: 72,
    y: 28,
  },
  {
    id: "CLIENT-03",
    location: "Mohali",
    area: "Phase 7",
    traffic: "Low",
    vehicles: "420",
    status: "Connected",
    x: 35,
    y: 68,
  },
  {
    id: "CLIENT-04",
    location: "Panchkula",
    area: "Sector 5",
    traffic: "Moderate",
    vehicles: "730",
    status: "Offline",
    x: 78,
    y: 62,
  },
];

const trafficColors = {
  High: "#ef4444",
  Moderate: "#f59e0b",
  Low: "#22c55e",
};

export default function TrafficMap() {
  const [selectedClient, setSelectedClient] = useState("CLIENT-01");
  const [trafficFilter, setTrafficFilter] = useState("All");
  const [showOffline, setShowOffline] = useState(true);

  const connectedClients = clients.filter(
    (client) => client.status === "Connected"
  ).length;

  const offlineClients = clients.length - connectedClients;

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesTraffic =
        trafficFilter === "All" || client.traffic === trafficFilter;

      const matchesStatus = showOffline || client.status !== "Offline";

      return matchesTraffic && matchesStatus;
    });
  }, [trafficFilter, showOffline]);

  const selected = clients.find(
    (client) => client.id === selectedClient
  );

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

          <a className="nav-item" href="/overview">
            <span>▦</span>
            Overview
          </a>

          <a className="nav-item active" href="/traffic-map">
            <span>⌁</span>
            Traffic Network
          </a>

          <a className="nav-item" href="/federated-learning">
            <span>◈</span>
            Federated Training
          </a>

          <a className="nav-item" href="/traffic-prediction">
            <span>⌁</span>
            Predictions
          </a>

          <p className="nav-label second-label">SYSTEM</p>

          <a className="nav-item" href="/settings">
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
              Explore traffic conditions and participating clients across
              the Chandigarh Tricity region.
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

        {/* Network Metrics */}

        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-top">
              <p>Total Clients</p>
              <span className="metric-icon">⌘</span>
            </div>

            <h2>{String(clients.length).padStart(2, "0")}</h2>

            <p className="metric-subtitle">
              Registered traffic nodes
            </p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <p>Connected Clients</p>
              <span className="metric-icon">◉</span>
            </div>

            <h2>{String(connectedClients).padStart(2, "0")}</h2>

            <p className="metric-subtitle">
              Currently online
            </p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <p>Offline Clients</p>
              <span className="metric-icon">⌁</span>
            </div>

            <h2>{String(offlineClients).padStart(2, "0")}</h2>

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

        {/* Map and Client Details */}

        <section
          className="panel"
          style={{
            marginTop: 24,
            overflow: "hidden",
          }}
        >
          <div className="panel-heading">
            <div>
              <h2>Live Traffic Network</h2>

              <p>
                Select a client marker to explore its traffic information.
              </p>
            </div>

            <span className="panel-badge">
              {filteredClients.length} Nodes
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 280px",
              gap: 20,
            }}
          >
            {/* Illustrative Map */}

            <div
              style={{
                position: "relative",
                minHeight: 430,
                overflow: "hidden",
                borderRadius: 16,
                border: "1px solid #dbeafe",
                background:
                  "linear-gradient(145deg, #eaf5ff 0%, #dceeff 50%, #e8f5ff 100%)",
              }}
            >
              <svg
                viewBox="0 0 800 500"
                preserveAspectRatio="xMidYMid meet"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
                aria-label="Illustrative Tricity traffic map"
              >
                {/* Green spaces */}

                <path
                  d="M0 0 H180 L150 110 L40 150 Z"
                  fill="#c7e8ce"
                />

                <path
                  d="M550 0 H800 V150 L680 180 L590 100 Z"
                  fill="#c7e8ce"
                />

                <path
                  d="M0 350 L140 300 L210 420 L100 500 H0 Z"
                  fill="#c7e8ce"
                />

                <path
                  d="M570 340 L800 280 V500 H640 Z"
                  fill="#c7e8ce"
                />

                {/* Main road network */}

                <g
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="18"
                  strokeLinecap="round"
                >
                  <path d="M-20 180 C180 130 250 220 400 190 S650 100 820 160" />
                  <path d="M100 -20 C160 120 240 220 200 520" />
                  <path d="M450 -20 C400 150 500 280 460 520" />
                  <path d="M-20 380 C180 320 300 390 450 350 S700 320 820 400" />
                  <path d="M650 -20 C600 150 700 260 650 520" />
                </g>

                {/* Road center lines */}

                <g
                  fill="none"
                  stroke="#bfdbfe"
                  strokeWidth="3"
                  strokeDasharray="10 10"
                >
                  <path d="M-20 180 C180 130 250 220 400 190 S650 100 820 160" />
                  <path d="M100 -20 C160 120 240 220 200 520" />
                  <path d="M450 -20 C400 150 500 280 460 520" />
                  <path d="M-20 380 C180 320 300 390 450 350 S700 320 820 400" />
                  <path d="M650 -20 C600 150 700 260 650 520" />
                </g>

                {/* City labels */}

                <g
                  fill="#52708f"
                  fontSize="17"
                  fontWeight="700"
                >
                  <text x="250" y="75">CHANDIGARH</text>
                  <text x="550" y="75">ZIRAKPUR</text>
                  <text x="170" y="450">MOHALI</text>
                  <text x="560" y="450">PANCHKULA</text>
                </g>

                {/* Client connections */}

                <g
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="3"
                  strokeDasharray="7 7"
                >
                  <path d="M376 175 L560 140" />
                  <path d="M376 175 L280 340" />
                  <path d="M376 175 L610 310" />
                </g>

                {/* Client markers */}

                {filteredClients.map((client) => {
                  const markerX = client.x * 8;
                  const markerY = client.y * 5;

                  const isSelected = selectedClient === client.id;

                  return (
                    <g
                      key={client.id}
                      transform={`translate(${markerX}, ${markerY})`}
                      onClick={() => setSelectedClient(client.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {isSelected && (
                        <circle
                          r="28"
                          fill={trafficColors[client.traffic]}
                          opacity="0.18"
                        />
                      )}

                      <circle
                        r={isSelected ? 17 : 13}
                        fill={trafficColors[client.traffic]}
                        stroke="#ffffff"
                        strokeWidth="4"
                      />

                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="800"
                      >
                        {client.id.slice(-2)}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  padding: "9px 13px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.95)",
                  color: "#174a83",
                  fontWeight: 800,
                  fontSize: 12,
                  boxShadow: "0 4px 14px rgba(23,74,131,0.08)",
                }}
              >
                Chandigarh Tricity
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.95)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#20344d",
                }}
              >
                <span>
                  <span style={{ color: "#ef4444" }}>●</span> High
                </span>

                <span>
                  <span style={{ color: "#f59e0b" }}>●</span> Moderate
                </span>

                <span>
                  <span style={{ color: "#22c55e" }}>●</span> Low
                </span>
              </div>
            </div>

            {/* Client Selection Panel */}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div>
                <label
                  htmlFor="traffic-filter"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "#174a83",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  Filter Traffic
                </label>

                <select
                  id="traffic-filter"
                  value={trafficFilter}
                  onChange={(event) =>
                    setTrafficFilter(event.target.value)
                  }
                  style={{ width: "100%" }}
                >
                  <option value="All">All traffic levels</option>
                  <option value="High">High congestion</option>
                  <option value="Moderate">Moderate congestion</option>
                  <option value="Low">Low congestion</option>
                </select>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#20344d",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <input
                  type="checkbox"
                  checked={showOffline}
                  onChange={(event) =>
                    setShowOffline(event.target.checked)
                  }
                />
                Show offline clients
              </label>

              <div
                style={{
                  marginTop: 6,
                  color: "#174a83",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                Traffic Nodes
              </div>

              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  style={{
                    width: "100%",
                    padding: 13,
                    textAlign: "left",
                    borderRadius: 12,
                    border:
                      selectedClient === client.id
                        ? "2px solid #2878d4"
                        : "1px solid #dbeafe",
                    background:
                      selectedClient === client.id
                        ? "#e4f3ff"
                        : "#ffffff",
                    color: "#20344d",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <strong>{client.location}</strong>

                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background:
                          client.status === "Connected"
                            ? "#22c55e"
                            : "#94a3b8",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: 5,
                      color: "#64748b",
                      fontSize: 11,
                    }}
                  >
                    {client.area}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    <span
                      style={{
                        color: trafficColors[client.traffic],
                      }}
                    >
                      {client.traffic} Traffic
                    </span>

                    <span>{client.vehicles} vehicles</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Selected Client Details */}

        {selected && (
          <section
            className="panel"
            style={{ marginTop: 24 }}
          >
            <div className="panel-heading">
              <div>
                <h2>Selected Client Details</h2>

                <p>
                  Detailed information for {selected.location} ·{" "}
                  {selected.area}
                </p>
              </div>

              <span className="panel-badge">
                {selected.id}
              </span>
            </div>

            <div className="network-info-grid">
              <div className="network-info-card">
                <span className="network-info-icon">⌘</span>
                <h3>Traffic Level</h3>
                <p
                  style={{
                    color: trafficColors[selected.traffic],
                    fontWeight: 900,
                    fontSize: 18,
                  }}
                >
                  {selected.traffic}
                </p>
              </div>

              <div className="network-info-card">
                <span className="network-info-icon">▦</span>
                <h3>Vehicle Count</h3>
                <p
                  style={{
                    color: "#174a83",
                    fontWeight: 900,
                    fontSize: 18,
                  }}
                >
                  {selected.vehicles}
                </p>
              </div>

              <div className="network-info-card">
                <span className="network-info-icon">◉</span>
                <h3>Connection Status</h3>
                <p
                  style={{
                    color:
                      selected.status === "Connected"
                        ? "#16a34a"
                        : "#64748b",
                    fontWeight: 900,
                    fontSize: 18,
                  }}
                >
                  {selected.status}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Client Table */}

        <section
          className="panel"
          style={{ marginTop: 24 }}
        >
          <div className="panel-heading">
            <div>
              <h2>Traffic Client Directory</h2>

              <p>
                Participating nodes across the Tricity network
              </p>
            </div>

            <span className="panel-badge">
              {clients.length} Clients
            </span>
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

        <footer className="dashboard-footer">
          <span>MOSAIC · Federated Traffic Intelligence</span>
          <span>Map visualization · Backend integration pending</span>
        </footer>
      </main>
    </div>
  );
}
