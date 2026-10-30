import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./ChandigarhMap.css";
import { roads } from "../data/trafficSamples";
import { formatSpeed, usePreferences } from "../data/preferences";
import Icon from "./common/Icon";
import type { Coordinates, RoutePlan } from "../api/routingApi";
import type { TrafficMapNode } from "../types/dashboard";
import type { MapPickMode } from "./EmergencyRouteRouting";

type ChandigarhMapProps = {
  selectedRoadId?: string;
  onSelectRoad?: (roadId: string) => void;
  className?: string;
  routePlan?: RoutePlan | null;
  trafficNodes?: TrafficMapNode[];
  mapPickMode?: MapPickMode;
  onMapLocationPicked?: (coordinates: Coordinates) => void;
};

interface MapLocation {
  id: string;
  name: string;
  position: [number, number];
  congestion: "High" | "Moderate" | "Low";
  averageSpeed: number;
  vehicleCount: number;
  detail: string;
}

const center: [number, number] = [30.7333, 76.7794];
const congestionColors = {
  High: "#ff796c",
  Moderate: "#f4ad3d",
  Low: "#4bc797",
};

function getMapLocations(trafficNodes?: TrafficMapNode[]): MapLocation[] {
  if (trafficNodes) {
    return trafficNodes.map((node) => ({
      id: node.id,
      name: node.name,
      position: [node.latitude, node.longitude] as [number, number],
      congestion: node.traffic_level,
      averageSpeed: node.average_speed,
      vehicleCount: node.vehicle_count,
      detail: node.client_status,
    }));
  }

  return roads.map((road) => ({
    id: road.id,
    name: road.name,
    position: road.position,
    congestion: road.congestion,
    averageSpeed: road.averageSpeed,
    vehicleCount: road.flow,
    detail: "Traffic corridor",
  }));
}

function MapBehavior({
  selectedRoadId,
  routePlan,
  locations,
}: {
  selectedRoadId?: string;
  routePlan?: RoutePlan | null;
  locations: MapLocation[];
}) {
  const map = useMap();
  const activeRoute = routePlan?.options.find((option) => option.id === routePlan.selectedOptionId);

  useEffect(() => {
    const container = map.getContainer();
    const enableWheelZoom = () => map.scrollWheelZoom.enable();
    const disableWheelZoom = () => map.scrollWheelZoom.disable();
    const frame = window.requestAnimationFrame(() => map.invalidateSize());

    container.addEventListener("mouseenter", enableWheelZoom);
    container.addEventListener("mouseleave", disableWheelZoom);
    disableWheelZoom();

    if (activeRoute && activeRoute.coordinates.length > 1) {
      map.fitBounds(activeRoute.coordinates, { padding: [72, 72], maxZoom: 15, animate: true });
    } else if (selectedRoadId) {
      const selectedLocation = locations.find((location) => location.id === selectedRoadId);
      if (selectedLocation) {
        map.panTo(selectedLocation.position, { animate: true, duration: 0.45 });
      }
    }

    return () => {
      window.cancelAnimationFrame(frame);
      container.removeEventListener("mouseenter", enableWheelZoom);
      container.removeEventListener("mouseleave", disableWheelZoom);
      disableWheelZoom();
    };
  }, [map, selectedRoadId, routePlan, activeRoute, locations]);

  return null;
}

function MapLocationPicker({
  mode,
  onPick,
}: {
  mode: MapPickMode;
  onPick?: (coordinates: Coordinates) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.getContainer().style.cursor = mode ? "crosshair" : "";
    return () => {
      map.getContainer().style.cursor = "";
    };
  }, [map, mode]);

  useMapEvents({
    click(event) {
      if (mode) {
        onPick?.([event.latlng.lat, event.latlng.lng]);
      }
    },
  });

  return null;
}

function EmergencyRouteLayer({ routePlan }: { routePlan: RoutePlan | null | undefined }) {
  const activeRoute = routePlan?.options.find((option) => option.id === routePlan.selectedOptionId);
  const alternatives = routePlan?.options.filter((option) => option.id !== routePlan.selectedOptionId) ?? [];

  if (!routePlan || !activeRoute) return null;

  return (
    <>
      {alternatives.map((option) => (
        <Polyline
          key={option.id}
          positions={option.coordinates}
          pathOptions={{ color: "#8fb9d7", weight: 5, opacity: 0.62, dashArray: "7 9" }}
          interactive={false}
        />
      ))}
      <Polyline
        positions={activeRoute.coordinates}
        pathOptions={{ color: "#ffffff", weight: 11, opacity: 0.96, lineCap: "round", lineJoin: "round" }}
        interactive={false}
      />
      <Polyline
        positions={activeRoute.coordinates}
        pathOptions={{ color: "#8358db", weight: 7, opacity: 0.96, lineCap: "round", lineJoin: "round" }}
        interactive={false}
      />
      <CircleMarker
        center={routePlan.origin.coordinates}
        radius={11}
        pathOptions={{ color: "#ffffff", weight: 4, fillColor: "#22a982", fillOpacity: 1 }}
        pane="markerPane"
      >
        <Popup><div className="junction-popup"><strong>Origin</strong><span>{routePlan.origin.name}</span></div></Popup>
      </CircleMarker>
      <CircleMarker
        center={routePlan.destination.coordinates}
        radius={11}
        pathOptions={{ color: "#ffffff", weight: 4, fillColor: "#ff746d", fillOpacity: 1 }}
        pane="markerPane"
      >
        <Popup><div className="junction-popup"><strong>Destination</strong><span>{routePlan.destination.name}</span></div></Popup>
      </CircleMarker>
    </>
  );
}

function FloatingMapControls({
  selectedRoadId,
  onSelectRoad,
  locations,
}: {
  selectedRoadId?: string;
  onSelectRoad?: (roadId: string) => void;
  locations: MapLocation[];
}) {
  const map = useMap();
  const selectedLocation =
    locations.find((location) => location.id === selectedRoadId) ?? locations[0];
  const { speedUnit } = usePreferences();

  return (
    <>
      <div className="map-floating-controls">
        {locations.length > 0 && selectedLocation && (
          <label className="map-road-select">
            <Icon name="location" className="map-control-pin" />
            <span className="sr-only">Select a traffic location</span>
            <select
              value={selectedLocation.id}
              onChange={(event) => onSelectRoad?.(event.target.value)}
              aria-label="Select a traffic location"
            >
              {locations.map((location) => (
                <option value={location.id} key={location.id}>{location.name}</option>
              ))}
            </select>
          </label>
        )}
        <div className="map-zoom-controls" aria-label="Map controls">
          <button type="button" onClick={() => map.zoomIn()} aria-label="Zoom in"><Icon name="plus" /></button>
          <button type="button" onClick={() => map.zoomOut()} aria-label="Zoom out"><Icon name="minus" /></button>
          <button
            type="button"
            className="map-reset-button"
            onClick={() => map.setView(center, 13, { animate: true })}
            aria-label="Return to Chandigarh"
            title="Return to Chandigarh"
          >
            <Icon name="location" />
          </button>
        </div>
      </div>

      {selectedLocation && (
        <div className="map-selected-chip">
          <span className={`traffic-dot ${selectedLocation.congestion.toLowerCase()}`} />
          <span className="map-chip-copy">
            <strong>{selectedLocation.name}</strong>
            <small>
              {selectedLocation.congestion} · {formatSpeed(selectedLocation.averageSpeed, speedUnit)} ·{" "}
              {selectedLocation.vehicleCount.toLocaleString()} vehicles
            </small>
          </span>
        </div>
      )}
    </>
  );
}

export default function ChandigarhMap({
  selectedRoadId,
  onSelectRoad,
  className = "",
  routePlan,
  trafficNodes,
  mapPickMode = null,
  onMapLocationPicked,
}: ChandigarhMapProps) {
  const { compactMapLabels } = usePreferences();
  const locations = useMemo(() => getMapLocations(trafficNodes), [trafficNodes]);

  return (
    <div className={`chandigarh-map ${className} ${compactMapLabels ? "compact-labels" : ""}`}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={false}
        className="chandigarh-map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBehavior
          selectedRoadId={selectedRoadId}
          routePlan={routePlan}
          locations={locations}
        />
        <MapLocationPicker mode={mapPickMode} onPick={onMapLocationPicked} />
        <FloatingMapControls
          selectedRoadId={selectedRoadId}
          onSelectRoad={onSelectRoad}
          locations={locations}
        />
        {locations.map((location) => (
          <CircleMarker
            key={location.id}
            center={location.position}
            radius={selectedRoadId === location.id ? 13 : 10}
            pathOptions={{
              color: "#ffffff",
              weight: selectedRoadId === location.id ? 4 : 3,
              fillColor: congestionColors[location.congestion],
              fillOpacity: 0.98,
            }}
            eventHandlers={{
              click: () => onSelectRoad?.(location.id),
            }}
          >
            <Popup>
              <div className="junction-popup">
                <strong>{location.name}</strong>
                <span>Chandigarh</span>
                <span className={`traffic-level ${location.congestion.toLowerCase()}`}>
                  {location.congestion} traffic
                </span>
                <small>{location.detail}</small>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        <EmergencyRouteLayer routePlan={routePlan} />
      </MapContainer>
      <div className="map-legend" aria-label="Traffic level legend">
        {(["Low", "Moderate", "High"] as const).map((level) => (
          <span className="legend-item" key={level}>
            <i className={`legend-dot ${level.toLowerCase()}`} />
            {level}
          </span>
        ))}
      </div>
    </div>
  );
}
