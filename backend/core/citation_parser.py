from __future__ import annotations

import re
from typing import List, Dict


INDIAN_CITATION_PATTERNS = [
    # e.g. (2020) 3 SCC 123
    r"\(\d{4}\)\s*\d+\s*SCC\s*\d+",
    # e.g. AIR 1997 SC 3014
    r"AIR\s*\d{4}\s*SC\s*\d+",
    # e.g. 1994 Supp (3) SCC 256
    r"\d{4}\s*Supp\s*\(\d+\)\s*SCC\s*\d+",
]


def extract_citations(text: str) -> List[Dict[str, str]]:
    """
    Extremely lightweight citation parser for Indian case law citations.
    Returns a list of dicts for easy JSON serialization.
    """
    citations: List[Dict[str, str]] = []

    for pattern in INDIAN_CITATION_PATTERNS:
        for match in re.finditer(pattern, text):
            span = match.span()
            snippet_start = max(0, span[0] - 60)
            snippet_end = min(len(text), span[1] + 60)
            snippet = text[snippet_start:snippet_end].replace("\n", " ")
            citations.append(
                {
                    "text": match.group(0),
                    "context": snippet.strip(),
                }
            )

    # Deduplicate by citation text
    seen = set()
    unique: List[Dict[str, str]] = []
    for c in citations:
        if c["text"] not in seen:
            seen.add(c["text"])
            unique.append(c)
    return unique

