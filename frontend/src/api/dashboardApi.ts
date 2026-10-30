import { apiRequest } from "./axiosInstance";
import type {
  DashboardResponse,
  TrafficMapResponse,
} from "../types/dashboard";

export function getDashboard(signal?: AbortSignal) {
  return apiRequest<DashboardResponse>("/dashboard", { signal });
}

export function getTrafficMap(
  options: { trafficLevel?: string; includeOffline?: boolean; signal?: AbortSignal } = {},
) {
  const query = new URLSearchParams();
  if (options.trafficLevel) {
    query.set("traffic_level", options.trafficLevel);
  }
  if (options.includeOffline !== undefined) {
    query.set("include_offline", String(options.includeOffline));
  }
  const queryString = query.toString();
  const suffix = queryString ? `?${queryString}` : "";
  return apiRequest<TrafficMapResponse>(`/traffic/map${suffix}`, {
    signal: options.signal,
  });
}
