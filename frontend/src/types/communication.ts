export interface CommunicationSummary {
  total_upload_bytes: number;
  total_download_bytes: number;
  total_bytes: number;
  total_mb: number;
  total_rounds: number;
  data_source: string;
}

export interface CommunicationRound {
  round: number;
  upload_bytes: number;
  download_bytes: number;
  total_bytes: number;
  total_mb: number;
}

export interface CommunicationRoundsResponse {
  rounds: CommunicationRound[];
  total_rounds: number;
}
