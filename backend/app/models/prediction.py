from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.core.database import Base


class TrafficPrediction(Base):
    __tablename__ = "traffic_predictions"

    id = Column(Integer, primary_key=True, index=True)

    client_id = Column(String(50), nullable=False, index=True)
    road_segment = Column(String(100), nullable=False)

    predicted_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    horizon_minutes = Column(Integer, nullable=False)

    predicted_flow = Column(Float, nullable=False)
    predicted_speed = Column(Float, nullable=True)

    congestion_level = Column(
        String(20),
        nullable=False,
    )

    model_version = Column(
        String(50),
        nullable=True,
    )

    data_source = Column(
        String(50),
        default="sample",
        nullable=False,
    )