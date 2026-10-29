
import { useEffect, useRef, useState } from "react";
import ChandigarhMap from "../components/ChandigarhMap";
import EmergencyRouteRouting from "../components/EmergencyRouteRouting";
import type { MapPickMode } from "../components/EmergencyRouteRouting";
import Icon from "../components/common/Icon";
import { findEmergencyRoutes, RoutingError } from "../api/routingApi";
import type {
  Coordinates,
  EmergencyService,
  RoutePlan,
  RoutePreference,
  RoutingLocation,
} from "../api/routingApi";
import { roads } from "../data/trafficSamples";
import { formatSpeed, usePreferences } from "../data/preferences";

export default function TrafficMap() {
  const { speedUnit } = usePreferences();
  const [selectedRoadId, setSelectedRoadId] = useState(roads[0].id);

  const selectedRoad =
    roads.find((road) => road.id === selectedRoadId) ?? roads[0];

  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [origin, setOrigin] = useState<RoutingLocation | null>(null);
  const [destination, setDestination] = useState<RoutingLocation | null>(null);
  const [service, setService] = useState<EmergencyService>("ambulance");
  const [preference, setPreference] = useState<RoutePreference>("fastest");
  const [mapPickMode, setMapPickMode] = useState<MapPickMode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => requestController.current?.abort();
  }, []);

  const cancelRouteRequest = () => {
    requestController.current?.abort();
    requestController.current = null;
    setIsLoading(false);
  };

  const updateOrigin = (location: RoutingLocation | null) => {
    cancelRouteRequest();
    setRoutePlan(null);
    setOrigin(location);
    setErrorMessage("");
  };

  const updateDestination = (location: RoutingLocation | null) => {
    cancelRouteRequest();
    setRoutePlan(null);
    setDestination(location);
    setErrorMessage("");
  };

  const pickMapLocation = (coordinates: Coordinates) => {
    const location: RoutingLocation = {
      id: `map-${coordinates[0].toFixed(5)}-${coordinates[1].toFixed(5)}`,
      name: `Map pin (${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)})`,
      coordinates,
    };

    if (mapPickMode === "origin") updateOrigin(location);
    if (mapPickMode === "destination") updateDestination(location);

    setMapPickMode(null);
  };

  const calculateRoute = async () => {
    setErrorMessage("");

    if (!origin || !destination) {
      setErrorMessage("Choose both a starting location and a destination.");
      return;
    }

    if (
      origin.coordinates[0] === destination.coordinates[0] &&
      origin.coordinates[1] === destination.coordinates[1]
    ) {
      setErrorMessage("Choose two different locations to plan a route.");
      return;
    }

    requestController.current?.abort();

    const controller = new AbortController();
    requestController.current = controller;

    setIsLoading(true);
    setRoutePlan(null);

    try {
      const plan = await findEmergencyRoutes({
        origin,
        destination,
        service,
        preference,
        signal: controller.signal,
      });

      setRoutePlan(plan);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setErrorMessage(
        error instanceof RoutingError
          ? error.message
          : "The route could not be calculated. Try again."
      );
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const clearRoute = () => {
    cancelRouteRequest();
    setRoutePlan(null);
    setOrigin(null);
    setDestination(null);
    setMapPickMode(null);
    setErrorMessage("");
  };

  return (
    <div className="page-stack">
      <section className="network-map-stage">
        <ChandigarhMap
          selectedRoadId={selectedRoadId}
          onSelectRoad={setSelectedRoadId}
          className="network-page-map"
          routePlan={routePlan}
          mapPickMode={mapPickMode}
          onMapLocationPicked={pickMapLocation}
        />

        <div className="network-title-float">
          <span className="network-title-icon">
            <Icon name="location" />
          </span>
          <div>
            <strong>Chandigarh, India</strong>
            <small>Explore key traffic corridors</small>
          </div>
        </div>

        <aside
          className="network-road-float"
          aria-label="Select a traffic corridor"
        >
          <span className="eyebrow">YOUR CORRIDORS</span>

          {roads.map((road) => (
            <button
              className={`network-road-chip ${
                selectedRoad.id === road.id ? "active" : ""
              }`}
              key={road.id}
              onClick={() => setSelectedRoadId(road.id)}
              aria-pressed={selectedRoad.id === road.id}
              type="button"
            >
              <span
                className={`traffic-dot ${road.congestion.toLowerCase()}`}
              />
              <span>
                <strong>{road.name}</strong>
                <small>{road.junction}</small>
              </span>
              <span
                className={`traffic-level ${road.congestion.toLowerCase()}`}
              >
                {road.congestion}
              </span>
            </button>
          ))}
        </aside>

        <div className="network-bottom-float">
          <span
            className={`traffic-dot ${selectedRoad.congestion.toLowerCase()}`}
          />
          <span>
            <strong>{selectedRoad.name}</strong>
            <small>
              {selectedRoad.congestion} traffic ·{" "}
              {formatSpeed(selectedRoad.averageSpeed, speedUnit)} ·{" "}
              {selectedRoad.flow.toLocaleString()} veh/h sample
            </small>
          </span>
        </div>

        <span className="map-location-note">
          Approximate corridor markers · sample scenario
        </span>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NETWORK OVERVIEW</span>
            <h2>Traffic corridors</h2>
            <p>
              Explore the sample traffic information associated with each
              configured road.
            </p>
          </div>
          <span className="count-pill">{roads.length} configured roads</span>
        </div>

        <div className="overview-road-grid">
          {roads.map((road) => (
            <button
              className={`overview-road-card road-${road.id} ${
                selectedRoad.id === road.id ? "selected" : ""
              }`}
              key={road.id}
              onClick={() => setSelectedRoadId(road.id)}
              aria-pressed={selectedRoad.id === road.id}
              type="button"
            >
              <span className="road-card-top">
                <span
                  className={`road-marker ${road.congestion.toLowerCase()}`}
                />
                <span
                  className={`traffic-level ${road.congestion.toLowerCase()}`}
                >
                  {road.congestion}
                </span>
              </span>
              <strong>{road.name}</strong>
              <small>{road.junction}</small>
              <span className="road-card-foot">
                <span>{formatSpeed(road.averageSpeed, speedUnit)}</span>
                <span>{road.flow.toLocaleString()} veh/h</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <EmergencyRouteRouting
        routePlan={routePlan}
        origin={origin}
        destination={destination}
        service={service}
        preference={preference}
        isLoading={isLoading}
        errorMessage={errorMessage}
        mapPickMode={mapPickMode}
        onRoutePlanChange={setRoutePlan}
        onOriginChange={updateOrigin}
        onDestinationChange={updateDestination}
        onServiceChange={(nextService) => {
          cancelRouteRequest();
          setService(nextService);
          setRoutePlan((current) =>
            current ? { ...current, service: nextService } : current
          );
        }}
        onPreferenceChange={(nextPreference) => {
          cancelRouteRequest();
          setPreference(nextPreference);
        }}
        onMapPickModeChange={setMapPickMode}
        onCalculateRoute={() => void calculateRoute()}
        onClearRoute={clearRoute}
      />
    </div>
  );
}
