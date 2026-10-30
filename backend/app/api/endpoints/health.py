from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "message": "MOSAIC backend is running",
    }