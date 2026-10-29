import { useState } from "react";
import { sampleDataNote, roads } from "../data/trafficSamples";
import { formatSpeed, usePreferences } from "../data/preferences";
import Icon from "../components/common/Icon";

type ClientsProps = {
  onNavigate: (page: string) => void;
  selectedRoadId: string;
  onSelectRoad: (roadId: string) => void;
};

export default function Clients({
  onNavigate,
  selectedRoadId,
  onSelectRoad,
}: ClientsProps) {
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const { speedUnit } = usePreferences();

  return (
    <div className="page-stack">
      <section className="summary-grid clients-summary">
        <article className="summary-card">
          <div className="summary-card-heading"><span>Configured clients</span><span className="summary-icon"><Icon name="clients" /></span></div>
          <strong>03</strong><small>One per monitored road</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading"><span>Connected</span><span className="summary-icon"><Icon name="network" /></span></div>
          <strong>00</strong><small>Road clients currently offline</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading"><span>Local models</span><span className="summary-icon"><Icon name="training" /></span></div>
          <strong>—</strong><small>No models deployed</small>
        </article>
      </section>

      <section className="surface clients-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CLIENT DIRECTORY</span>
            <h2>Road-linked nodes</h2>
            <p>Each road client is associated with a monitored corridor and a local data boundary.</p>
          </div>
          <span className="status-pill offline"><span />Clients offline</span>
        </div>
        <div className="client-list">
          {roads.map((road, index) => {
            const expanded = detailsId === road.id;
            return (
              <article className={`client-card ${selectedRoadId === road.id ? "is-selected" : ""}`} key={road.id}>
                <div className="client-card-main">
                  <span className={`client-avatar ${road.congestion.toLowerCase()}`}>{String(index + 1).padStart(2, "0")}</span>
                  <div className="client-road-name">
                    <span className="eyebrow">ROAD CLIENT 0{index + 1}</span>
                    <h3>{road.name}</h3>
                    <p>{road.junction} · Chandigarh</p>
                  </div>
                  <div className="client-card-field">
                    <small>Traffic level</small>
                    <span className={`traffic-level ${road.congestion.toLowerCase()}`}>{road.congestion}</span>
                  </div>
                  <div className="client-card-field">
                    <small>Sample traffic scenario</small>
                    <strong>{road.flow.toLocaleString()} veh/h · {formatSpeed(road.averageSpeed, speedUnit)}</strong>
                  </div>
                  <div className="client-card-field">
                    <small>Connection</small>
                    <span className="status-pill offline"><span />Offline</span>
                  </div>
                  <button
                    className="button-secondary client-details-button"
                    onClick={() => {
                      onSelectRoad(road.id);
                      setDetailsId(expanded ? null : road.id);
                    }}
                    aria-expanded={expanded}
                  >
                    {expanded ? "Hide details" : "Inspect"} <Icon name={expanded ? "minus" : "plus"} />
                  </button>
                </div>
                {expanded && (
                  <div className="client-details">
                    <div><small>Local model</small><strong>{road.modelState}</strong></div>
                    <div><small>Last update</small><strong>No updates recorded</strong></div>
                    <div><small>Map location</small><strong>{road.junction} · approximate marker</strong></div>
                    <p>{sampleDataNote}</p>
                    <button className="text-button" onClick={() => onNavigate("network")}>View on traffic map <Icon name="arrow" /></button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
