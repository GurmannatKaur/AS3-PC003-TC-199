import { useEffect } from "react";
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
import type { MapPickMode } from "./EmergencyRouteRouting";

type ChandigarhMapProps = {
  selectedRoadId?: string;
  onSelectRoad?: (roadId: string) => void;
  className?: string;
  routePlan?: RoutePlan | null;
  mapPickMode?: MapPickMode;
  onMapLocationPicked?: (coordinates: Coordinates) => void;
};

const center: [number, number] = [30.7333, 76.7794];
const congestionColors = {
  High: "#ff796c",
  Moderate: "#f4ad3d",
  Low: "#4bc797",
};

function MapBehavior({
  selectedRoadId,
  routePlan,
}: {
  selectedRoadId?: string;
  routePlan?: RoutePlan | null;
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
      const selectedRoad = roads.find((road) => road.id === selectedRoadId);
      if (selectedRoad) {
        map.panTo(selectedRoad.position, { animate: true, duration: 0.45 });
      }
    }

    return () => {
      window.cancelAnimationFrame(frame);
      container.removeEventListener("mouseenter", enableWheelZoom);
      container.removeEventListener("mouseleave", disableWheelZoom);
      disableWheelZoom();
    };
  }, [map, selectedRoadId, routePlan, activeRoute]);

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
}: {
  selectedRoadId?: string;
  onSelectRoad?: (roadId: string) => void;
}) {
  const map = useMap();
  const selectedRoad = roads.find((road) => road.id === selectedRoadId) ?? roads[0];
  const { speedUnit } = usePreferences();

  return (
    <>
      <div className="map-floating-controls">
        <label className="map-road-select">
          <Icon name="location" className="map-control-pin" />
          <span className="sr-only">Select a road</span>
          <select
            value={selectedRoad.id}
            onChange={(event) => onSelectRoad?.(event.target.value)}
            aria-label="Select a road"
          >
            {roads.map((road) => (
              <option value={road.id} key={road.id}>{road.name}</option>
            ))}
          </select>
        </label>
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

      <div className="map-selected-chip">
        <span className={`traffic-dot ${selectedRoad.congestion.toLowerCase()}`} />
        <span className="map-chip-copy">
          <strong>{selectedRoad.name}</strong>
          <small>{selectedRoad.congestion} · {formatSpeed(selectedRoad.averageSpeed, speedUnit)} · {selectedRoad.flow.toLocaleString()} veh/h</small>
        </span>
      </div>
    </>
  );
}

export default function ChandigarhMap({
  selectedRoadId,
  onSelectRoad,
  className = "",
  routePlan,
  mapPickMode = null,
  onMapLocationPicked,
}: ChandigarhMapProps) {
  const { compactMapLabels } = usePreferences();

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
        <MapBehavior selectedRoadId={selectedRoadId} routePlan={routePlan} />
        <MapLocationPicker mode={mapPickMode} onPick={onMapLocationPicked} />
        <FloatingMapControls
          selectedRoadId={selectedRoadId}
          onSelectRoad={onSelectRoad}
        />
        {roads.map((road) => (
          <CircleMarker
            key={road.id}
            center={road.position}
            radius={selectedRoadId === road.id ? 13 : 10}
            pathOptions={{
              color: "#ffffff",
              weight: selectedRoadId === road.id ? 4 : 3,
              fillColor: congestionColors[road.congestion],
              fillOpacity: 0.98,
            }}
            eventHandlers={{
              click: () => onSelectRoad?.(road.id),
            }}
          >
            <Popup>
              <div className="junction-popup">
                <strong>{road.name}</strong>
                <span>{road.junction} · Chandigarh</span>
                <span className={`traffic-level ${road.congestion.toLowerCase()}`}>
                  {road.congestion} traffic
                </span>
                <small>Sample scenario · approximate marker location</small>
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
        <span className="legend-sample">Sample scenario</span>
      </div>
    </div>
  );
}
