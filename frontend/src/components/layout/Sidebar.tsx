import "../../styles/dashboard.css";

const navItems = [
  { label: "Overview", path: "/", icon: "◫" },
  { label: "Traffic Map", path: "/traffic-map", icon: "⌖" },
  { label: "Traffic Prediction", path: "/traffic-prediction", icon: "↗" },
  { label: "Federated Learning", path: "/federated-learning", icon: "◎" },
  { label: "Communication Cost", path: "/communication-cost", icon: "⇄" },
  {
    label: "Emergency Route Support",
    path: "/emergency-route-support",
    icon: "✚",
  },
];

export default function Sidebar() {
  const currentPath = window.location.pathname;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">M</div>

        <div>
          <h2>MOSAIC</h2>
          <p>Federated Traffic AI</p>
        </div>
      </div>

      <div className="sidebar-section-label">
        MAIN MENU
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.path ||
            (item.path !== "/" && currentPath.startsWith(item.path));

          return (
            <a
              key={item.path}
              href={item.path}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status-dot" />

        <div>
          <p>System Status</p>
          <span>Prototype Dashboard</span>
        </div>
      </div>
    </aside>
  );
}