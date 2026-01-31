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
import logging

logger = logging.getLogger(__name__)

try:
    from llama_cpp import Llama
    LLAMA_CPP_AVAILABLE = True
except ImportError:
    LLAMA_CPP_AVAILABLE = False

from .pdf_processor import split_text_into_chunks
from .vector_store import PersistentVectorStore
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
        vector_store: Optional[PersistentVectorStore] = None,
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
        self.vector_store = vector_store
        
        # Phase 3: Query Cache (Simple LRU)
        self.cache: Dict[str, str] = {}
        self.max_cache_size = 50
        
        # Phase 4: Reset cache on startup to clear old hallucinations
        self.cache.clear()

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

    def is_query_meaningful(self, query: str) -> tuple[bool, str]:
        """
        Heuristic + LLM check to see if a query is meaningful.
        Returns (is_valid, error_message).
        """
        query = query.strip()
        if len(query) < 3:
            return False, "Input too short to be a valid question."
        
        # 1. Heuristic: Check for low vowel-to-consonant ratio or extreme randomness
        # This catches strings like "bjhwferf"
        vowels = "aeiouAEIOU"
        vowel_count = sum(1 for char in query if char in vowels)
        alpha_count = sum(1 for char in query if char.isalpha())
        
        # If it's mostly random letters with no vowels, it's likely gibberish
        if alpha_count > 5 and vowel_count == 0:
            return False, "Input appears to be random characters (no vowels)."
        
        # Heuristic: Entropy-like check (character diversity)
        # Random typing often uses a small set of neighboring keys or extreme variety
        unique_chars = len(set(query.lower()))
        if len(query) > 10 and unique_chars < 3:
            return False, "Input appears to be repetitive or non-semantic."

        # 2. Heuristic: Too many repetitive characters
        for char in set(query):
            if query.count(char) > len(query) * 0.6 and len(query) > 5:
                return False, "Input contains too many repetitive characters."

        # 3. LLM Fast Classification (Guardrail)
        # Use a very small max_tokens to save time
        classification_prompt = f"""Task: Is this a meaningful human message/question? 
Answer ONLY [VALID] or [INVALID].
Examples:
"Hello" -> [VALID]
"Tell me about the Zarina case" -> [VALID]
"bjhwferf" -> [INVALID]
"12345678" -> [INVALID]
"ked jwer" -> [INVALID]

Input: "{query}"
Classification:"""
        
        result = self._call_llm(classification_prompt, max_tokens=5, stream=False)
        if "[INVALID]" in result:
            logger.warning(f"AI rejected query as gibberish: {query}")
            return False, "AI detected this as irrelevant or gibberish input."
            
        return True, ""

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
                "model": self.ollama_model, "prompt": prompt, "stream": False, "options": {"num_predict": max_tokens}
            }, timeout=60)
            return resp.json().get("response", "").strip()
        except: return "Ollama connection failed."

    def _call_ollama_stream(self, prompt: str, max_tokens: int):
        token_count = 0
        logger.info(f"Starting Ollama stream for model: {self.ollama_model} (Prompt: {len(prompt)} chars)")
        
        try:
            resp = requests.post(f"{self.ollama_base_url}/api/generate", json={
                "model": self.ollama_model, "prompt": prompt, "stream": True, "options": {"num_predict": max_tokens}
            }, stream=True, timeout=300)
            
            for line in resp.iter_lines():
                if line:
                    chunk = json.loads(line)
                    token = chunk.get("response", "")
                    if token:
                        token_count += 1
                        yield token
            
            if token_count == 0:
                logger.warning("No tokens generated by Ollama!")
                yield "No response generated. Please try again or check if the model is loaded."
        except Exception as e:
            logger.error(f"Ollama streaming failed: {e}", exc_info=True)
            yield f"\n\n[Error: Ollama streaming failed: {str(e)}]\n"

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

    def answer_question_stream(self, question: str, doc_id: Optional[str] = None):
        # Phase 3: Cache Check (Instant Response)
        cache_key = question.strip().lower()
        if cache_key in self.cache:
            logger.info(f"Cache hit for query: {question[:30]}...")
            yield f"DATA: {json.dumps({'is_cached': True})}\n\n"
            yield self.cache[cache_key]
            return

        # 1. Hybrid Retrieval
        if self.vector_store:
            emb_model = self._get_embedding_model()
            q_emb = emb_model.encode(question) if emb_model else np.zeros(384)
            # If doc_id is provided, focus exclusively on that document and increase top_k
            search_k = 15 if doc_id else 5
            retrieved = self.vector_store.search(
                query_embedding=q_emb,
                query_text=question,
                top_k=search_k,
                doc_ids=[doc_id] if doc_id else None,
                include_neighbors=True
            )
        else:
            retrieved = self._hybrid_retrieve(question)

        # Phase 3: Fast Snippet Filtering (Score > 0.4)
        filtered_retrieved = [ch for ch in retrieved if (isinstance(ch, dict) and ch.get('score', 1.0) > 0.4) or (not isinstance(ch, dict) and getattr(ch, 'score', 1.0) > 0.4)]
        if not filtered_retrieved and retrieved:
            filtered_retrieved = retrieved[:2] # Fallback to top 2 if filtering is too aggressive
            
        context = "\n\n".join(f"SOURCE: {ch.get('doc_id', 'Unknown')}\n{ch.get('text', '')}" if isinstance(ch, dict) else f"SOURCE: {ch.doc_id}\n{ch.text}" for ch in filtered_retrieved)
        
        # 2. Optimized High-Density Prompt (STRICT GROUNDING)
        prompt = f"""System: NyayNeti AI. You are a STRICT factual assistant.
- **ONLY USE CONTEXT**: You must ONLY use information from the "SOURCE:" tags below.
- **NO HALLUCINATION**: NEVER mention "Anuradha Bhasin", "Union of India", or any other case NOT in the context.
- **FILE NAMES**: Use the exact "SOURCE:" filenames provided. Do NOT invent PDF names.
- **CITATIONS**: Use **Section X** bolding for items found in context.
- **IDENTIFICATION**: Pay special attention to identifying details like names, dates, and vehicle numbers (e.g. Maruti Car No.).
- **UNSURE**: If the answer is not in context, say "Context does not provide this information." Do NOT use your own knowledge of law.

Context:
{context}

Question: {question}

Analysis:"""
        
        full_response = ""
        for token in self._call_llm(prompt, stream=True):
            full_response += token
            yield token
            
        # Phase 3: Populating Cache
        if len(self.cache) >= self.max_cache_size:
            # Shift oldest key (FIFO)
            it = iter(self.cache)
            next(it)
            self.cache = {k: self.cache[k] for k in it}
        self.cache[cache_key] = full_response

    def get_indexed_documents(self):
        # Phase 4 (Ghost Fix): Priority to vector_store
        if self.vector_store:
            return self.vector_store.list_documents()
            
        chunks = self._load_index()
        docs = {}
        for ch in chunks:
            if ch.doc_id not in docs: docs[ch.doc_id] = {"doc_id": ch.doc_id, "chunks": 0}
            docs[ch.doc_id]["chunks"] += 1
        return list(docs.values())

    def compare_pdf_stream(self, selected_pdf_id: str, query: str = ""):
        """Compare selected PDF against all other PDFs in database with streaming response."""
        # Phase 4: Use unified vector store
        if self.vector_store:
            chunks = self.vector_store.documents
        else:
            chunks = self._load_index()
        
        # Get chunks from selected PDF
        selected_chunks = [ch for ch in chunks if (isinstance(ch, dict) and ch.get('doc_id') == selected_pdf_id) or (not isinstance(ch, dict) and ch.doc_id == selected_pdf_id)]
        # Get chunks from all other PDFs
        other_chunks = [ch for ch in chunks if (isinstance(ch, dict) and ch.get('doc_id') != selected_pdf_id) or (not isinstance(ch, dict) and ch.doc_id != selected_pdf_id)]
        
        if not selected_chunks:
            yield "ERROR: Selected PDF not found in database."
            return
        
        if not other_chunks:
            yield "ERROR: No other PDFs available for comparison."
            return
        
        # Build context from selected PDF (REDUCED to 3 chunks to avoid timeout)
        selected_context = "\n".join(ch.get('text', '') if isinstance(ch, dict) else ch.text for ch in selected_chunks[:3])
        
        # Build context from other PDFs (sample ONLY 2 chunks from each)
        other_docs = {}
        for ch in other_chunks:
            doc_id = ch.get('doc_id') if isinstance(ch, dict) else ch.doc_id
            text = ch.get('text', '') if isinstance(ch, dict) else ch.text
            if doc_id not in other_docs:
                other_docs[doc_id] = []
            if len(other_docs[doc_id]) < 2:  # Limit to 2 chunks per doc
                other_docs[doc_id].append(text)
        
        other_context = "\n\n".join(
            f"Document: {doc_id}\n{' '.join(texts)}" 
            for doc_id, texts in other_docs.items()
        )
        
        # Build OPTIMIZED comparison prompt with STRICT GROUNDING (Reduced for stability)
        if query:
            prompt = f"""### Comparison Analysis by NyayNeti AI
System: Analyze using ONLY provided context. Focus on differences and specific facts.

Question: {query}

SELECTED DOCUMENT: {selected_pdf_id}
{selected_context[:2500]}

OTHER DOCUMENTS (Context snippets):
{other_context[:5000]}

Analysis:"""
        else:
            prompt = f"""### Legal Comparison by NyayNeti AI
System: Compare the selected document against the others. 
Structure: 
1. Main topic of selected document.
2. key legal similarities/differences.

SELECTED DOCUMENT: {selected_pdf_id}
{selected_context[:2500]}

OTHER DOCUMENTS (Context snippets):
{other_context[:5000]}

Comparison Analysis:"""
        
        # Stream the analysis
        metadata = {
            "selected_pdf": selected_pdf_id,
            "compared_against": list(other_docs.keys()),
            "total_documents": len(other_docs) + 1
        }
        
        logger.info(f"📊 Sending comparison metadata for {selected_pdf_id} against {len(other_docs)} items")
        yield f"DATA: {json.dumps(metadata)}\n\n"
        
        token_count = 0
        try:
            # Increased max_tokens to 2048 to allow for "thought" and "response"
            for token in self._call_llm(prompt, max_tokens=2048, stream=True):
                token_count += 1
                yield token
            logger.info(f"✅ Comparison complete! Streamed {token_count} tokens")
        except Exception as e:
            logger.error(f"Error during LLM comparison call: {e}", exc_info=True)
            yield f"\n\n[Analysis Error: {str(e)}]\n"

    def analyze_document_for_drafting(self, text: str, template_type: str, fields: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze text to extract fields for a specific legal template.
        Returns a dictionary of found values.
        """
        field_descriptions = "\n".join([f"- {f['name']}: {f['label']}" for f in fields])
        
        prompt = f"""### NyayNeti AI: Drafting Fact Extraction
System: You are a legal data extractor. Extract the following information from the provided document text.
Rules:
1. ONLY extract information clearly stated in the text.
2. If info is missing, use "NOT_FOUND".
3. Return ONLY a valid JSON object.

FIELDS TO EXTRACT:
{field_descriptions}

DOCUMENT TEXT:
{text[:4000]}

JSON RESULT:"""

        try:
            result = self._call_llm(prompt, max_tokens=1000, stream=False)
            # Clean up JSON if LLM added markdown formatting
            if "```json" in result:
                result = result.split("```json")[-1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[-1].split("```")[0].strip()
            
            extracted_data = json.loads(result.strip())
            
            # Sub-analysis for Charge Sheet specific facts
            if template_type == "charge_sheet" and "complaint_details" in extracted_data:
                if extracted_data["complaint_details"] == "NOT_FOUND":
                    # Try a more targeted search for misconduct in the text
                    pass
            
            return extracted_data
        except Exception as e:
            logger.error(f"Field extraction failed: {e}")
            return {f['name']: "NOT_FOUND" for f in fields}

