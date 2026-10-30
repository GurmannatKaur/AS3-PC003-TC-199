export type PredictionHorizon = 5 | 10 | 15;

export interface TrafficPredictionRequest {
  location: string;
  current_flow: number;
  vehicle_count: number;
  average_speed: number;
  horizon_minutes: PredictionHorizon;
}

export interface TrafficPredictionResponse {
  location: string;
  horizon_minutes: PredictionHorizon;
  current_flow: number;
  predicted_flow: number;
  average_speed: number;
  congestion_level: "High" | "Moderate" | "Low";
  data_source: string;
  is_model_prediction: boolean;
}

export interface PredictionFeedResponse {
  predictions: Array<{
    horizon_minutes: PredictionHorizon;
    predicted_flow: number;
  }>;
  data_source: string;
  is_live: boolean;
  model_status: string;
}
