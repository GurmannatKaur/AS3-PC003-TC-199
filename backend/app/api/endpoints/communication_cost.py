from fastapi import APIRouter

router = APIRouter()

communication_records = []


@router.get("")
def get_communication_cost():
    total_upload_bytes = sum(
        record["upload_bytes"] for record in communication_records
    )
    total_download_bytes = sum(
        record["download_bytes"] for record in communication_records
    )
    total_bytes = total_upload_bytes + total_download_bytes

    return {
        "total_upload_bytes": total_upload_bytes,
        "total_download_bytes": total_download_bytes,
        "total_bytes": total_bytes,
        "total_mb": round(total_bytes / (1024 * 1024), 4),
        "total_rounds": len(communication_records),
        "data_source": "Measured communication records",
    }


@router.get("/rounds")
def get_communication_rounds():
    return {
        "rounds": communication_records,
        "total_rounds": len(communication_records),
    }


def record_communication(
    round_number: int,
    upload_bytes: int,
    download_bytes: int,
):
    record = {
        "round": round_number,
        "upload_bytes": upload_bytes,
        "download_bytes": download_bytes,
        "total_bytes": upload_bytes + download_bytes,
        "total_mb": round(
            (upload_bytes + download_bytes) / (1024 * 1024),
            4,
        ),
    }

    communication_records.append(record)
    return record