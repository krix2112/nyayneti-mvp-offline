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
                    n_ctx=4096,
                    n_gpu_layers=0,
                    n_threads=4,
                    verbose=False
                )
                print("Local LLM initialized successfully.")
                self.pre_warm() # Pre-warm the model
            except Exception as e:
                print(f"Failed to initialize local LLM: {e}")

    def pre_warm(self):
        """Perform a dummy query to warm up the model cache."""
        print("Pre-warming LLM Engine...")
        list(self._call_llm("Warmup", max_tokens=5, stream=True))

    def _call_llm(self, prompt: str, max_tokens: int = 512, stream: bool = False):
        """Call the available LLM (Local GGUF -> Ollama -> Error)."""
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

        # Fallback to Ollama
        if self._check_ollama():
            if stream:
                return self._call_ollama_stream(prompt, max_tokens)
            return self._call_ollama(prompt, max_tokens)

        err = "ERROR: Connectivity issue. No AI engine available."
        return (s for s in [err]) if stream else err

    def _check_ollama(self) -> bool:
        try:
            resp = requests.get(f"{self.ollama_base_url}/api/tags", timeout=1)
            return resp.status_code == 200
        except: return False

    def _call_ollama(self, prompt: str, max_tokens: int) -> str:
        try:
            resp = requests.post(f"{self.ollama_base_url}/api/generate", json={
                "model": "deepseek-r1:1.5b", "prompt": prompt, "stream": False, "options": {"num_predict": max_tokens}
            }, timeout=60)
            return resp.json().get("response", "").strip()
        except: return "Ollama connection failed."

    def _call_ollama_stream(self, prompt: str, max_tokens: int):
        try:
            print(f"🔄 Starting Ollama stream request...")
            print(f"📝 Prompt length: {len(prompt)} characters")
            
            resp = requests.post(f"{self.ollama_base_url}/api/generate", json={
                "model": "deepseek-r1:1.5b", "prompt": prompt, "stream": True, "options": {"num_predict": max_tokens}
            }, stream=True, timeout=300)  # Increased to 5 minutes
            
            print(f"✅ Response status: {resp.status_code}")
            
            token_count = 0
            for line in resp.iter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        token = data.get("response", "")
                        if token:
                            token_count += 1
                            yield token
                        if data.get("done"):
                            print(f"✅ Stream complete! Generated {token_count} tokens")
                            break
                    except json.JSONDecodeError as e:
                        print(f"❌ JSON decode error: {e}")
                        
            if token_count == 0:
                print("⚠️ WARNING: No tokens generated!")
                yield "No response generated. Please try again."
                
        except Exception as e:
            error_msg = f"Ollama streaming failed: {str(e)}"
            print(f"❌ {error_msg}")
            import traceback
            print(traceback.format_exc())
            yield f"[Error: {error_msg}]"

    def _get_embedding_model(self):
        if self._embedding_model is not None: return self._embedding_model
        try:
            from sentence_transformers import SentenceTransformer
            print(f"Loading embedding model: {self.embedding_model_name}")
            self._embedding_model = SentenceTransformer(self.embedding_model_name)
            return self._embedding_model
        except: return None

    def index_document(self, doc_id: str, text: str):
        import time
        start_time = time.time()
        
        print(f"📄 Starting indexing for {doc_id}...")
        chunks = split_text_into_chunks(text, max_chars=500)
        print(f"✂️  Split into {len(chunks)} chunks ({time.time() - start_time:.2f}s)")
        
        emb_model = self._get_embedding_model()
        
        # Generate embeddings in batches for better performance
        embeddings = None
        if emb_model:
            emb_start = time.time()
            print(f"🧠 Generating embeddings for {len(chunks)} chunks...")
            embeddings = emb_model.encode(chunks, show_progress_bar=False, batch_size=32)
            print(f"✅ Embeddings generated ({time.time() - emb_start:.2f}s)")
        
        current_embeddings = self._load_embeddings()
        with open(self.index_path, "a", encoding="utf-8") as f:
            for i, chunk_text in enumerate(chunks):
                f.write(json.dumps({"doc_id": doc_id, "chunk_id": i, "text": chunk_text}) + "\n")
                if embeddings is not None:
                    current_embeddings[f"{doc_id}_{i}"] = embeddings[i]
        
        self._save_embeddings(current_embeddings)
        self._chunks_cache = None
        
        total_time = time.time() - start_time
        print(f"🎉 Indexing complete for {doc_id} ({total_time:.2f}s total)")
        return {"num_chunks": len(chunks)}

    def _load_embeddings(self):
        if not os.path.exists(self.embeddings_path): return {}
        try:
            with open(self.embeddings_path, "rb") as f: return pickle.load(f)
        except: return {}

    def _save_embeddings(self, embeddings):
        with open(self.embeddings_path, "wb") as f: pickle.dump(embeddings, f)

    def _load_index(self) -> List[DocumentChunk]:
        if self._chunks_cache: return self._chunks_cache
        if not os.path.exists(self.index_path): return []
        embs = self._load_embeddings()
        chunks = []
        with open(self.index_path, "r", encoding="utf-8") as f:
            for line in f:
                data = json.loads(line)
                key = f"{data['doc_id']}_{data['chunk_id']}"
                chunks.append(DocumentChunk(
                    doc_id=data["doc_id"], chunk_id=data["chunk_id"], text=data["text"], embedding=embs.get(key)
                ))
        self._chunks_cache = chunks
        return chunks

    def _hybrid_retrieve(self, question: str, top_k: int = 8):
        chunks = self._load_index()
        if not chunks: return []
        emb_model = self._get_embedding_model()
        if not emb_model: return chunks[:top_k]
        
        q_emb = emb_model.encode(question)
        scores = []
        for ch in chunks:
            if ch.embedding is not None:
                sim = np.dot(q_emb, ch.embedding) / (np.linalg.norm(q_emb) * np.linalg.norm(ch.embedding) + 1e-8)
                scores.append((sim, ch))
        scores.sort(key=lambda x: x[0], reverse=True)
        return [s[1] for s in scores[:top_k]]

    def answer_question_stream(self, question: str):
        retrieved = self._hybrid_retrieve(question)
        context = "\n\n".join(f"DOC: {ch.doc_id}\n{ch.text}" for ch in retrieved)
        prompt = f"System: Indian legal expert. Answer based on context.\nContext:\n{context}\n\nQuestion: {question}\nResult:"
        
        metadata = {"context_snippets": [{"doc_id": ch.doc_id, "text": ch.text[:200]} for ch in retrieved]}
        yield f"DATA: {json.dumps(metadata)}\n\n"
        for token in self._call_llm(prompt, stream=True):
            yield token

    def get_indexed_documents(self):
        chunks = self._load_index()
        docs = {}
        for ch in chunks:
            if ch.doc_id not in docs: docs[ch.doc_id] = {"doc_id": ch.doc_id, "chunks": 0}
            docs[ch.doc_id]["chunks"] += 1
        return list(docs.values())

    def compare_pdf_stream(self, selected_pdf_id: str, query: str = ""):
        """Compare selected PDF against all other PDFs in database with streaming response."""
        chunks = self._load_index()
        
        # Get chunks from selected PDF
        selected_chunks = [ch for ch in chunks if ch.doc_id == selected_pdf_id]
        # Get chunks from all other PDFs
        other_chunks = [ch for ch in chunks if ch.doc_id != selected_pdf_id]
        
        if not selected_chunks:
            yield "ERROR: Selected PDF not found in database."
            return
        
        if not other_chunks:
            yield "ERROR: No other PDFs available for comparison."
            return
        
        # Build context from selected PDF (REDUCED to 3 chunks to avoid timeout)
        selected_context = "\\n".join(ch.text for ch in selected_chunks[:3])
        
        # Build context from other PDFs (sample ONLY 2 chunks from each)
        other_docs = {}
        for ch in other_chunks:
            if ch.doc_id not in other_docs:
                other_docs[ch.doc_id] = []
            if len(other_docs[ch.doc_id]) < 2:  # Limit to 2 chunks per doc
                other_docs[ch.doc_id].append(ch.text)
        
        other_context = "\\n\\n".join(
            f"Document: {doc_id}\\n{' '.join(texts)}" 
            for doc_id, texts in other_docs.items()
        )
        
        # Build OPTIMIZED comparison prompt with better formatting instructions
        if query:
            prompt = f"""Answer this question about the legal documents:
{query}

SELECTED DOCUMENT: {selected_pdf_id}
{selected_context[:1000]}

OTHER DOCUMENTS:
{other_context[:1000]}

Provide a clear, well-structured answer with proper paragraphs."""
        else:
            prompt = f"""Compare these legal documents and provide a structured analysis.

SELECTED DOCUMENT: {selected_pdf_id}
{selected_context[:1000]}

OTHER DOCUMENTS:
{other_context[:1000]}

Provide a clear comparison covering:
1. Main topic of selected document
2. Key differences from other documents  
3. Notable similarities
4. Unique aspects

Use clear paragraphs and proper formatting."""
        
        # Stream the analysis
        metadata = {
            "selected_pdf": selected_pdf_id,
            "compared_against": list(other_docs.keys()),
            "total_documents": len(other_docs) + 1
        }
        
        print(f"📊 Comparison metadata: {metadata}")
        yield f"DATA: {json.dumps(metadata)}\\n\\n"
        
        print(f"🤖 Calling LLM for comparison...")
        token_count = 0
        try:
            for token in self._call_llm(prompt, max_tokens=1000, stream=True):
                token_count += 1
                yield token
            print(f"✅ Comparison complete! Streamed {token_count} tokens")
        except Exception as e:
            error_msg = f"Error during LLM call: {str(e)}"
            print(f"❌ {error_msg}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            yield f"\n\n[{error_msg}]\n"

