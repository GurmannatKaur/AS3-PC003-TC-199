import json
from pathlib import Path
from typing import Any

from app.core.config import settings


def success_response(data: Any, message: str = "OK") -> dict:
    return {"success": True, "message": message, "data": data}


def error_response(message: str, details: Any = None) -> dict:
    return {"success": False, "message": message, "details": details}


def write_json(relative_path: str, payload: dict) -> Path:
    path = settings.results_dir / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, indent=2, default=str)
    return path
