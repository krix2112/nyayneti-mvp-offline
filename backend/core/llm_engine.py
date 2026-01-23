from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Dict, List, Any

from .pdf_processor import split_text_into_chunks


try:
    # Placeholder import – replace with real RunAnywhere SDK
    # e.g. from runanywhere import Client
    import runanywhere  # type: ignore
except Exception:  # pragma: no cover - not required for tests
    runanywhere = None  # type: ignore


@dataclass
class DocumentChunk:
    doc_id: str
    chunk_id: int
    text: str
    metadata: Dict[str, Any]


class LLMEngine:
    """
    Tiny wrapper around Llama 3.2 3B via RunAnywhere SDK.

    For hackathon use we keep everything in a JSONL-like file as a
    "poor man's vector store". Replace with a proper embedding DB later.
    """

    def __init__(self, model_name: str, api_key: str | None, embedding_dir: str):
        self.model_name = model_name
        self.api_key = api_key
        self.embedding_dir = embedding_dir
        os.makedirs(self.embedding_dir, exist_ok=True)
        self.index_path = os.path.join(self.embedding_dir, "index.jsonl")

    # --- Indexing ---------------------------------------------------------

    def index_document(self, doc_id: str, text: str, metadata: Dict[str, Any] | None = None) -> None:
        metadata = metadata or {}
        chunks = split_text_into_chunks(text)

        with open(self.index_path, "a", encoding="utf-8") as f:
            for i, chunk in enumerate(chunks):
                record = {
                    "doc_id": doc_id,
                    "chunk_id": i,
                    "text": chunk,
                    "metadata": metadata,
                }
                f.write(json.dumps(record, ensure_ascii=False) + "\n")

    # --- Retrieval + QA ---------------------------------------------------

    def _load_index(self) -> List[DocumentChunk]:
        if not os.path.exists(self.index_path):
            return []

        chunks: List[DocumentChunk] = []
        with open(self.index_path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                data = json.loads(line)
                chunks.append(
                    DocumentChunk(
                        doc_id=data["doc_id"],
                        chunk_id=data["chunk_id"],
                        text=data["text"],
                        metadata=data.get("metadata", {}),
                    )
                )
        return chunks

    def _naive_retrieve(self, question: str, top_k: int = 4) -> List[DocumentChunk]:
        """
        Very naive retrieval based on substring overlap / length.
        Replace with real embeddings via RunAnywhere for production.
        """
        chunks = self._load_index()
        scored: List[tuple[float, DocumentChunk]] = []
        q_words = set(question.lower().split())

        for ch in chunks:
            text_words = set(ch.text.lower().split())
            overlap = len(q_words & text_words)
            if overlap == 0:
                continue
            score = overlap / (len(text_words) + 1e-6)
            scored.append((score, ch))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored[:top_k]]

    def _call_llm(self, prompt: str) -> str:
        """
        Call Llama 3.2 3B via RunAnywhere SDK.
        This is a stub so repo can run without real credentials.
        """
        if runanywhere is None or not self.api_key:
            # Fallback for hackathon demo / no credentials
            return (
                "LLM (stubbed): I cannot call the real Llama 3.2 3B model without a "
                "valid RunAnywhere API key. However, based on the retrieved context, "
                "you can manually reason about the answer."
            )

        # Pseudocode – adjust to real SDK
        client = runanywhere.Client(api_key=self.api_key)  # type: ignore[attr-defined]
        result = client.chat.completions.create(  # type: ignore[attr-defined]
            model=self.model_name,
            messages=[
                {
                    "role": "system",
                    "content": "You are NyayNeti, an offline legal research assistant for Indian law.",
                },
                {"role": "user", "content": prompt},
            ],
        )
        return result.choices[0].message.content  # type: ignore[index]

    def answer_question(self, question: str) -> Dict[str, Any]:
        retrieved = self._naive_retrieve(question)
        context_blocks = "\n\n---\n\n".join(ch.text for ch in retrieved)

        prompt = (
            "You are NyayNeti, an Indian law research assistant. You must answer "
            "strictly based on the provided context. If you are unsure, say so clearly.\n\n"
            f"Question:\n{question}\n\n"
            f"Context:\n{context_blocks}\n\n"
            "Answer in a concise, court-ready style and cite relevant case snippets where possible."
        )

        answer_text = self._call_llm(prompt)

        return {
            "answer": answer_text,
            "context_snippets": [
                {"doc_id": ch.doc_id, "chunk_id": ch.chunk_id, "text": ch.text}
                for ch in retrieved
            ],
        }

