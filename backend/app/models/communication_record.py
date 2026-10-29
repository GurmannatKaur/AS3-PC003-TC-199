from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.core.database import Base


class CommunicationRecord(Base):
    __tablename__ = "communication_records"

    id = Column(Integer, primary_key=True, index=True)

    round_number = Column(Integer, index=True, nullable=False)
    client_id = Column(String, index=True, nullable=False)

    upload_bytes = Column(Integer, default=0, nullable=False)
    download_bytes = Column(Integer, default=0, nullable=False)
    total_bytes = Column(Integer, default=0, nullable=False)
    total_mb = Column(Float, default=0.0, nullable=False)

    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)