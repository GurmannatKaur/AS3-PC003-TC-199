
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import Icon from "../common/Icon";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { to: "/", label: "Overview", end: true },
  { to: "/traffic-map", label: "Traffic Network" },
  { to: "/clients", label: "Federated Clients" },
  { to: "/federated-learning", label: "Federated Training" },
  { to: "/traffic-prediction", label: "Predictions" },
  { to: "/communication-cost", label: "Communication Cost" },
  { to: "/settings", label: "Settings" },
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
          <span>Traffic values are illustrative; models and clients are offline</span>
        </footer>
      </main>
    </div>
  );
}
