import os
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Settings:
    DEBUG: bool = False
    BACKEND_PORT: int = 8000
    
    # HARDCODED AI PARAMETERS FOR DEMO
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    TOP_K: int = 8
    TEMPERATURE: float = 0.3
    MAX_TOKENS: int = 1000
    
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
        EMBEDDING_DIR=str(ml_root / "embeddings"),
        COMPARISONS_DIR=str(comp_dir),
        DEMO_DATA_DIR=str(backend_root / "demo_data"),
        LLM_MODEL_PATH=str(llm_path) if llm_path.exists() else None,
        EMBEDDING_MODEL_PATH=str(emb_path) if emb_path.exists() else "sentence-transformers/all-MiniLM-L6-v2",
    )





