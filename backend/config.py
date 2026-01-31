import os
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Settings:
    DEBUG: bool = False
    BACKEND_PORT: int = 8000
    
    # OPTIMIZED AI PARAMETERS FOR SPEED
    CHUNK_SIZE: int = 300  # Reduced for faster processing
    CHUNK_OVERLAP: int = 30
    TOP_K: int = 5  # Reduced from 8 for faster retrieval
    TEMPERATURE: float = 0.3
    MAX_TOKENS: int = 800  # Reduced from 1000
    
    # PERFORMANCE TUNING
    LLM_THREADS: int = int(os.getenv("LLM_THREADS", "8"))
    LLM_GPU_LAYERS: int = int(os.getenv("LLM_GPU_LAYERS", "0"))
    LLM_CONTEXT_LENGTH: int = int(os.getenv("LLM_CONTEXT_LENGTH", "2048"))
    LLM_BATCH_SIZE: int = int(os.getenv("LLM_BATCH_SIZE", "512"))
    
    # PATHS
    UPLOAD_DIR: str = ""
    EMBEDDING_DIR: str = ""
    COMPARISONS_DIR: str = ""
    DEMO_DATA_DIR: str = ""
    LLM_MODEL_PATH: str | None = None
    EMBEDDING_MODEL_PATH: str = ""

def get_app_root() -> Path:
    """Detect application root directory."""
    if getattr(sys, 'frozen', False):
        return Path(sys.executable).parent
    else:
        return Path(__file__).parent.parent.absolute()

def get_settings() -> Settings:
    app_root = get_app_root()
    backend_root = app_root / "backend"
    ml_root = app_root / "ml"
    
    # Local model paths
    llm_path = ml_root / "models" / "Llama-3.2-3B-Instruct-Q4_K_M.gguf"
    emb_path = backend_root / "models" / "embeddings" / "all-MiniLM-L6-v2"
    
    comp_dir = backend_root / "comparisons"
    comp_dir.mkdir(parents=True, exist_ok=True)
    
    return Settings(
        UPLOAD_DIR=str(backend_root / "uploads"),
        EMBEDDING_DIR=str(backend_root / "ml" / "embeddings"),
        COMPARISONS_DIR=str(comp_dir),
        DEMO_DATA_DIR=str(backend_root / "demo_data"),
        LLM_MODEL_PATH=str(llm_path) if llm_path.exists() else None,
        EMBEDDING_MODEL_PATH=str(emb_path) if emb_path.exists() else "sentence-transformers/all-MiniLM-L6-v2",
    )





