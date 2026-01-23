import os
from dataclasses import dataclass


@dataclass
class Settings:
    DEBUG: bool
    BACKEND_PORT: int
    UPLOAD_DIR: str
    DEMO_DATA_DIR: str
    EMBEDDING_DIR: str
    RUNANYWHERE_API_KEY: str | None
    LLM_MODEL_NAME: str


def get_settings() -> Settings:
    root = os.path.dirname(os.path.abspath(__file__))

    return Settings(
        DEBUG=os.getenv("FLASK_ENV", "development") == "development",
        BACKEND_PORT=int(os.getenv("BACKEND_PORT", "8000")),
        UPLOAD_DIR=os.path.join(root, "uploads"),
        DEMO_DATA_DIR=os.path.join(root, "demo_data"),
        EMBEDDING_DIR=os.path.join(root, "..", "ml", "embeddings"),
        RUNANYWHERE_API_KEY=os.getenv("RUNANYWHERE_API_KEY"),
        LLM_MODEL_NAME=os.getenv("LLM_MODEL_NAME", "llama-3.2-3b-instruct"),
    )

