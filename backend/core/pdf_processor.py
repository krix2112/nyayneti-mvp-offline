from __future__ import annotations

import io
from typing import List

from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams


def extract_text_from_pdf(path: str) -> str:
    """
    Extract plain text from a PDF for downstream processing.

    This is intentionally simple and optimized for hackathon usage.
    """
    output = io.StringIO()
    laparams = LAParams()
    with open(path, "rb") as f:
        extract_text_to_fp(f, output, laparams=laparams, output_type="text", codec="utf-8")
    return output.getvalue()


def split_text_into_chunks(text: str, max_chars: int = 1500) -> List[str]:
    """
    Naive text chunking by characters with paragraph boundary awareness.
    """
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0

    for p in paragraphs:
        if current_len + len(p) > max_chars and current:
            chunks.append("\n\n".join(current))
            current = [p]
            current_len = len(p)
        else:
            current.append(p)
            current_len += len(p)

    if current:
        chunks.append("\n\n".join(current))

    return chunks

