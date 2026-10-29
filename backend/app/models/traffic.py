from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.core.database import Base


class TrafficRecord(Base):
    __tablename__ = "traffic_records"

    id = Column(Integer, primary_key=True, index=True)

    client_id = Column(String(50), nullable=False, index=True)
    road_segment = Column(String(100), nullable=False)

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    vehicle_count = Column(Integer, nullable=False, default=0)
    traffic_flow = Column(Float, nullable=False, default=0.0)
    average_speed = Column(Float, nullable=False, default=0.0)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    data_source = Column(
        String(50),
        nullable=False,
        default="sample",
    )