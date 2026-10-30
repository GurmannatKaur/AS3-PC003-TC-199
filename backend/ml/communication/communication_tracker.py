from ml.communication.cost_calculator import calculate_communication_cost


class CommunicationTracker:
    def __init__(self):
        self.rounds: list[dict] = []

    def record_round(self, round_number: int, client_payloads: list[dict]) -> dict:
        if isinstance(round_number, bool) or not isinstance(round_number, int):
            raise ValueError("Round number must be a positive integer.")
        if round_number < 1:
            raise ValueError("Round number must be a positive integer.")
        if self.rounds and round_number <= self.rounds[-1]["round"]:
            raise ValueError("Round numbers must increase monotonically.")

        result = {"round": round_number, **calculate_communication_cost(client_payloads)}
        self.rounds.append(result)
        return result.copy()
