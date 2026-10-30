
import { useCallback, useEffect, useRef, useState } from "react";
import ChandigarhMap from "../components/ChandigarhMap";
import EmergencyRouteRouting from "../components/EmergencyRouteRouting";
import type { MapPickMode } from "../components/EmergencyRouteRouting";
import Icon from "../components/common/Icon";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import { getTrafficMap } from "../api/dashboardApi";
import { findEmergencyRoutes, RoutingError } from "../api/routingApi";
import type {
  Coordinates,
  EmergencyService,
  RoutePlan,
  RoutePreference,
  RoutingLocation,
} from "../api/routingApi";
import { formatSpeed, usePreferences } from "../data/preferences";
import type { TrafficMapNode } from "../types/dashboard";

export default function TrafficMap() {
  const { speedUnit } = usePreferences();
  const [trafficNodes, setTrafficNodes] = useState<TrafficMapNode[]>([]);
  const [selectedRoadId, setSelectedRoadId] = useState<string>();
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState("");

  const loadTrafficMap = useCallback(async (signal?: AbortSignal) => {
    setMapLoading(true);
    setMapError("");
    try {
      const response = await getTrafficMap({ signal });
      setTrafficNodes(response.nodes);
      setSelectedRoadId((current) =>
        response.nodes.some((node) => node.id === current)
          ? current
          : response.nodes[0]?.id,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMapError(
        error instanceof Error ? error.message : "Traffic map data could not be loaded.",
      );
    } finally {
      if (!signal?.aborted) setMapLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadTrafficMap(controller.signal);
    return () => controller.abort();
  }, [loadTrafficMap]);

  const selectedRoad = trafficNodes.find((node) => node.id === selectedRoadId);

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
          trafficNodes={trafficNodes}
          mapPickMode={mapPickMode}
          onMapLocationPicked={pickMapLocation}
        />

        {mapLoading && <LoadingState message="Loading traffic locations…" />}
        {mapError && (
          <ErrorState message={mapError} onRetry={() => void loadTrafficMap()} />
        )}
        {!mapLoading && !mapError && trafficNodes.length === 0 && (
          <EmptyState message="The traffic map has no locations to display." />
        )}

        <div className="network-title-float">
          <span className="network-title-icon">
            <Icon name="location" />
          </span>
          <div>
            <strong>Chandigarh, India</strong>
            <small>Backend traffic locations · sample data</small>
          </div>
        </div>

        <aside
          className="network-road-float"
          aria-label="Select a traffic corridor"
        >
          <span className="eyebrow">YOUR CORRIDORS</span>

          {trafficNodes.map((road) => (
            <button
              className={`network-road-chip ${
                selectedRoad?.id === road.id ? "active" : ""
              }`}
              key={road.id}
              onClick={() => setSelectedRoadId(road.id)}
              aria-pressed={selectedRoad?.id === road.id}
              type="button"
            >
              <span
                className={`traffic-dot ${road.traffic_level.toLowerCase()}`}
              />
              <span>
                <strong>{road.name}</strong>
                <small>Sample status: {road.client_status}</small>
              </span>
              <span
                className={`traffic-level ${road.traffic_level.toLowerCase()}`}
              >
                {road.traffic_level}
              </span>
            </button>
          ))}
        </aside>

        {selectedRoad && (
          <div className="network-bottom-float">
            <span
              className={`traffic-dot ${selectedRoad.traffic_level.toLowerCase()}`}
            />
            <span>
              <strong>{selectedRoad.name}</strong>
              <small>
                {selectedRoad.traffic_level} traffic ·{" "}
                {formatSpeed(selectedRoad.average_speed, speedUnit)} ·{" "}
                {selectedRoad.vehicle_count.toLocaleString()} vehicles · sample
              </small>
            </span>
          </div>
        )}

        <span className="map-location-note">
          Backend-provided approximate locations · sample data, not live
        </span>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NETWORK OVERVIEW</span>
            <h2>Traffic corridors</h2>
            <p>
              Traffic locations returned by the backend. Values are sample data,
              not live sensor measurements.
            </p>
          </div>
          <span className="count-pill">{trafficNodes.length} locations</span>
        </div>

        {mapLoading ? (
          <LoadingState message="Loading traffic locations…" />
        ) : mapError ? (
          <ErrorState message={mapError} onRetry={() => void loadTrafficMap()} />
        ) : trafficNodes.length === 0 ? (
          <EmptyState message="No traffic locations are available." />
        ) : (
          <div className="overview-road-grid">
            {trafficNodes.map((node) => (
              <button
                className={`overview-road-card road-${node.id} ${
                  selectedRoad?.id === node.id ? "selected" : ""
                }`}
                key={node.id}
                onClick={() => setSelectedRoadId(node.id)}
                aria-pressed={selectedRoad?.id === node.id}
                type="button"
              >
                <span className="road-card-top">
                  <span className={`road-marker ${node.traffic_level.toLowerCase()}`} />
                  <span className={`traffic-level ${node.traffic_level.toLowerCase()}`}>
                    {node.traffic_level}
                  </span>
                </span>
                <strong>{node.name}</strong>
                <small>{node.client_status} client</small>
                <span className="road-card-foot">
                  <span>{formatSpeed(node.average_speed, speedUnit)}</span>
                  <span>{node.vehicle_count.toLocaleString()} vehicles</span>
                </span>
              </button>
            ))}
          </div>
        )}
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
