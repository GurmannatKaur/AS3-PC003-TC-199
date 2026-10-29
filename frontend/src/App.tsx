
import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Overview from "./pages/Overview";
import TrafficMap from "./pages/TrafficMap";
import TrafficPrediction from "./pages/TrafficPrediction";
import FederatedLearning from "./pages/FederatedLearning";
import CommunicationCost from "./pages/CommunicationCost";
import EmergencyRouteSupport from "./pages/EmergencyRouteSupport";
import Clients from "./pages/clients";
import Settings from "./pages/Settings";

import { PreferencesProvider } from "./data/preferences";
import { roads } from "./data/trafficSamples";

function ClientsRoute() {
  const navigate = useNavigate();
  const [selectedRoadId, setSelectedRoadId] = useState(roads[0].id);

  return (
    <Clients
      onNavigate={() => navigate("/traffic-map")}
      selectedRoadId={selectedRoadId}
      onSelectRoad={setSelectedRoadId}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <PreferencesProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/traffic-map" element={<TrafficMap />} />
            <Route
              path="/traffic-prediction"
              element={<TrafficPrediction />}
            />
            <Route
              path="/federated-learning"
              element={<FederatedLearning />}
            />
            <Route
              path="/communication-cost"
              element={<CommunicationCost />}
            />
            <Route
              path="/emergency-route-support"
              element={<EmergencyRouteSupport />}
            />
            <Route path="/clients" element={<ClientsRoute />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AppLayout>
      </PreferencesProvider>
    </BrowserRouter>
  );
}

export default App;
