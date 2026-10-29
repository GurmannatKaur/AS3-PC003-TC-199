def calculate_communication_cost(client_payloads: list[dict]) -> dict:
    upload = sum(int(item["upload_bytes"]) for item in client_payloads)
    download = sum(int(item["download_bytes"]) for item in client_payloads)
    if upload < 0 or download < 0:
        raise ValueError("Payload sizes cannot be negative")
    return {
        "upload_bytes": upload,
        "download_bytes": download,
        "total_bytes": upload + download,
        "total_megabytes": (upload + download) / (1024 * 1024),
    }
