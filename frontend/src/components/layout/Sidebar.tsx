import "../../styles/dashboard.css";

interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { label: "Overview", path: "/" },
  { label: "Traffic Network", path: "/traffic-map" },
  { label: "Traffic Prediction", path: "/traffic-prediction" },
  { label: "Federated Learning", path: "/federated-learning" },
  { label: "Communication Cost", path: "/communication-cost" },
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
              {item.icon && <span className="sidebar-icon">{item.icon}</span>}
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="status-dot" />
        <span>System Ready</span>
      </div>
    </aside>
  );
}
