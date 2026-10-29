
import { useState } from "react";
import "../styles/dashboard.css";
import { forecasts, roads, sampleDataNote } from "../data/trafficSamples";
import { usePreferences } from "../data/preferences";
import Icon from "../components/common/Icon";

const horizons = [15, 30, 60] as const;

export default function TrafficPrediction() {
  const { defaultHorizon: horizon, setDefaultHorizon: setHorizon } =
    usePreferences();

  const [selectedRoadId, setSelectedRoadId] = useState(roads[0].id);

  const selectedRoad =
    roads.find((road) => road.id === selectedRoadId) ?? roads[0];

  const forecast = forecasts[selectedRoad.id][horizon];
  const maxFlow = Math.max(...forecast.map((item) => item.value));
  const finalPoint = forecast[forecast.length - 1];

  return (
    <div className="page-stack">
      <section className="prediction-controls surface">
        <div>
          <span className="eyebrow">FORECAST EXPLORER</span>
          <h2>Corridor outlook</h2>
          <p>
            Choose a road and time horizon to explore an illustrative forecast
            scenario.
          </p>
        </div>

        <div className="prediction-selectors">
          <label className="select-control">
            Road
            <select
              value={selectedRoad.id}
              onChange={(event) => setSelectedRoadId(event.target.value)}
            >
              {roads.map((road) => (
                <option value={road.id} key={road.id}>
                  {road.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="segmented-control">
            <legend>Forecast window</legend>
            {horizons.map((value) => (
              <button
                type="button"
                key={value}
                className={horizon === value ? "active" : ""}
                onClick={() => setHorizon(value)}
                aria-pressed={horizon === value}
              >
                {value} min
              </button>
            ))}
          </fieldset>
        </div>
      </section>

      <div className="forecast-disclaimer">
        <span aria-hidden="true">
          <Icon name="sparkle" />
        </span>
        <p>
          <strong>Illustrative scenario</strong> · {sampleDataNote} These
          values are not model-generated predictions.
        </p>
      </div>

      <section className="summary-grid prediction-summary-grid">
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Current illustrative flow</span>
            <span className="summary-icon">
              <Icon name="predictions" />
            </span>
          </div>
          <strong>
            {selectedRoad.flow.toLocaleString()} <em>veh/h</em>
          </strong>
          <small>{selectedRoad.name}</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>End of window</span>
            <span className="summary-icon">
              <Icon name="clock" />
            </span>
          </div>
          <strong>
            {finalPoint.value.toLocaleString()} <em>veh/h</em>
          </strong>
          <small>At +{horizon} minutes · illustrative</small>
        </article>

        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Scenario congestion</span>
            <span className="summary-icon">
              <Icon name="network" />
            </span>
          </div>
          <strong>
            <span
              className={`congestion-dot ${finalPoint.level.toLowerCase()}`}
            />
            {finalPoint.level}
          </strong>
          <small>Illustrative classification</small>
        </article>
      </section>

      <section className="surface forecast-chart-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">TRAFFIC FLOW</span>
            <h2>{selectedRoad.name} forecast</h2>
            <p>
              Illustrative vehicle flow over the next {horizon} minutes
            </p>
          </div>
        </div>

        <div
          className="forecast-chart"
          role="img"
          aria-label={`Illustrative flow scenario for ${selectedRoad.name}`}
        >
          <div className="forecast-scale">
            <span>{maxFlow.toLocaleString()}</span>
            <span>{Math.round(maxFlow * 0.66).toLocaleString()}</span>
            <span>{Math.round(maxFlow * 0.33).toLocaleString()}</span>
            <span>0</span>
          </div>

          <div className="forecast-bars">
            {forecast.map((point) => (
              <div className="forecast-column" key={point.label}>
                <strong className="forecast-value">
                  {point.value.toLocaleString()}
                </strong>

                <div className="forecast-bar-track">
                  <span
                    className={`forecast-bar ${point.level.toLowerCase()}`}
                    style={{
                      height: `${(point.value / maxFlow) * 100}%`,
                    }}
                  />
                </div>

                <span className="forecast-time">{point.label}</span>

                <span
                  className={`traffic-level ${point.level.toLowerCase()}`}
                >
                  {point.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ROAD COMPARISON</span>
            <h2>Corridor outlook</h2>
            <p>
              Illustrative flow and congestion across all three roads at the
              selected horizon.
            </p>
          </div>
          <span className="count-pill">+{horizon} minutes</span>
        </div>

        <div className="road-forecast-list">
          {roads.map((road) => {
            const roadForecast = forecasts[road.id][horizon];
            const point = roadForecast[roadForecast.length - 1];

            return (
              <button
                type="button"
                className={`road-forecast-row ${
                  road.id === selectedRoad.id ? "selected" : ""
                }`}
                key={road.id}
                onClick={() => setSelectedRoadId(road.id)}
              >
                <span
                  className={`road-marker ${point.level.toLowerCase()}`}
                />

                <span className="road-row-info">
                  <strong>{road.name}</strong>
                  <small>{road.junction}</small>
                </span>

                <span className="forecast-flow">
                  {point.value.toLocaleString()} <small>veh/h</small>
                </span>

                <span
                  className={`traffic-level ${point.level.toLowerCase()}`}
                >
                  {point.level}
                </span>

                <Icon className="row-chevron" name="arrow" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
