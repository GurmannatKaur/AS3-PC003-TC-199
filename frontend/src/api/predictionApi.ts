import { apiRequest } from "./axiosInstance";
import type {
  PredictionFeedResponse,
  TrafficPredictionRequest,
  TrafficPredictionResponse,
} from "../types/prediction";

export function getPredictions(
  horizonMinutes: TrafficPredictionRequest["horizon_minutes"],
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({
    horizon_minutes: String(horizonMinutes),
  });
  return apiRequest<PredictionFeedResponse>(`/traffic/predictions?${query}`, {
    signal,
  });
}

export function predictTraffic(
  request: TrafficPredictionRequest,
  signal?: AbortSignal,
) {
  return apiRequest<TrafficPredictionResponse>("/traffic/predict", {
    method: "POST",
    body: JSON.stringify(request),
    signal,
  });
}
