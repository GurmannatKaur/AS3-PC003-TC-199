
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import Icon from "../common/Icon";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { to: "/", label: "Overview", icon: "overview", end: true },
  { to: "/traffic-map", label: "Traffic Network", icon: "network" },
  { to: "/clients", label: "Federated Clients", icon: "clients" },
  { to: "/federated-learning", label: "Federated Training", icon: "training" },
  { to: "/traffic-prediction", label: "Predictions", icon: "predictions" },
  { to: "/communication-cost", label: "Communication Cost", icon: "network" },
  { to: "/emergency-route-support", label: "Emergency Routes", icon: "network" },
  { to: "/settings", label: "Settings", icon: "settings" },
] as const;

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="wordmark" aria-label="MOSAIC overview">
          <strong>MOSAIC</strong>
          <span>Traffic intelligence</span>
        </NavLink>

        <nav className="top-navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item ? item.end : false}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon name={item.icon} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="header-location">
          <Icon name="location" />
          <span>Chandigarh</span>
        </div>
      </header>

      <main className="main-content">
        {children}
        <footer className="dashboard-footer">
          <span>MOSAIC · Federated Traffic Intelligence</span>
          <span>Sample scenarios are identified in the data views</span>
        </footer>
      </main>
    </div>
  );
}
