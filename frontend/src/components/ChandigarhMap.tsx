
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./ChandigarhMap.css";

type TrafficLevel = "High" | "Medium" | "Low";

interface Junction {
  id: string;
  name: string;
  position: [number, number];
  traffic: TrafficLevel;
  color: string;
  status: string;
}

const junctions: Junction[] = [
  {
    id: "Client 1",
    name: "Sector 17 Junction",
    position: [30.7415, 76.7821],
    traffic: "Medium",
    color: "#eab308",
    status: "Ready for local training",
  },
  {
    id: "Client 2",
    name: "Sector 22 Junction",
    position: [30.7333, 76.7725],
    traffic: "High",
    color: "#ef4444",
    status: "Ready for local training",
  },
  {
    id: "Client 3",
    name: "Sector 35 Junction",
    position: [30.7245, 76.7645],
    traffic: "Low",
    color: "#22c55e",
    status: "Ready for local training",
  },
];

export default function ChandigarhMap() {
  return (
    <div className="chandigarh-map">
      <MapContainer
        center={[30.7333, 76.7794]}
        zoom={13}
        scrollWheelZoom={true}
        className="chandigarh-map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {junctions.map((junction) => (
          <CircleMarker
            key={junction.id}
            center={junction.position}
            radius={9}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: junction.color,
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div className="junction-popup">
                <strong>{junction.id}</strong>
                <br />
                {junction.name}
                <br />
                Traffic level:{" "}
                <strong>{junction.traffic}</strong>
                <br />
                <span>{junction.status}</span>
                <br />
                <small>Illustrative traffic data</small>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="map-legend">
        <span className="legend-item">
          <i className="legend-dot high" />
          High
        </span>

        <span className="legend-item">
          <i className="legend-dot medium" />
          Medium
        </span>

        <span className="legend-item">
          <i className="legend-dot low" />
          Low
        </span>
      </div>
    </div>
  );
}
