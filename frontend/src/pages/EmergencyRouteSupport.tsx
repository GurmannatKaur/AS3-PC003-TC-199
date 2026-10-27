import "../styles/dashboard.css";

const emergencyRoutes = [
  {
    id: "ER-001",
    source: "Sector 17, Chandigarh",
    destination: "PGIMER Chandigarh",
    distance: "6.2 km",
    eta: "14 min",
    status: "Recommended",
  },
  {
    id: "ER-002",
    source: "Zirakpur",
    destination: "Civil Hospital, Mohali",
    distance: "8.5 km",
    eta: "19 min",
    status: "Alternative",
  },
  {
    id: "ER-003",
    source: "Sector  chun 43, Chandigarh",
    destination: "GMCH-32 Chandigarh",
    distance: "4.8 km",
    eta: "11 min",
    status: "Recommended",
  },
];

export default function EmergencyRouteSupport() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">EMERGENCY RESPONSE</p>
          <h1>Emergency Route Support</h1>
          <p className="page-description">
            Support emergency vehicles by identifying routes with lower
            predicted traffic congestion.
          </p>
        </div>

        <span className="status-badge status-active">
          ● Route Support Ready
        </span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Routes Evaluated</span>
          <h2>3</h2>
          <p>Illustrative route options</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Recommended Routes</span>
          <h2>2</h2>
          <p>Based on sample traffic data</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Traffic Consideration</span>
          <h2>Live-ready</h2>
          <p>Designed for traffic model integration</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Primary Objective</span>
          <h2>Faster</h2>
          <p>Emergency travel support</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Emergency Route Recommendations</h2>
            <p>
              Sample routes for the Chandigarh–Mohali region
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Route ID</th>
                <th>Starting Point</th>
                <th>Destination</th>
                <th>Distance</th>
                <th>Estimated Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {emergencyRoutes.map((route) => (
                <tr key={route.id}>
                  <td>{route.id}</td>
                  <td>{route.source}</td>
                  <td>{route.destination}</td>
                  <td>{route.distance}</td>
                  <td>{route.eta}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        route.status === "Recommended"
                          ? "status-active"
                          : "status-waiting"
                      }`}
                    >
                      {route.status}
                    </span>
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
            <h2>Route Optimization Process</h2>
            <p>How the system can support emergency routing</p>
          </div>
        </div>

        <div className="workflow-grid">
          <div className="workflow-step">
            <div className="workflow-number">01</div>
            <h3>Detect Congestion</h3>
            <p>
              Use traffic prediction results to identify congested road
              segments.
            </p>
          </div>

          <div className="workflow-step">
            <div className="workflow-number">02</div>
            <h3>Evaluate Routes</h3>
            <p>
              Compare possible routes using estimated travel time and
              congestion levels.
            </p>
          </div>

          <div className="workflow-step">
            <div className="workflow-number">03</div>
            <h3>Recommend Route</h3>
            <p>
              Suggest a route that may help reduce emergency travel time.
            </p>
          </div>

          <div className="workflow-step">
            <div className="workflow-number">04</div>
            <h3>Update Prediction</h3>
            <p>
              Re-evaluate route options when new traffic information becomes
              available.
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="info-card">
          <h3>Emergency Support Notice</h3>
          <p>
            This page currently displays prototype data. It is not connected
            to emergency services or live navigation. Route recommendations
            must be validated with real-time traffic and road data before
            operational use.
          </p>
        </div>
      </section>
    </div>
  );
}