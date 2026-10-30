export interface FederatedTrainingRequest {
  rounds: number;
  local_epochs: number;
  learning_rate: number;
  num_clients: number;
}

export interface FederatedMetrics {
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  evaluation_samples: number;
  metrics_source: string;
}

export interface FederatedRoundResult {
  round: number;
  status: string;
  participating_clients: number;
  total_samples: number;
  training_loss: number;
  duration_seconds: number;
  global_model_version: string;
  metrics: FederatedMetrics;
  upload_bytes: number;
  download_bytes: number;
  total_bytes: number;
  total_mb: number;
}

export interface FederatedStatusResponse {
  status: string;
  phase: string;
  current_round: number;
  total_rounds: number;
  participating_clients: number;
  completed_rounds: number[];
  global_model_version: string;
  model_trained: boolean;
  model_metrics: FederatedMetrics | null;
  evaluation_samples: number;
  metrics_source: string | null;
  training_duration_seconds: number | null;
  started_at: string | null;
  completed_at: string | null;
  last_error: string | null;
  data_source: string;
  execution_mode: string;
}

export interface FederatedStartResponse {
  message: string;
  status: string;
  configuration: FederatedTrainingRequest;
}

export interface FederatedStopResponse {
  message: string;
  status: string;
}

export interface FederatedRoundsResponse {
  rounds: FederatedRoundResult[];
  total_rounds: number;
  configured_rounds: number;
}

export interface FederatedClient {
  client_id: string;
  name: string;
  status: string;
  data_source: string;
  execution_mode: string;
  training_samples: number;
  last_completed_round: number;
}

export interface FederatedClientsResponse {
  clients: FederatedClient[];
  total_clients: number;
  execution_mode: string;
}
