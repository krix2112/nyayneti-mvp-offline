from __future__ import annotations

import json
import os
import pickle
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
import requests

from .pdf_processor import split_text_into_chunks


# Ollama API configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")


@dataclass
class DocumentChunk:
    doc_id: str
    chunk_id: int
    text: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    embedding: np.ndarray | None = None


class LLMEngine:
    """
    Offline LLM engine using Ollama for Llama 3.2 3B inference
    and sentence-transformers for semantic search embeddings.

    Designed for hackathon demo with fallback to stub responses when model unavailable.
    """

    def __init__(
        self,
        model_name: str,
        api_key: str | None,
        embedding_dir: str,
        model_path: str | None = None,
        context_length: int = 4096,
        gpu_layers: int = 0,
        n_threads: int = 4,
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
        demo_mode: bool = False,
        ollama_base_url: str = OLLAMA_BASE_URL,
        ollama_model: str = OLLAMA_MODEL,
    ):
        self.model_name = model_name
        self.api_key = api_key
        self.embedding_dir = embedding_dir
        self.model_path = model_path
        self.context_length = context_length
        self.gpu_layers = gpu_layers
        self.n_threads = n_threads
        self.embedding_model_name = embedding_model
        self.demo_mode = demo_mode
        self.ollama_base_url = ollama_base_url
        self.ollama_model = ollama_model

        os.makedirs(self.embedding_dir, exist_ok=True)
        self.index_path = os.path.join(self.embedding_dir, "index.jsonl")
        self.embeddings_path = os.path.join(self.embedding_dir, "embeddings.pkl")

        self._ollama_available: bool | None = None
        self._embedding_model = None
        self._chunks_cache: List[DocumentChunk] | None = None

    # --- Ollama Connection ---

    def _check_ollama(self) -> bool:
        """Check if Ollama is running and model is available."""
        if self._ollama_available is not None:
            return self._ollama_available

        try:
            resp = requests.get(f"{self.ollama_base_url}/api/tags", timeout=2)
            if resp.status_code == 200:
                models = resp.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                # Check if our model is available
                if any(self.ollama_model in name for name in model_names):
                    self._ollama_available = True
                    print(f"Ollama connected. Model: {self.ollama_model}")
                    return True
                else:
                    print(f"Ollama running but model '{self.ollama_model}' not found.")
                    print(f"Available models: {model_names}")
                    print(f"Run: ollama pull {self.ollama_model}")
                    self._ollama_available = False
                    return False
        except requests.exceptions.RequestException:
            print("Ollama not running. Start with: ollama serve")
            self._ollama_available = False
            return False

        self._ollama_available = False
        return False

    def _get_embedding_model(self):
        """Lazy load the embedding model."""
        if self._embedding_model is not None:
            return self._embedding_model

        if self.demo_mode:
            return None

        try:
            from sentence_transformers import SentenceTransformer

            print(f"Loading embedding model: {self.embedding_model_name}...")
            self._embedding_model = SentenceTransformer(self.embedding_model_name)
            print("Embedding model loaded.")
            return self._embedding_model
        except Exception as e:
            print(f"Failed to load embedding model: {e}")
            return None

    # --- Embedding Computation ---

    def _compute_embedding(self, text: str) -> np.ndarray | None:
        """Compute embedding for a single text."""
        model = self._get_embedding_model()
        if model is None:
            return None
        return model.encode(text, convert_to_numpy=True)

    def _compute_embeddings_batch(self, texts: List[str]) -> List[np.ndarray] | None:
        """Compute embeddings for multiple texts."""
        model = self._get_embedding_model()
        if model is None:
            return None
        return model.encode(texts, convert_to_numpy=True, show_progress_bar=False)

    # --- Indexing ---

    def index_document(
        self, doc_id: str, text: str, metadata: Dict[str, Any] | None = None
    ) -> Dict[str, Any]:
        """Index a document by chunking, embedding, and storing."""
        metadata = metadata or {}
        chunks = split_text_into_chunks(text)

        # Compute embeddings for all chunks
        embeddings = self._compute_embeddings_batch(chunks)

        # Store chunks to JSONL
        with open(self.index_path, "a", encoding="utf-8") as f:
            for i, chunk_text in enumerate(chunks):
                record = {
                    "doc_id": doc_id,
                    "chunk_id": i,
                    "text": chunk_text,
                    "metadata": metadata,
                }
                f.write(json.dumps(record, ensure_ascii=False) + "\n")

        # Store embeddings separately (pickle for efficiency)
        existing_embeddings = self._load_embeddings()
        if embeddings is not None:
            for i, emb in enumerate(embeddings):
                key = f"{doc_id}_{i}"
                existing_embeddings[key] = emb
            self._save_embeddings(existing_embeddings)

        # Invalidate cache
        self._chunks_cache = None

        return {
            "doc_id": doc_id,
            "num_chunks": len(chunks),
            "indexed": True,
        }

    def _load_embeddings(self) -> Dict[str, np.ndarray]:
        """Load embeddings from disk."""
        if not os.path.exists(self.embeddings_path):
            return {}
        try:
            with open(self.embeddings_path, "rb") as f:
                return pickle.load(f)
        except Exception:
            return {}

    def _save_embeddings(self, embeddings: Dict[str, np.ndarray]) -> None:
        """Save embeddings to disk."""
        with open(self.embeddings_path, "wb") as f:
            pickle.dump(embeddings, f)

    # --- Retrieval ---

    def _load_index(self) -> List[DocumentChunk]:
        """Load the chunk index from disk."""
        if self._chunks_cache is not None:
            return self._chunks_cache

        if not os.path.exists(self.index_path):
            return []

        chunks: List[DocumentChunk] = []
        embeddings = self._load_embeddings()

        with open(self.index_path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                data = json.loads(line)
                key = f"{data['doc_id']}_{data['chunk_id']}"
                embedding = embeddings.get(key)
                chunks.append(
                    DocumentChunk(
                        doc_id=data["doc_id"],
                        chunk_id=data["chunk_id"],
                        text=data["text"],
                        metadata=data.get("metadata", {}),
                        embedding=embedding,
                    )
                )

        self._chunks_cache = chunks
        return chunks

    def _semantic_retrieve(self, question: str, top_k: int = 4) -> List[DocumentChunk]:
        """Retrieve chunks using semantic similarity."""
        chunks = self._load_index()
        if not chunks:
            return []

        # Compute query embedding
        query_embedding = self._compute_embedding(question)

        if query_embedding is None:
            # Fallback to naive retrieval
            return self._naive_retrieve(question, top_k)

        # Score by cosine similarity
        scored: List[tuple[float, DocumentChunk]] = []
        for ch in chunks:
            if ch.embedding is None:
                continue
            sim = np.dot(query_embedding, ch.embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(ch.embedding) + 1e-8
            )
            scored.append((float(sim), ch))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored[:top_k]]

    def _naive_retrieve(self, question: str, top_k: int = 4) -> List[DocumentChunk]:
        """Fallback naive retrieval based on keyword overlap."""
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

    # --- LLM Inference ---

    def _call_llm(self, prompt: str, max_tokens: int = 512) -> str:
        """Call Ollama for LLM inference."""
        if self.demo_mode or not self._check_ollama():
            return self._generate_demo_response(prompt)

        try:
            resp = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": 0.7,
                        "top_p": 0.9,
                    },
                },
                timeout=120,
            )
            if resp.status_code == 200:
                return resp.json().get("response", "").strip()
            else:
                return f"Ollama error: {resp.status_code} - {resp.text}"
        except requests.exceptions.RequestException as e:
            return f"Ollama connection error: {e}"

    def _generate_demo_response(self, prompt: str) -> str:
        """Generate a stub response for demo mode."""
        if "bail" in prompt.lower():
            return (
                "Based on the context provided, bail under Section 437 CrPC may be granted "
                "considering factors like: (1) nature and gravity of accusation, "
                "(2) antecedents of the applicant, (3) possibility of fleeing justice, "
                "(4) likelihood of tampering with evidence. Refer to State of Rajasthan v. "
                "Balchand (1977) 4 SCC 308 for guiding principles."
            )
        elif "ipc 420" in prompt.lower() or "cheating" in prompt.lower():
            return (
                "IPC Section 420 (Cheating and dishonestly inducing delivery of property) "
                "requires: (1) deception of any person, (2) fraudulent or dishonest inducement, "
                "(3) delivery of property or consent to retention. Maximum punishment: "
                "7 years imprisonment + fine. Key precedent: Dr. Vimla v. Delhi Administration "
                "AIR 1963 SC 1572."
            )
        else:
            return (
                "Based on the retrieved legal context, I can provide analysis of the relevant "
                "provisions and precedents. Please upload specific case documents for detailed "
                "citation mapping and argument building. [Demo mode - LLM model not loaded]"
            )

    # --- Public API ---

    def answer_question(self, question: str) -> Dict[str, Any]:
        """Answer a legal question using RAG (Retrieval-Augmented Generation)."""
        retrieved = self._semantic_retrieve(question)
        context_blocks = "\n\n---\n\n".join(ch.text for ch in retrieved)

        system_prompt = (
            "You are NyayNeti, an expert Indian law research assistant. "
            "Answer ONLY based on the provided legal context. "
            "Cite specific case citations, section numbers, and paragraph references. "
            "If unsure, clearly state the limitation."
        )

        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

Question: {question}

Legal Context:
{context_blocks if context_blocks else "No documents indexed yet. Please upload PDFs first."}

Provide a concise, court-ready answer with citations.<|eot_id|><|start_header_id|>assistant<|end_header_id|>

"""

        answer_text = self._call_llm(prompt)

        return {
            "answer": answer_text,
            "context_snippets": [
                {"doc_id": ch.doc_id, "chunk_id": ch.chunk_id, "text": ch.text[:500]}
                for ch in retrieved
            ],
            "model": self.ollama_model if self._check_ollama() else "demo-mode",
        }

    def summarize_document(self, doc_id: str) -> Dict[str, Any]:
        """Generate a summary of a specific document."""
        chunks = [ch for ch in self._load_index() if ch.doc_id == doc_id]

        if not chunks:
            return {"error": f"Document '{doc_id}' not found in index."}

        # Take first few chunks for summary
        text_to_summarize = "\n\n".join(ch.text for ch in chunks[:5])

        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are NyayNeti, an Indian law research assistant. Summarize the following legal document concisely.<|eot_id|><|start_header_id|>user<|end_header_id|>

Document: {doc_id}

Content:
{text_to_summarize}

Provide a brief summary highlighting: (1) parties involved, (2) key legal issues, (3) court's decision, (4) important citations.<|eot_id|><|start_header_id|>assistant<|end_header_id|>

"""

        summary = self._call_llm(prompt, max_tokens=300)

        return {
            "doc_id": doc_id,
            "summary": summary,
            "num_chunks": len(chunks),
        }

    def get_indexed_documents(self) -> List[Dict[str, Any]]:
        """List all indexed documents with their metadata."""
        chunks = self._load_index()
        docs: Dict[str, Dict[str, Any]] = {}

        for ch in chunks:
            if ch.doc_id not in docs:
                docs[ch.doc_id] = {
                    "doc_id": ch.doc_id,
                    "num_chunks": 0,
                    "citations": ch.metadata.get("citations", []),
                }
            docs[ch.doc_id]["num_chunks"] += 1

        return list(docs.values())

    def get_model_status(self) -> Dict[str, Any]:
        """Get current model loading status."""
        ollama_ok = self._check_ollama()
        return {
            "llm_backend": "ollama",
            "llm_available": ollama_ok,
            "ollama_url": self.ollama_base_url,
            "ollama_model": self.ollama_model,
            "embedding_model_loaded": self._embedding_model is not None,
            "embedding_model_name": self.embedding_model_name,
            "demo_mode": self.demo_mode,
            "indexed_documents": len(self.get_indexed_documents()),
        }
