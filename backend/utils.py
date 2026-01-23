import os

from config import get_settings


ALLOWED_EXTENSIONS = {"pdf"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def ensure_dirs() -> None:
    settings = get_settings()
    for path in [settings.UPLOAD_DIR, settings.DEMO_DATA_DIR, settings.EMBEDDING_DIR]:
        os.makedirs(path, exist_ok=True)

