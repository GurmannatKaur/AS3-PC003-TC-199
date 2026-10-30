import { apiRequest } from "./axiosInstance";
import type {
  CommunicationRoundsResponse,
  CommunicationSummary,
} from "../types/communication";

export function getCommunicationSummary(signal?: AbortSignal) {
  return apiRequest<CommunicationSummary>("/communication-cost", { signal });
}

export function getCommunicationRounds(signal?: AbortSignal) {
  return apiRequest<CommunicationRoundsResponse>(
    "/communication-cost/rounds",
    { signal },
  );
}
