from __future__ import annotations

import json
import os
import pickle
import math
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
from .json_utils import sanitize_for_json


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

    def _call_llm(self, prompt: str, max_tokens: int = 512, stream: bool = False):
        """Call the available LLM (Local GGUF -> Ollama -> Error)."""
        if self.demo_mode:
            msg = "NyayNeti Demo: AI is in safe-preview mode. Disable DEMO_MODE to use local intelligence."
            return [msg] if stream else msg

        # 1. Try local llama-cpp-python
        if self._llm:
            try:
                output = self._llm(
                    prompt,
                    max_tokens=max_tokens,
                    stop=["<|eot_id|>", "<|end_of_text|>", "Question:", "User:"],
                    echo=False,
                    stream=stream
                )
                if stream:
                    def gen():
                        for chunk in output:
                            yield chunk["choices"][0]["text"]
                    return gen()
                return output["choices"][0]["text"].strip()
            except Exception as e:
                print(f"Local LLM inference failed: {e}")

        # 2. Try Ollama fallback
        if self._check_ollama():
            if stream:
                return self._call_ollama_stream(prompt, max_tokens)
            return self._call_ollama(prompt, max_tokens)

        # 3. Fail gracefully
        err = "ERROR: Connectivity issue. The local Legal Intelligence Engine (Ollama) is not reachable."
        return (s for s in [err]) if stream else err

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
            # Dynamically select the best available model
            model = self.ollama_model
            if self._check_model_exists("deepseek-r1:1.5b"):
                model = "deepseek-r1:1.5b"
            elif self._check_model_exists("llama3.2:3b"):
                model = "llama3.2:3b"
            
            resp = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"num_predict": max_tokens}
                },
                timeout=120
            )
            if resp.status_code == 200:
                return resp.json().get("response", "").strip()
        except Exception as e:
            print(f"Ollama call failed: {e}")
        return "CONNECTION ERROR: Ollama failed."

    def _call_ollama_stream(self, prompt: str, max_tokens: int):
        """Generator for Ollama streaming with DeepSeek reasoning filtering."""
        try:
            # Dynamically select the best available model
            model = self.ollama_model
            if self._check_model_exists("deepseek-r1:1.5b"):
                model = "deepseek-r1:1.5b"
            elif self._check_model_exists("llama3.2:3b"):
                model = "llama3.2:3b"
            
            resp = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={"model": model, "prompt": prompt, "stream": True, "options": {"num_predict": max_tokens}},
                stream=True,
                timeout=120
            )
            
            in_thought_block = False
            for line in resp.iter_lines():
                if line:
                    data = json.loads(line)
                    token = data.get("response", "")
                    
                    # Filter out DeepSeek reasoning tokens for a cleaner legal UI
                    if "<think>" in token:
                        in_thought_block = True
                        continue
                    if "</think>" in token:
                        in_thought_block = False
                        continue
                    
                    if not in_thought_block:
                        yield token
                    
                    if data.get("done"): break
        except Exception as e:
            yield f" [Stream Error: {e}] "

    def _check_model_exists(self, model_name: str) -> bool:
        try:
            resp = requests.get(f"{self.ollama_base_url}/api/tags")
            if resp.status_code == 200:
                models = [m["name"] for m in resp.json().get("models", [])]
                return any(model_name in m for m in models)
        except: pass
        return False

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

    def _hybrid_retrieve(self, question: str, top_k: int = 8) -> List[DocumentChunk]:
        """Perform hybrid search (Semantic + Keyword) with weighted scoring."""
        chunks = self._load_index()
        if not chunks: return []
        
        emb_model = self._get_embedding_model()
        q_words = set(question.lower().split())
        
        # 1. Calculate semantic scores if model loaded
        semantic_scores = {}
        if emb_model:
            q_emb = emb_model.encode(question)
            for ch in chunks:
                if ch.embedding is not None:
                    sim = np.dot(q_emb, ch.embedding) / (np.linalg.norm(q_emb) * np.linalg.norm(ch.embedding) + 1e-8)
                    semantic_scores[f"{ch.doc_id}_{ch.chunk_id}"] = float(sim)
        
        # 2. Calculate keyword scores (BM25-lite)
        keyword_scores = {}
        for ch in chunks:
            overlap = len(q_words & set(ch.text.lower().split()))
            # Normalize by chunk length roughly
            score = overlap / (math.log(len(ch.text.split()) + 1) + 1)
            keyword_scores[f"{ch.doc_id}_{ch.chunk_id}"] = score

        # 3. Combine scores (Weighted: 70% Semantic, 30% Keyword)
        combined = []
        for ch in chunks:
            key = f"{ch.doc_id}_{ch.chunk_id}"
            sem = semantic_scores.get(key, 0)
            keyw = keyword_scores.get(key, 0)
            
            # Simple weighted fusion
            final_score = float((0.7 * sem) + (0.3 * keyw))
            combined.append((final_score, ch))
        
        combined.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in combined[:top_k]]

    # --- Public API ---

    def answer_question(self, question: str) -> Dict[str, Any]:
        """Answer a question using enhanced hybrid RAG and CoT reasoning."""
        # 1. Perform Hybrid Retrieval
        retrieved = self._hybrid_retrieve(question, top_k=8)
        
        context_text = "\n\n---\n\n".join(f"DOCUMENT: {ch.doc_id} (Section {ch.chunk_id})\nCONTENT: {ch.text}" for ch in retrieved)
        
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are NyayNeti, the Premier Indian Legal Intelligence Engine. Your reasoning must be robust, citing specific sources.

THOUGHT PROCESS (INTERNAL):
1. Identify the core legal conflict in the user's question.
2. Scan the provided Digital Archive excerpts for relevant statutes, precedents, or factual details.
3. If specific documents are found, summarize their relevance.
4. Formulate a professional conclusion based ONLY on the provided text.

OUTPUT STRUCTURE:
- Analysis: A detailed walk-through of the relevant facts and law from the archive.
- Conclusion: A concise final answer.
- Confidence: High/Medium/Low based on context availability.

RULES:
- Cite [SOURCE: filename] for every factual claim.
- If the archive doesn't have the info, say: "The local database lacks specific details on this, but here is what is available..."
- Do NOT use external knowledge not present in the archive.<|eot_id|>
<|start_header_id|>user<|end_header_id|>
DIGITAL ARCHIVE:
{context_text if context_text else "No records found in the current archive context."}

LEGAL QUESTION: {question}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>"""
        
        answer = self._call_llm(prompt, max_tokens=1000)
        
        # Determine confidence based on retrieval scores (mocked here as simple heuristic)
        confidence = "High" if len(retrieved) >= 3 else "Medium"
        if not retrieved: confidence = "Low"

        final_resp = {
            "answer": answer,
            "context_snippets": [{"doc_id": ch.doc_id, "text": ch.text[:400]} for ch in retrieved],
            "confidence": confidence,
            "engine": "Local GGUF" if self._llm else "Ollama Cloud/Local",
            "stats": {"retrieved_chunks": len(retrieved)}
        }
        
        return sanitize_for_json(final_resp)

    def summarize_document(self, doc_id: str) -> Dict[str, Any]:
        """Generate a comprehensive summary of a legal document."""
        chunks = [ch for ch in self._load_index() if ch.doc_id == doc_id]
        if not chunks: return {"error": "Document not found"}
        
        # Take beginning, middle, and end chunks to get a better overview
        if len(chunks) <= 6:
            summary_chunks = chunks
        else:
            summary_chunks = chunks[:3] + chunks[len(chunks)//2 : len(chunks)//2 + 2] + chunks[-2:]
            
        text = "\n\n".join(ch.text for ch in summary_chunks) 
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are NyayNeti. Summarize this legal document emphasizing:
1. Parties and Case Number.
2. Core Legal Issue/Argument.
3. Relevant Sections/Laws cited.
4. Court's Reasoning and Final Decision.<|eot_id|>
<|start_header_id|>user<|end_header_id|>
DOCUMENT EXCERPTS (Full Doc ID: {doc_id}):
{text}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>"""
        
        summary = self._call_llm(prompt, max_tokens=600)
        return sanitize_for_json({"doc_id": doc_id, "summary": summary})

    def get_indexed_documents(self) -> List[Dict[str, Any]]:
        chunks = self._load_index()
        docs = {}
        for ch in chunks:
            if ch.doc_id not in docs:
                docs[ch.doc_id] = {"doc_id": ch.doc_id, "chunks": 0, "citations": ch.metadata.get("citations", [])}
            docs[ch.doc_id]["chunks"] += 1
        return list(docs.values())

    def get_model_status(self) -> Dict[str, Any]:
        indexed_docs = self.get_indexed_documents()
        return sanitize_for_json({
            "local_llm_loaded": self._llm is not None,
            "ollama_available": self._check_ollama(),
            "embedding_model_loaded": self._embedding_model is not None,
            "demo_mode": self.demo_mode,
            "indexed_docs_count": len(indexed_docs),
            "indexed_docs": indexed_docs
        })

    def answer_question_stream(self, question: str):
        """Answer a question with real-time streaming for maximum speed perception."""
        retrieved = self._hybrid_retrieve(question, top_k=6)
        context_text = "\n\n---\n\n".join(f"DOCUMENT: {ch.doc_id}\nCONTENT: {ch.text}" for ch in retrieved)
        
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are NyayNeti, a top-tier Indian Legal Intelligence AI. 
Provide a professional legal analysis based on the provided context.
 
STRUCTURE:
Analysis: (Cite [SOURCE: filename])
Conclusion: (Final summary)
Confidence: (High/Medium/Low)
 
Use the provided excerpts to formulate your answer.<|eot_id|>
<|start_header_id|>user<|end_header_id|>
CONTEXT:
{context_text}
 
QUESTION: {question}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>"""
        
        # Meta-info packet
        metadata = sanitize_for_json({
            "context_snippets": [{"doc_id": ch.doc_id, "text": ch.text[:200]} for ch in retrieved],
            "confidence": "High" if retrieved else "Low"
        })
        yield f"DATA: {json.dumps(metadata)}\n\n"
        
        for token in self._call_llm(prompt, max_tokens=1000, stream=True):
            yield token
