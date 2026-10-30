from pydantic import field_validator
import logging
import sys
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_env: str = "development"
    project_name: str = "MOSAIC Federated Traffic Prediction API"
    project_version: str = "1.0.0"
    database_url: str = f"sqlite:///{(BACKEND_DIR / 'mosaic.db').as_posix()}"
    log_level: str = "INFO"
    frontend_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    data_dir: Path = BACKEND_DIR / "datasets"
    results_dir: Path = BACKEND_DIR / "results"
    model_dir: Path = BACKEND_DIR / "saved_models"
    federated_rounds: int = 3
    local_epochs: int = 2
    batch_size: int = 16
    learning_rate: float = 0.001
    model_input_window: int = 12

    @field_validator("data_dir", "results_dir", "model_dir", mode="before")
    @classmethod
    def resolve_backend_paths(cls, value: str | Path) -> Path:
        path = Path(value).expanduser()
        return path if path.is_absolute() else BACKEND_DIR / path

    @field_validator("database_url")
    @classmethod
    def resolve_sqlite_path(cls, value: str) -> str:
        prefix = "sqlite:///"
        if not value.startswith(prefix):
            return value

        database_path = value[len(prefix):]
        if database_path == ":memory:":
            return value

        path = Path(database_path).expanduser()
        if not path.is_absolute():
            path = BACKEND_DIR / path
        return f"{prefix}{path.as_posix()}"

    @property
    def DATABASE_URL(self) -> str:
        return self.database_url

    @property
    def PROJECT_NAME(self) -> str:
        return self.project_name

    @property
    def PROJECT_VERSION(self) -> str:
        return self.project_version

    @property
    def DATA_DIR(self) -> Path:
        return self.data_dir

    @property
    def RESULTS_DIR(self) -> Path:
        return self.results_dir

    @property
    def MODEL_DIR(self) -> Path:
        return self.model_dir

    @property
    def FEDERATED_ROUNDS(self) -> int:
        return self.federated_rounds

    @property
    def LOCAL_EPOCHS(self) -> int:
        return self.local_epochs

    @property
    def BATCH_SIZE(self) -> int:
        return self.batch_size

    @property
    def LEARNING_RATE(self) -> float:
        return self.learning_rate


settings = Settings()


def setup_logging() -> None:
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


setup_logging()