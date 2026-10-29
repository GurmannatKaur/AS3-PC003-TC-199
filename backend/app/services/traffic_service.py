from sqlalchemy.orm import Session

from app.models.traffic import TrafficRecord
from app.schemas.traffic import TrafficRecordCreate


def create_traffic_record(
    db: Session,
    traffic_data: TrafficRecordCreate,
) -> TrafficRecord:
    record = TrafficRecord(
        client_id=traffic_data.client_id,
        road_segment=traffic_data.road_segment,
        timestamp=traffic_data.timestamp,
        vehicle_count=traffic_data.vehicle_count,
        traffic_flow=traffic_data.traffic_flow,
        average_speed=traffic_data.average_speed,
        lat=traffic_data.latitude,
        long=traffic_data.longitude,
        data_source=traffic_data.data_source,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def get_traffic_records(
    db: Session,
    limit: int = 100,
) -> list[TrafficRecord]:
    return (
        db.query(TrafficRecord)
        .order_by(TrafficRecord.timestamp.desc())
        .limit(limit)
        .all()
    )


def get_traffic_record_by_id(
    db: Session,
    record_id: int,
) -> TrafficRecord | None:
    return (
        db.query(TrafficRecord)
        .filter(TrafficRecord.id == record_id)
        .first()
    )