
import "../styles/dashboard.css";

const clients = [
  {
    id: "Client 1",
    junction: "Sector 17 Junction",
    traffic: "Medium",
    status: "Ready",
    color: "#eab308",
  },
  {
    id: "Client 2",
    junction: "Sector 22 Junction",
    traffic: "High",
    status: "Ready",
    color: "#ef4444",
  },
  {
    id: "Client 3",
    junction: "Sector 35 Junction",
    traffic: "Low",
    status: "Ready",
    color: "#22c55e",
  },
];

export default function Clients() {
  return (
    <div className="main-content">
      <header className="topbar">
        <div>
          <p className="breadcrumb">Workspace / Clients</p>
          <h1>Federated Clients</h1>
          <p className="page-subtitle">
            Monitor the traffic nodes participating in federated learning.
          </p>
        </div>
      </header>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-top">
            <p>Total Clients</p>
          </div>
          <h2>{clients.length}</h2>
          <p className="metric-subtitle">Configured traffic nodes</p>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <p>Ready Clients</p>
          </div>
          <h2>{clients.filter((client) => client.status === "Ready").length}</h2>
          <p className="metric-subtitle">Available for the simulation</p>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <div className="panel-heading">
          <div>
            <h2>Connected Traffic Nodes</h2>
            <p>Client information and illustrative traffic levels</p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {clients.map((client) => (
            <div
              key={client.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                padding: 18,
                border: "1px solid #e5eaf1",
                borderRadius: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: client.color,
                    display: "inline-block",
                  }}
                />

                <div>
                  <h3 style={{ margin: 0 }}>{client.id}</h3>
                  <p style={{ margin: "5px 0 0", color: "#718096" }}>
                    {client.junction}
                  </p>
                </div>
              </div>

              <div>
                <p style={{ margin: 0, color: "#718096", fontSize: 12 }}>
                  Traffic level
                </p>
                <strong>{client.traffic}</strong>
              </div>

              <span className="panel-badge">{client.status}</span>
            </div>
          ))}
        </div>

        <p style={{ color: "#718096", fontSize: 12, marginTop: 18 }}>
          Client details and traffic levels are illustrative. Backend
          connectivity and actual local training have not been implemented.
        </p>
      </section>
    </div>
  );
}
