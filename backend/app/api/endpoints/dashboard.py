from fastapi import APIRouter

from app.services.federated_runtime import federated_runtime

router = APIRouter()


@router.get("/dashboard")
def get_dashboard():
    return federated_runtime.dashboard()