from fastapi import APIRouter

from app.services.federated_runtime import federated_runtime

router = APIRouter()


@router.get("")
def get_communication_cost():
    communication_records = federated_runtime.communication_records()
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
        "data_source": "Serialized local model payload sizes",
        "measurement_method": (
            "Serialized state-dictionary bytes per client; no network transfer occurred."
        ),
    }


@router.get("/rounds")
def get_communication_rounds():
    communication_records = federated_runtime.communication_records()
    return {
        "rounds": communication_records,
        "total_rounds": len(communication_records),
    }