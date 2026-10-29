from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.communication_record import CommunicationRecord


def record_communication(
    db: Session,
    round_number: int,
    client_id: str,
    upload_bytes: int = 0,
    download_bytes: int = 0,
) -> CommunicationRecord:
    total_bytes = upload_bytes + download_bytes

    record = CommunicationRecord(
        round_number=round_number,
        client_id=client_id,
        upload_bytes=upload_bytes,
        download_bytes=download_bytes,
        total_bytes=total_bytes,
        total_mb=total_bytes / (1024 * 1024),
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def get_communication_summary(db: Session) -> dict:
    records = db.query(CommunicationRecord).all()

    total_upload = sum(record.upload_bytes for record in records)
    total_download = sum(record.download_bytes for record in records)
    total_bytes = total_upload + total_download

    total_rounds = len(
        {record.round_number for record in records}
    )

    return {
        "total_upload_bytes": total_upload,
        "total_download_bytes": total_download,
        "total_communication_bytes": total_bytes,
        "total_communication_mb": total_bytes / (1024 * 1024),
        "average_round_cost_mb": (
            total_bytes / (1024 * 1024) / total_rounds
            if total_rounds
            else 0.0
        ),
        "total_rounds": total_rounds,
    }


def get_communication_rounds(db: Session) -> list[dict]:
    results = (
        db.query(
            CommunicationRecord.round_number,
            func.sum(CommunicationRecord.upload_bytes).label("upload_bytes"),
            func.sum(CommunicationRecord.download_bytes).label("download_bytes"),
            func.sum(CommunicationRecord.total_bytes).label("total_bytes"),
        )
        .group_by(CommunicationRecord.round_number)
        .order_by(CommunicationRecord.round_number)
        .all()
    )

    return [
        {
            "round_number": row.round_number,
            "upload_bytes": int(row.upload_bytes or 0),
            "download_bytes": int(row.download_bytes or 0),
            "total_bytes": int(row.total_bytes or 0),
            "total_mb": int(row.total_bytes or 0) / (1024 * 1024),
        }
        for row in results
    ]