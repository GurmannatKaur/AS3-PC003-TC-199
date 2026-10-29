from contextlib import asynccontextmanager
import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.logging_config import configure_logging
import app.models  # Register SQLAlchemy models before creating tables.
from app.utils.response_helpers import error_response

configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    for path in (settings.data_dir, settings.results_dir, settings.model_dir):
        Path(path).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="MOSAIC Federated Traffic Prediction API",
    description=(
        "Traffic-flow prediction and federated-learning research backend. "
        "Sample data and simulated client updates are identified explicitly."
    ),
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=error_response(
            "Request validation failed", details=jsonable_encoder(exc.errors())
        ),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(str(exc.detail)),
        headers=exc.headers,
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(_: Request, exc: SQLAlchemyError):
    logger.exception("Database operation failed")
    return JSONResponse(
        status_code=500,
        content=error_response("Database operation failed"),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    logger.exception("Unhandled request exception")
    return JSONResponse(
        status_code=500,
        content=error_response("Internal server error"),
    )
