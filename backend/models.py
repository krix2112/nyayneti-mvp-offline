"""
Lightweight data models for NyayNeti backend.

For a hackathon MVP we keep things simple and do not introduce a full ORM.
This module primarily defines type hints / schemas for clarity.
"""

from dataclasses import dataclass
from typing import List, Dict, Any


@dataclass
class UploadedDocument:
    filename: str
    citations: List[Dict[str, str]]
    message: str


@dataclass
class QueryRequest:
    question: str


@dataclass
class QueryResponse:
    answer: str
    context_snippets: List[Dict[str, Any]]


