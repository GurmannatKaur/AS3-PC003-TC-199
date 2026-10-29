import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
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

          <NavLink to="/" end className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }>
            <span>▦</span>
            Overview
          </NavLink>

          <NavLink to="/traffic-map" className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }>
            <span>⌁</span>
            Traffic Network
          </NavLink>

          <NavLink to="/federated-learning" className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }>
            <span>◈</span>
            Federated Training
          </NavLink>

          <NavLink to="/traffic-prediction" className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }>
            <span>⌁</span>
            Predictions
          </NavLink>

          <NavLink to="/communication-cost" className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }>
            <span>↗</span>
            Communication Cost
          </NavLink>

          <NavLink to="/emergency-route-support" className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }>
            <span>✚</span>
            Emergency Routes
          </NavLink>

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
        {children}
      </main>
    </div>
  );
}