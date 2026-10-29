from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.core.database import Base


class TrainingRound(Base):
    __tablename__ = "training_rounds"

    id = Column(Integer, primary_key=True, index=True)

    round_number = Column(Integer, nullable=False, unique=True)

    status = Column(
        String(30),
        nullable=False,
        default="Pending",
    )

    participating_clients = Column(Integer, default=0, nullable=False)
    total_samples = Column(Integer, default=0, nullable=False)

    training_loss = Column(Float, nullable=True)
    validation_loss = Column(Float, nullable=True)

    started_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    completed_at = Column(DateTime, nullable=True)

    global_model_version = Column(
        String(50),
        nullable=True,
    )