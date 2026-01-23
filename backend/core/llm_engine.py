from __future__ import annotations

import json
import os
import pickle
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import requests

try:
    from llama_cpp import Llama
    LLAMA_CPP_AVAILABLE = True
except ImportError:
    LLAMA_CPP_AVAILABLE = False

from .pdf_processor import split_text_into_chunks


# Ollama API configuration (as fallback)
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
    NyayNeti LLM engine supporting offline GGUF inference (via llama-cpp-python)
    and Ollama fallback. Uses sentence-transformers for semantic search.
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

        self._llm: Optional[Llama] = None
        self._embedding_model = None
        self._chunks_cache: List[DocumentChunk] | None = None
        self._ollama_available: bool | None = None

        # Try to initialize local LLM if possible
        if not self.demo_mode and LLAMA_CPP_AVAILABLE and self.model_path and os.path.exists(self.model_path):
            try:
                print(f"Initializing local LLM from {self.model_path}...")
                self._llm = Llama(
                    model_path=self.model_path,
                    n_ctx=self.context_length,
                    n_gpu_layers=self.gpu_layers,
                    n_threads=self.n_threads,
                    verbose=False
                )
                print("Local LLM initialized successfully.")
            except Exception as e:
                print(f"Failed to initialize local LLM: {e}")

    # --- LLM Inferencing ---

    def _call_llm(self, prompt: str, max_tokens: int = 512) -> str:
        """Call the available LLM (Local GGUF -> Ollama -> Error)."""
        if self.demo_mode:
            return "NyayNeti Demo: AI is in safe-preview mode. Disable DEMO_MODE to use local intelligence."

        # 1. Try local llama-cpp-python
        if self._llm:
            try:
                output = self._llm(
                    prompt,
                    max_tokens=max_tokens,
                    stop=["<|eot_id|>", "<|end_of_text|>", "Question:", "User:"],
                    echo=False
                )
                return output["choices"][0]["text"].strip()
            except Exception as e:
                print(f"Local LLM inference failed: {e}")

        # 2. Try Ollama fallback
        if self._check_ollama():
            return self._call_ollama(prompt, max_tokens)

        # 3. Fail gracefully
        return "ERROR: Connectivity issue. The local Legal Intelligence Engine (Ollama) is not reachable. Please start Ollama or check your model configuration."

    def _check_ollama(self) -> bool:
        """Check if Ollama is running."""
        try:
            resp = requests.get(f"{self.ollama_base_url}/api/tags", timeout=2)
            if resp.status_code == 200:
                self._ollama_available = True
                return True
        except:
            pass
        self._ollama_available = False
        return False

    def _call_ollama(self, prompt: str, max_tokens: int) -> str:
        """Call Ollama API with model fallback."""
        try:
            # First attempt with configured model
            resp = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"num_predict": max_tokens}
                },
                timeout=120
            )
            if resp.status_code == 200:
                return resp.json().get("response", "").strip()
            
            # If model not found, try to use the first available model
            tags_resp = requests.get(f"{self.ollama_base_url}/api/tags")
            if tags_resp.status_code == 200:
                models = tags_resp.json().get("models", [])
                if models:
                    fallback_model = models[0]["name"]
                    print(f"Ollama model {self.ollama_model} failed, falling back to {fallback_model}...")
                    resp = requests.post(
                        f"{self.ollama_base_url}/api/generate",
                        json={
                            "model": fallback_model,
                            "prompt": prompt,
                            "stream": False,
                        },
                        timeout=120
                    )
                    if resp.status_code == 200:
                        return resp.json().get("response", "").strip()
        except Exception as e:
            print(f"Ollama call failed: {e}")
        
        return "CONNECTION ERROR: Ollama server is running but failed to generate a response. Please check if the model is pulled."

    # --- Embeddings & Retrieval ---

    def _get_embedding_model(self):
        """Lazy load the embedding model."""
        if self._embedding_model is not None:
            return self._embedding_model
        try:
            from sentence_transformers import SentenceTransformer
            print(f"Loading embedding model: {self.embedding_model_name}...")
            self._embedding_model = SentenceTransformer(self.embedding_model_name)
            return self._embedding_model
        except ImportError:
            print("sentence-transformers not installed. Using naive retrieval.")
            return None

    def index_document(self, doc_id: str, text: str, metadata: Dict[str, Any] | None = None) -> Dict[str, Any]:
        """Index a document by chunking and embedding."""
        metadata = metadata or {}
        chunks = split_text_into_chunks(text)
        
        # Load embedding model and compute
        emb_model = self._get_embedding_model()
        embeddings = emb_model.encode(chunks) if emb_model else None

        # Store to index
        existing_embeddings = self._load_embeddings()
        with open(self.index_path, "a", encoding="utf-8") as f:
            for i, chunk_text in enumerate(chunks):
                record = {"doc_id": doc_id, "chunk_id": i, "text": chunk_text, "metadata": metadata}
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
                if embeddings is not None:
                    # Fix for numpy types
                    existing_embeddings[f"{doc_id}_{i}"] = embeddings[i]
        
        self._save_embeddings(existing_embeddings)
        self._chunks_cache = None 
        
        return {"doc_id": doc_id, "num_chunks": len(chunks), "indexed": True}

    def _load_embeddings(self) -> Dict[str, np.ndarray]:
        if not os.path.exists(self.embeddings_path): return {}
        try:
            with open(self.embeddings_path, "rb") as f: return pickle.load(f)
        except: return {}

    def _save_embeddings(self, embeddings: Dict[str, np.ndarray]) -> None:
        with open(self.embeddings_path, "wb") as f: pickle.dump(embeddings, f)

    def _load_index(self) -> List[DocumentChunk]:
        if self._chunks_cache is not None: return self._chunks_cache
        if not os.path.exists(self.index_path): return []
        
        chunks: List[DocumentChunk] = []
        embeddings = self._load_embeddings()
        
        if os.path.exists(self.index_path):
            with open(self.index_path, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        data = json.loads(line)
                        key = f"{data['doc_id']}_{data['chunk_id']}"
                        chunks.append(DocumentChunk(
                            doc_id=data["doc_id"], 
                            chunk_id=data["chunk_id"], 
                            text=data["text"], 
                            metadata=data.get("metadata", {}),
                            embedding=embeddings.get(key)
                        ))
                    except: continue
        self._chunks_cache = chunks
        return chunks

    def _semantic_retrieve(self, question: str, top_k: int = 4) -> List[DocumentChunk]:
        """Retrieve relevant chunks using cosine similarity."""
        chunks = self._load_index()
        if not chunks: return []
        
        emb_model = self._get_embedding_model()
        if not emb_model: return self._naive_retrieve(question, top_k)
        
        q_emb = emb_model.encode(question)
        scored = []
        for ch in chunks:
            if ch.embedding is not None:
                sim = np.dot(q_emb, ch.embedding) / (np.linalg.norm(q_emb) * np.linalg.norm(ch.embedding) + 1e-8)
                scored.append((sim, ch))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored[:top_k]]

    def _naive_retrieve(self, question: str, top_k: int = 4) -> List[DocumentChunk]:
        chunks = self._load_index()
        q_words = set(question.lower().split())
        scored = []
        for ch in chunks:
            overlap = len(q_words & set(ch.text.lower().split()))
            scored.append((overlap, ch))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored[:top_k]]

    # --- Public API ---

    def answer_question(self, question: str) -> Dict[str, Any]:
        """Answer a question using RAG."""
        retrieved = self._semantic_retrieve(question)
        context = "\n\n---\n\n".join(ch.text for ch in retrieved)
        
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
        You are NyayNeti, a professional Indian legal AI assistant. 
        Analyze the provided case excerpts carefully and answer the question with technical precision.
        Always cite the Document ID. If the context does not contain relevant info, say so clearly.<|eot_id|>
        <|start_header_id|>user<|end_header_id|>
        CONTEXT FROM DIGITAL ARCHIVE:
        {context if context else "No relevant documents found in local archive."}

        LEGAL QUESTION: {question}<|eot_id|>
        <|start_header_id|>assistant<|end_header_id|>"""
        
        answer = self._call_llm(prompt)
        return {
            "answer": answer,
            "context_snippets": [{"doc_id": ch.doc_id, "text": ch.text[:500]} for ch in retrieved],
            "backend": "local-cpu" if self._llm else ("ollama" if self._check_ollama() else "N/A")
        }

    def summarize_document(self, doc_id: str) -> Dict[str, Any]:
        chunks = [ch for ch in self._load_index() if ch.doc_id == doc_id]
        if not chunks: return {"error": "Document not found"}
        
        text = "\n\n".join(ch.text for ch in chunks[:5]) 
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
        Summarize the key legal issues, parties involved, and the final ruling of this case concisely.<|eot_id|>
        <|start_header_id|>user<|end_header_id|>
        DOCUMENT TEXT:
        {text}<|eot_id|>
        <|start_header_id|>assistant<|end_header_id|>"""
        
        summary = self._call_llm(prompt, max_tokens=400)
        return {"doc_id": doc_id, "summary": summary}

    def get_indexed_documents(self) -> List[Dict[str, Any]]:
        chunks = self._load_index()
        docs = {}
        for ch in chunks:
            if ch.doc_id not in docs:
                docs[ch.doc_id] = {"doc_id": ch.doc_id, "chunks": 0, "citations": ch.metadata.get("citations", [])}
            docs[ch.doc_id]["chunks"] += 1
        return list(docs.values())

    def get_model_status(self) -> Dict[str, Any]:
        return {
            "local_llm_loaded": self._llm is not None,
            "ollama_available": self._check_ollama(),
            "embedding_model_loaded": self._embedding_model is not None,
            "demo_mode": self.demo_mode,
            "indexed_docs_count": len(self.get_indexed_documents())
        }
