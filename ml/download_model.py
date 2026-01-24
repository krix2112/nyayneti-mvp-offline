#!/usr/bin/env python3
"""
NyayNeti Model Download Script
Downloads Llama 3.2 3B Instruct (quantized GGUF) for offline legal research.

Usage:
    python download_model.py

The script downloads a Q4_K_M quantized model (~2GB) suitable for CPU inference.
For GPU inference with more VRAM, you can modify MODEL_FILE to use Q8_0 or full precision.
"""

import os
import sys
from pathlib import Path

# Hugging Face model info
HF_REPO = "bartowski/Llama-3.2-3B-Instruct-GGUF"
MODEL_FILE = "Llama-3.2-3B-Instruct-Q4_K_M.gguf"

# Alternative smaller model for low-resource systems
ALT_MODEL_FILE = "Llama-3.2-3B-Instruct-Q4_K_S.gguf"

MODELS_DIR = Path(__file__).parent / "models"


def download_model(model_file: str = MODEL_FILE) -> Path:
    """Download model from Hugging Face Hub."""
    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        print("Installing huggingface_hub...")
        os.system(f"{sys.executable} -m pip install huggingface_hub")
        from huggingface_hub import hf_hub_download

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    dest_path = MODELS_DIR / model_file

    if dest_path.exists():
        print(f"Model already exists: {dest_path}")
        return dest_path

    print(f"Downloading {model_file} from {HF_REPO}...")
    print("This may take 10-30 minutes depending on your connection speed.")

    downloaded_path = hf_hub_download(
        repo_id=HF_REPO,
        filename=model_file,
        local_dir=MODELS_DIR,
        local_dir_use_symlinks=False,
    )

    print(f"Model downloaded successfully: {downloaded_path}")
    return Path(downloaded_path)


def verify_model(model_path: Path) -> bool:
    """Verify the model can be loaded."""
    try:
        from llama_cpp import Llama
        print(f"Verifying model at {model_path}...")
        llm = Llama(model_path=str(model_path), n_ctx=512, n_gpu_layers=0, verbose=False)
        response = llm("Hello", max_tokens=5)
        print("Model verification successful!")
        del llm
        return True
    except Exception as e:
        print(f"Model verification failed: {e}")
        return False


def main():
    print("=" * 60)
    print("NyayNeti Model Downloader")
    print("=" * 60)

    # Check for existing model
    existing = list(MODELS_DIR.glob("*.gguf")) if MODELS_DIR.exists() else []
    if existing:
        print(f"Found existing model(s): {[m.name for m in existing]}")
        response = input("Download anyway? (y/N): ").strip().lower()
        if response != "y":
            print("Using existing model.")
            return

    # Download model
    model_path = download_model()

    # Verify
    print("\nVerifying model (optional, requires llama-cpp-python)...")
    try:
        verify_model(model_path)
    except ImportError:
        print("llama-cpp-python not installed. Skipping verification.")
        print("Install with: pip install llama-cpp-python")

    print("\nSetup complete!")
    print(f"Model location: {model_path}")
    print("\nNext steps:")
    print("  1. cd ../backend")
    print("  2. pip install -r requirements.txt")
    print("  3. python app.py")


if __name__ == "__main__":
    main()
