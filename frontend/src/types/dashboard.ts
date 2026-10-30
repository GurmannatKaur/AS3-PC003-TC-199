export interface DashboardResponse {
  training_round: number;
  participating_clients: number;
  predicted_traffic_status: string;
  global_model_status: string;
  evaluation_metrics: {
    mae: number | null;
    mse: number | null;
    rmse: number | null;
    r2: number | null;
  };
  communication_cost_mb: number;
  recent_training_rounds: number[];
  data_source: string;
}

export interface TrafficMapNode {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  traffic_level: "High" | "Moderate" | "Low";
  status: "high" | "moderate" | "low";
  vehicle_count: number;
  average_speed: number;
  client_status: "Configured";
}

export interface TrafficMapResponse {
  nodes: TrafficMapNode[];
  total_nodes: number;
  data_source: string;
  is_live: boolean;
}
