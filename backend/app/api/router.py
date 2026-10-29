from fastapi import APIRouter

from app.api.endpoints import (
    health,
    dashboard,
    traffic_map,
    traffic_prediction,
    federated_learning,
    communication_cost,
    model_comparison,
    congestion,
    emergency_route,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(dashboard.router, tags=["Dashboard"])
api_router.include_router(traffic_map.router, prefix="/traffic", tags=["Traffic Map"])
api_router.include_router(
    traffic_prediction.router,
    prefix="/traffic",
    tags=["Traffic Prediction"],
)
api_router.include_router(
    federated_learning.router,
    prefix="/federated",
    tags=["Federated Learning"],
)
api_router.include_router(
    communication_cost.router,
    prefix="/communication-cost",
    tags=["Communication Cost"],
)
api_router.include_router(
    model_comparison.router,
    prefix="/model-comparison",
    tags=["Model Comparison"],
)
api_router.include_router(congestion.router, tags=["Congestion"])
api_router.include_router(
    emergency_route.router,
    prefix="/emergency-route",
    tags=["Emergency Route"],
)