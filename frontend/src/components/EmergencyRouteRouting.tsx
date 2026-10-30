import Icon from "./common/Icon";
import {
  formatDistance,
  formatDuration,
  getPreferredOption,
} from "../api/routingApi";
import type {
  EmergencyService,
  RouteOption,
  RoutePlan,
  RoutePreference,
  RoutingLocation,
} from "../api/routingApi";
import { roads } from "../data/trafficSamples";

type MapPickMode = "origin" | "destination" | null;

type EmergencyRouteRoutingProps = {
  routePlan: RoutePlan | null;
  origin: RoutingLocation | null;
  destination: RoutingLocation | null;
  service: EmergencyService;
  preference: RoutePreference;
  isLoading: boolean;
  errorMessage: string;
  mapPickMode: MapPickMode;
  onRoutePlanChange: (plan: RoutePlan | null) => void;
  onOriginChange: (location: RoutingLocation | null) => void;
  onDestinationChange: (location: RoutingLocation | null) => void;
  onServiceChange: (service: EmergencyService) => void;
  onPreferenceChange: (preference: RoutePreference) => void;
  onMapPickModeChange: (mode: MapPickMode) => void;
  onCalculateRoute: () => void;
  onClearRoute: () => void;
};

const serviceOptions: {
  id: EmergencyService;
  label: string;
  icon: "ambulance" | "fire" | "police" | "disaster";
}[] = [
  { id: "ambulance", label: "Ambulance", icon: "ambulance" },
  { id: "fire", label: "Fire Brigade", icon: "fire" },
  { id: "police", label: "Police", icon: "police" },
  { id: "disaster", label: "Disaster Response", icon: "disaster" },
];

const locations: RoutingLocation[] = roads.map((road) => ({
  id: road.id,
  name: road.junction,
  coordinates: road.position,
}));

function EmergencyServiceIcon({ service }: { service: EmergencyService }) {
  const icon = serviceOptions.find((option) => option.id === service)?.icon ?? "route";
  return <Icon name={icon} className={`service-icon service-icon-${service}`} />;
}

function selectedOption(plan: RoutePlan): RouteOption {
  return plan.options.find((option) => option.id === plan.selectedOptionId) ?? plan.options[0];
}

export default function EmergencyRouteRouting({
  routePlan,
  origin,
  destination,
  service,
  preference,
  isLoading,
  errorMessage,
  mapPickMode,
  onRoutePlanChange,
  onOriginChange,
  onDestinationChange,
  onServiceChange,
  onPreferenceChange,
  onMapPickModeChange,
  onCalculateRoute,
  onClearRoute,
}: EmergencyRouteRoutingProps) {
  const activeOption = routePlan ? selectedOption(routePlan) : null;
  const serviceLabel = serviceOptions.find((option) => option.id === service)?.label ?? "Emergency vehicle";

  const selectLocation = (
    kind: "origin" | "destination",
    locationId: string,
  ) => {
    const location = locations.find((item) => item.id === locationId);
    if (kind === "origin") onOriginChange(location ?? null);
    else onDestinationChange(location ?? null);
  };

  const selectPreference = (next: RoutePreference) => {
    onPreferenceChange(next);
    if (routePlan) {
      const option = getPreferredOption(routePlan, next);
      onRoutePlanChange({
        ...routePlan,
        preference: next,
        selectedOptionId: option.id,
      });
    }
  };

  return (
    <section className="emergency-routing-section" aria-labelledby="emergency-routing-title">
      <div className="emergency-section-heading">
        <div>
          <span className="eyebrow">PRIORITY JOURNEY PLANNING</span>
          <h2 id="emergency-routing-title">Emergency Response Routing</h2>
          <p>Plan a road-network route between selected Chandigarh locations.</p>
        </div>
        <div className="routing-provider-chip"><Icon name="route" />Road directions</div>
      </div>

      <div className="emergency-routing-layout">
        <form
          className="emergency-route-form"
          onSubmit={(event) => {
            event.preventDefault();
            onCalculateRoute();
          }}
        >
          <fieldset className="service-selector">
            <legend>Emergency service</legend>
            <div className="service-option-grid">
              {serviceOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={`service-option ${service === option.id ? "active" : ""} service-${option.id}`}
                  onClick={() => onServiceChange(option.id)}
                  aria-pressed={service === option.id}
                >
                  <Icon name={option.icon} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="route-location-fields">
            {([
              ["origin", "Starting location", origin, onOriginChange],
              ["destination", "Destination", destination, onDestinationChange],
            ] as const).map(([kind, label, value, setValue]) => (
              <div className={`route-location-field ${mapPickMode === kind ? "picking" : ""}`} key={kind}>
                <label htmlFor={`route-${kind}`}>{label}</label>
                <div className="location-input-row">
                  <span className={`route-endpoint-marker ${kind}`} aria-hidden="true" />
                  <select
                    id={`route-${kind}`}
                    value={value?.id ?? ""}
                    onChange={(event) => {
                      if (event.target.value) selectLocation(kind, event.target.value);
                      else setValue(null);
                    }}
                  >
                    <option value="">Select a map location</option>
                    {value && !locations.some((item) => item.id === value.id) && (
                      <option value={value.id}>{value.name}</option>
                    )}
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className={`map-pick-button ${mapPickMode === kind ? "active" : ""}`}
                  onClick={() => onMapPickModeChange(mapPickMode === kind ? null : kind)}
                  aria-pressed={mapPickMode === kind}
                >
                  <Icon name="pin" />
                  {mapPickMode === kind ? "Click the map to choose" : "Choose on map"}
                </button>
              </div>
            ))}
          </div>

          <div className="route-preference-field">
            <label htmlFor="route-preference">Route preference</label>
            <select
              id="route-preference"
              value={preference}
              onChange={(event) => selectPreference(event.target.value === "shortest" ? "shortest" : "fastest")}
            >
              <option value="fastest">Fastest · available road options</option>
              <option value="shortest">Shortest · among returned options</option>
            </select>
          </div>

          <div className="route-form-actions">
            <button type="submit" className="button-primary route-find-button" disabled={isLoading}>
              <Icon name="route" />
              {isLoading ? "Finding route…" : "Find Route"}
            </button>
            <button type="button" className="button-secondary route-clear-button" onClick={onClearRoute} disabled={!routePlan && !origin && !destination && !errorMessage}>
              <Icon name="clear" />
              Clear Route
            </button>
          </div>
          {errorMessage && <p className="routing-error" role="alert">{errorMessage}</p>}
        </form>

        <aside className="route-result-panel" aria-live="polite">
          {routePlan && activeOption ? (
            <>
              <div className="route-result-heading">
                <span className="route-result-icon"><EmergencyServiceIcon service={routePlan.service} /></span>
                <div><span className="eyebrow">ROUTE READY</span><h3>{serviceLabel}</h3></div>
                <span className="route-provider-tag">OSRM</span>
              </div>
              <div className="route-endpoint-summary">
                <div><span className="route-endpoint-marker origin" /><span><small>Origin</small><strong>{routePlan.origin.name}</strong></span></div>
                <div className="route-endpoint-connector" />
                <div><span className="route-endpoint-marker destination" /><span><small>Destination</small><strong>{routePlan.destination.name}</strong></span></div>
              </div>
              <div className="route-metric-grid">
                <div><small>Distance</small><strong>{formatDistance(activeOption.distanceMeters)}</strong></div>
                <div><small>Provider duration</small><strong>{formatDuration(activeOption.durationSeconds)}</strong></div>
                <div><small>Preference</small><strong>{routePlan.preference === "fastest" ? "Fastest option" : "Shortest returned option"}</strong></div>
              </div>
              {routePlan.options.length > 1 && (
                <div className="route-alternatives">
                  <span>Available road options</span>
                  {routePlan.options.map((option, index) => (
                    <button
                      type="button"
                      key={option.id}
                      className={option.id === activeOption.id ? "active" : ""}
                      onClick={() => onRoutePlanChange({ ...routePlan, selectedOptionId: option.id })}
                      aria-pressed={option.id === activeOption.id}
                    >
                      <span>Option {index + 1}</span>
                      <strong>{formatDistance(option.distanceMeters)}</strong>
                      <small>{formatDuration(option.durationSeconds)}</small>
                    </button>
                  ))}
                </div>
              )}
              {activeOption.roadNames.length > 0 && (
                <div className="route-road-names">
                  <span>Roads along route</span>
                  <p>{activeOption.roadNames.slice(0, 8).join(" · ")}</p>
                </div>
              )}
              <div className="route-accuracy-note">
                Standard driving directions; no live traffic or emergency priority.
              </div>
            </>
          ) : (
            <div className="route-empty-state">
              <span className="route-empty-icon"><Icon name="route" /></span>
              <h3>Route details will appear here</h3>
              <p>Choose an emergency service and two locations, then select Find Route.</p>
              {mapPickMode && <strong>Click a point on the map to set the {mapPickMode === "origin" ? "starting location" : "destination"}.</strong>}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export type { MapPickMode };
