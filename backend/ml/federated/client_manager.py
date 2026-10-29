from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class FederatedClientInfo:
    client_id: str
    name: str
    location: str = "Unknown"
    is_online: bool = False
    total_samples: int = 0
    last_seen: datetime | None = None


@dataclass
class FederatedClientManager:
    clients: dict[str, FederatedClientInfo] = field(
        default_factory=dict
    )

    def register_client(
        self,
        client_id: str,
        name: str,
        location: str = "Unknown",
        total_samples: int = 0,
    ) -> FederatedClientInfo:
        if total_samples < 0:
            raise ValueError("Sample count cannot be negative.")

        client = FederatedClientInfo(
            client_id=client_id,
            name=name,
            location=location,
            is_online=True,
            total_samples=total_samples,
            last_seen=datetime.utcnow(),
        )

        self.clients[client_id] = client
        return client

    def set_client_status(
        self,
        client_id: str,
        is_online: bool,
    ) -> FederatedClientInfo:
        client = self.clients.get(client_id)

        if client is None:
            raise ValueError(f"Client '{client_id}' is not registered.")

        client.is_online = is_online
        client.last_seen = datetime.utcnow()

        return client

    def get_client(
        self,
        client_id: str,
    ) -> FederatedClientInfo | None:
        return self.clients.get(client_id)

    def get_all_clients(self) -> list[FederatedClientInfo]:
        return list(self.clients.values())

    def get_online_clients(self) -> list[FederatedClientInfo]:
        return [
            client
            for client in self.clients.values()
            if client.is_online
        ]

    def get_online_client_count(self) -> int:
        return len(self.get_online_clients())

    def remove_client(self, client_id: str) -> bool:
        return self.clients.pop(client_id, None) is not None