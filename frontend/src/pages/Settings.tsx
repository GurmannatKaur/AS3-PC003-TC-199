import { usePreferences } from "../data/preferences";

export default function Settings() {
  const {
    speedUnit,
    setSpeedUnit,
    defaultHorizon,
    setDefaultHorizon,
    compactMapLabels,
    setCompactMapLabels,
    reduceMotion,
    setReduceMotion,
    congestionAlerts,
    setCongestionAlerts,
  } = usePreferences();

  return (
    <div className="settings-layout">
      <div className="settings-sections">
        <section className="surface settings-section">
          <div className="section-heading">
            <div><span className="eyebrow">PREFERENCES</span><h2>General</h2><p>Application display choices for this session.</p></div>
          </div>
          <div className="setting-row">
            <div><strong>Speed units</strong><small>Choose the unit used for road speed displays.</small></div>
            <select className="settings-select" value={speedUnit} onChange={(event) => setSpeedUnit(event.target.value === "mph" ? "mph" : "km/h")} aria-label="Speed units"><option>km/h</option><option>mph</option></select>
          </div>
          <div className="setting-row">
            <div><strong>Reduce motion</strong><small>Limit decorative interface transitions.</small></div>
            <button type="button" className={`toggle ${reduceMotion ? "on" : ""}`} onClick={() => setReduceMotion(!reduceMotion)} aria-pressed={reduceMotion} aria-label="Toggle reduced motion"><span /></button>
          </div>
        </section>

        <section className="surface settings-section">
          <div className="section-heading">
            <div><span className="eyebrow">MAP DISPLAY</span><h2>Map preferences</h2><p>Adjust how the traffic map is presented.</p></div>
          </div>
          <div className="setting-row">
            <div><strong>Compact road labels</strong><small>Prefer concise marker labels on the map.</small></div>
            <button type="button" className={`toggle ${compactMapLabels ? "on" : ""}`} onClick={() => setCompactMapLabels(!compactMapLabels)} aria-pressed={compactMapLabels} aria-label="Toggle compact road labels"><span /></button>
          </div>
          <div className="setting-row">
            <div><strong>Congestion color key</strong><small>Low: green · Moderate: amber · High: red.</small></div>
            <span className="settings-value">Always visible</span>
          </div>
        </section>

        <section className="surface settings-section">
          <div className="section-heading">
            <div><span className="eyebrow">PREDICTIONS</span><h2>Forecast display</h2><p>Select the default forecast interval shown on the prediction page.</p></div>
          </div>
          <div className="setting-row">
            <div><strong>Default prediction window</strong><small>This preference applies to the current session.</small></div>
            <select className="settings-select" value={defaultHorizon} onChange={(event) => setDefaultHorizon(event.target.value === "5" ? 5 : event.target.value === "10" ? 10 : 15)} aria-label="Default prediction window"><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option></select>
          </div>
        </section>

        <section className="surface settings-section">
          <div className="section-heading">
            <div><span className="eyebrow">NOTIFICATIONS</span><h2>Alerts</h2><p>Notification preferences are stored for this page session only.</p></div>
          </div>
          <div className="setting-row">
            <div><strong>Congestion alerts</strong><small>Enable the local preference for high-congestion notices.</small></div>
            <button type="button" className={`toggle ${congestionAlerts ? "on" : ""}`} onClick={() => setCongestionAlerts(!congestionAlerts)} aria-pressed={congestionAlerts} aria-label="Toggle congestion alerts"><span /></button>
          </div>
        </section>
      </div>

      <aside className="surface about-card">
        <span className="eyebrow">ABOUT MOSAIC</span>
        <h2>Traffic intelligence, built collaboratively.</h2>
        <p>MOSAIC is a federated traffic prediction dashboard concept for exploring distributed road intelligence.</p>
        <p className="demo-disclosure">
          Demonstration mode — traffic data and client activity are simulated.
        </p>
      </aside>
    </div>
  );
}
