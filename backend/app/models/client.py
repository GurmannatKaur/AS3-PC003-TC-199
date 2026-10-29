from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.core.database import Base


class FederatedClient(Base):
    __tablename__ = "federated_clients"

    id = Column(Integer, primary_key=True, index=True)

    client_id = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    name = Column(String(100), nullable=False)
    location = Column(String(150), nullable=True)

    is_online = Column(Boolean, default=True, nullable=False)

    total_samples = Column(Integer, default=0, nullable=False)
    last_seen = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    data_source = Column(
        String(50),
        default="sample",
        nullable=False,
    )