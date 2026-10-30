import { apiRequest } from "./axiosInstance";
import type {
  FederatedClientsResponse,
  FederatedRoundsResponse,
  FederatedStartResponse,
  FederatedStatusResponse,
  FederatedStopResponse,
  FederatedTrainingRequest,
} from "../types/federated";

export function getFederatedStatus(signal?: AbortSignal) {
  return apiRequest<FederatedStatusResponse>("/federated/status", { signal });
}

export function getFederatedRounds(signal?: AbortSignal) {
  return apiRequest<FederatedRoundsResponse>("/federated/rounds", { signal });
}

export function getFederatedClients(signal?: AbortSignal) {
  return apiRequest<FederatedClientsResponse>("/federated/clients", { signal });
}

export function startFederatedTraining(configuration: FederatedTrainingRequest) {
  return apiRequest<FederatedStartResponse>("/federated/start", {
    method: "POST",
    body: JSON.stringify(configuration),
  });
}

export function stopFederatedTraining() {
  return apiRequest<FederatedStopResponse>("/federated/stop", {
    method: "POST",
  });
}
