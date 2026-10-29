from app.models.traffic import TrafficRecord
from app.models.client import FederatedClient
from app.models.training_round import TrainingRound
from app.models.prediction import TrafficPrediction
from app.models.communication_record import CommunicationRecord

__all__ = [
    "TrafficRecord",
    "FederatedClient",
    "TrainingRound",
    "TrafficPrediction",
    "CommunicationRecord",
]