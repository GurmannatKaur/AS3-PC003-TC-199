from ml.communication.cost_calculator import calculate_communication_cost


class CommunicationTracker:
    def __init__(self):
        self.rounds: list[dict] = []

    def record_round(self, round_number: int, client_payloads: list[dict]) -> dict:
        result = {"round": round_number, **calculate_communication_cost(client_payloads)}
        self.rounds.append(result)
        return result
