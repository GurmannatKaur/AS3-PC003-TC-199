import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Overview from "./pages/Overview";
import TrafficMap from "./pages/TrafficMap";
import TrafficPrediction from "./pages/TrafficPrediction";
import FederatedLearning from "./pages/FederatedLearning";
import CommunicationCost from "./pages/CommunicationCost";
import EmergencyRouteSupport from "./pages/EmergencyRouteSupport";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route
            path="/"
            element={<Overview />}
          />

          <Route
            path="/traffic-map"
            element={<TrafficMap />}
          />

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
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;