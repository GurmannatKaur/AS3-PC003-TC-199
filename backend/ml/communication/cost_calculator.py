from numbers import Integral
from typing import Any


def _payload_bytes(value: Any, key: str, index: int) -> int:
    if isinstance(value, bool) or not isinstance(value, Integral):
        raise ValueError(
            f"Client payload {index} field '{key}' must be an integer byte count."
        )
    if value < 0:
        raise ValueError(
            f"Client payload {index} field '{key}' cannot be negative."
        )
    return int(value)


def calculate_communication_cost(client_payloads: list[dict]) -> dict:
    """Sum per-client byte counts; ``total_megabytes`` is binary MiB."""
    if not isinstance(client_payloads, list):
        raise ValueError("Client payloads must be provided as a list.")

    upload = 0
    download = 0
    for index, item in enumerate(client_payloads, start=1):
        if not isinstance(item, dict):
            raise ValueError(f"Client payload {index} must be a mapping.")
        missing = {"upload_bytes", "download_bytes"} - item.keys()
        if missing:
            raise ValueError(
                f"Client payload {index} is missing: {', '.join(sorted(missing))}."
            )
        upload += _payload_bytes(item["upload_bytes"], "upload_bytes", index)
        download += _payload_bytes(item["download_bytes"], "download_bytes", index)

    total = upload + download
    return {
        "upload_bytes": upload,
        "download_bytes": download,
        "total_bytes": total,
        "total_megabytes": total / (1024 * 1024),
    }
