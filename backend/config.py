import os
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Settings:
    DEBUG: bool
    BACKEND_PORT: int
    UPLOAD_DIR: str
    DEMO_DATA_DIR: str
    EMBEDDING_DIR: str
    RUNANYWHERE_API_KEY: str | None
    LLM_MODEL_NAME: str
    LLM_MODEL_PATH: str | None
    LLM_CONTEXT_LENGTH: int
    LLM_GPU_LAYERS: int
    LLM_THREADS: int
    EMBEDDING_MODEL: str
    DEMO_MODE: bool


def get_settings() -> Settings:
    root = Path(__file__).parent.absolute()

    # Determine model path
    model_path_env = os.getenv("LLM_MODEL_PATH")
    if model_path_env:
        if not Path(model_path_env).is_absolute():
            model_path = str(root / model_path_env)
        else:
            model_path = model_path_env
    else:
        # Default location
        model_path = str(root.parent / "ml" / "models" / "Llama-3.2-3B-Instruct-Q4_K_M.gguf")

    return Settings(
        DEBUG=os.getenv("FLASK_ENV", "development") == "development",
        BACKEND_PORT=int(os.getenv("BACKEND_PORT", "8000")),
        UPLOAD_DIR=str(root / "uploads"),
        DEMO_DATA_DIR=str(root / "demo_data"),
        EMBEDDING_DIR=str(root.parent / "ml" / "embeddings"),
        RUNANYWHERE_API_KEY=os.getenv("RUNANYWHERE_API_KEY"),
        LLM_MODEL_NAME=os.getenv("LLM_MODEL_NAME", "llama-3.2-3b-instruct"),
        LLM_MODEL_PATH=model_path if Path(model_path).exists() else None,
        LLM_CONTEXT_LENGTH=int(os.getenv("LLM_CONTEXT_LENGTH", "4096")),
        LLM_GPU_LAYERS=int(os.getenv("LLM_GPU_LAYERS", "0")),
        LLM_THREADS=int(os.getenv("LLM_THREADS", "4")),
        EMBEDDING_MODEL=os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
        DEMO_MODE=os.getenv("DEMO_MODE", "false").lower() == "true",
    )

