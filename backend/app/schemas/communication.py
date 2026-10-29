from datetime import datetime

from pydantic import BaseModel, Field


class CommunicationCostResponse(BaseModel):
    round_number: int
    client_id: str
    upload_bytes: int = Field(default=0, ge=0)
    download_bytes: int = Field(default=0, ge=0)
    total_bytes: int = Field(default=0, ge=0)
    total_mb: float = Field(default=0.0, ge=0)
    recorded_at: datetime


class CommunicationCostSummary(BaseModel):
    total_upload_bytes: int = 0
    total_download_bytes: int = 0
    total_communication_bytes: int = 0
    total_communication_mb: float = 0.0
    average_round_cost_mb: float = 0.0
    total_rounds: int = 0


class CommunicationRoundResponse(BaseModel):
    round_number: int
    upload_bytes: int = 0
    download_bytes: int = 0
    total_bytes: int = 0
    total_mb: float = 0.0