export interface FederatedTrainingRequest {
  rounds: number;
  local_epochs: number;
  learning_rate: number;
  num_clients: number;
}

export interface FederatedStatusResponse {
  status: string;
  current_round: number;
  total_rounds: number;
  participating_clients: number;
  completed_rounds: number[];
  data_source: string;
}

export interface FederatedStartResponse {
  message: string;
  status: string;
  configuration?: FederatedTrainingRequest;
  note?: string;
}

export interface FederatedStopResponse {
  message: string;
  status: string;
}

export interface FederatedRoundsResponse {
  rounds: number[];
  total_rounds: number;
}

export interface FederatedClientsResponse {
  clients: Array<{
    client_id: string;
    name: string;
    status: string;
    data_source: string;
  }>;
  total_clients: number;
}
