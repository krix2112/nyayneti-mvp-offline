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

try:
    from sentence_transformers import SentenceTransformer, CrossEncoder
except ImportError:
    SentenceTransformer = None
    CrossEncoder = None


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
        context_length: int = 2048,  # Reduced from 4096
        gpu_layers: int = 0,
        n_threads: int = 8,  # Increased from 4-8
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
        self.max_cache_size = 150 # Increased for better session memory
        self.cache_stats = {"hits": 0, "misses": 0, "total_requests": 0}  # Track cache performance
        
        # Phase 4: Reset cache on startup to clear old hallucinations
        self.cache.clear()

        os.makedirs(self.embedding_dir, exist_ok=True)
        self.index_path = os.path.join(self.embedding_dir, "index.jsonl")
        self.embeddings_path = os.path.join(self.embedding_dir, "embeddings.pkl")

        self._llm: Optional[Llama] = None
        self._embedding_model = None
        self._reranker = None
        self.reranker_model_name = "cross-encoder/ms-marco-TinyBERT-L-2-v2"  # ~10x faster than BGE-base
        self._chunks_cache: List[DocumentChunk] | None = None
        self._models_loaded = False  # Track lazy loading state
        self._llm_failed = False     # Track if local LLM init failed

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

        # 3. LLM Fast Classification (DISABLED for Stability)
        # The new Qwen model might be too chatty or strict, causing false positives.
        # We trust the heuristics above for now.
        return True, ""

    def _call_llm(self, prompt: str, max_tokens: int = 1500, stream: bool = False):
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

        if self._check_ollama():
            if stream:
                return self._call_ollama_stream(prompt, max_tokens)
            return self._call_ollama(prompt, max_tokens)
            
        logger.error("❌ CONNECTIVITY ERROR: Could not connect to any AI engine.")
        err = "ERROR: No AI engine available. Please ensure Ollama is running."
        return (s for s in [err]) if stream else err

    def _check_ollama(self) -> bool:
        try:
            # Check if Ollama is running and model exists
            url = f"{self.ollama_base_url}/api/tags"
            logger.info(f"🔎 Checking Ollama status at {url}...")
            resp = requests.get(url, timeout=2)
            
            if resp.status_code == 200:
                models = [m['name'] for m in resp.json().get('models', [])]
                # Allow partial match (e.g. qwen2.5:7b matching qwen2.5:7b-instruct)
                if any(self.ollama_model in m for m in models):
                    logger.info(f"✅ Found Ollama model: {self.ollama_model}")
                    return True
                else:
                    logger.warning(f"⚠️ Ollama running but model '{self.ollama_model}' NOT found. Available: {models}")
                    return True # Return true to attempt pull or fallback, but warn
            return False
        except Exception as e: 
            logger.warning(f"⚠️ Ollama check failed: {e}")
            return False

    def _call_ollama(self, prompt: str, max_tokens: int) -> str:
        try:
            payload = {
                "model": self.ollama_model, 
                "prompt": prompt, 
                "stream": False, 
                "options": {
                    "num_predict": max_tokens,
                    "temperature": 0.1,
                    "num_thread": self.n_threads
                }
            }
            logger.info(f"🤖 Sending request to Ollama ({self.ollama_model})...")
            resp = requests.post(f"{self.ollama_base_url}/api/generate", json=payload, timeout=60)
            
            if resp.status_code != 200:
                logger.error(f"❌ Ollama Error {resp.status_code}: {resp.text}")
                return f"Error: Ollama returned {resp.status_code}"
                
            return resp.json().get("response", "").strip()
        except Exception as e: return f"Ollama connection failed: {e}"

    def _call_ollama_stream(self, prompt: str, max_tokens: int):
        token_count = 0
        logger.info(f"🌊 Starting stream: {self.ollama_model}")
        
        try:
            payload = {
                "model": self.ollama_model, 
                "prompt": prompt, 
                "stream": True, 
                "options": {
                    "num_predict": max_tokens,
                    "temperature": 0.0,  # Greedy decoding = fastest
                    "num_thread": self.n_threads,
                    "num_ctx": 8192,  # Larger context for richer retrieval
                    "mirostat": 0,  # Disable for speed
                    "repeat_penalty": 1.0  # No penalty = faster
                }
            }
            
            with requests.post(f"{self.ollama_base_url}/api/generate", json=payload, stream=True, timeout=300) as resp:
                if resp.status_code != 200:
                    err_msg = f"Ollama API Error: {resp.status_code} - {resp.text}"
                    logger.error(f"❌ {err_msg}")
                    yield err_msg
                    return

                for line in resp.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line)
                            if "error" in chunk:
                                logger.error(f"❌ Ollama Stream Error: {chunk['error']}")
                                yield f"\n[AI Error: {chunk['error']}]\n"
                                return
                                
                            token = chunk.get("response", "")
                            if token:
                                token_count += 1
                                if token_count % 50 == 0:
                                    print(f"🌊 [STREAMING] Generated {token_count} tokens...", end='\r')
                                yield token
                        except json.JSONDecodeError:
                            pass
            
            if token_count == 0:
                logger.warning("⚠️ OLLAMA RETURNED 0 TOKENS. Model might be pulling or broken.")
                yield f"AI didn't reply. Try running: 'ollama pull {self.ollama_model}' in terminal."
        except Exception as e:
            logger.error(f"❌ Ollama streaming crashed: {e}", exc_info=True)
            yield f"\n[System Error: {str(e)}]\n"

    def _ensure_models_loaded(self):
        """Lazy load heavy models only when needed"""
        if self._models_loaded:
            return

        logger.info("⏳ Lazy-loading LLM Engine models...")
        
        # Initialize sentence-transformers (Embeddings)
        if SentenceTransformer:
            try:
                if self._embedding_model is None:
                    logger.info(f"🧠 Loading embedding model: {self.embedding_model_name}")
                    self._embedding_model = SentenceTransformer(self.embedding_model_name, device='cpu')
                    logger.info("✅ Embedding model ready")
                
                # Reranker DISABLED for performance
                # if self._reranker is None:
                #     logger.info(f"🧬 Loading reranker model: {self.reranker_model_name}")
                #     self._reranker = CrossEncoder(self.reranker_model_name, device='cpu')
                #     logger.info("✅ Reranker model ready")
            except Exception as e:
                logger.warning(f"⚠️ Failed to load models: {e}")

        # Initialize Local LLM if configured
        if self.model_path and os.path.exists(self.model_path) and LLAMA_CPP_AVAILABLE and self._llm is None:
             try:
                logger.info(f"🚀 Initializing local GGUF model from {self.model_path}...")
                self._llm = Llama(
                    model_path=self.model_path,
                    n_ctx=self.context_length,
                    n_gpu_layers=self.gpu_layers,
                    n_threads=self.n_threads,
                    n_batch=512, # Faster prompt processing
                    verbose=False,
                )
                logger.info("✅ Core LLM Engine (GGUF) online")
             except Exception as e:
                logger.error(f"❌ Failed to load local GGUF model: {e}")
        
        self._models_loaded = True

    def _get_embedding_model(self):
        self._ensure_models_loaded()
        return self._embedding_model

    def _get_reranker(self):
        self._ensure_models_loaded()
        return self._reranker

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

    def answer_question_stream(self, question: str, doc_id: str | None = None):
        """
        Multistage RAG pipeline:
        1. Query Expansion (disabled for speed)
        2. Semantic Search (with optional filters)
        3. Reranking (Cross-Encoder)
        4. LLM Generation (Streaming)
        """
        self._ensure_models_loaded()
        # Phase 3: Cache Check (Instant Response)
        self.cache_stats["total_requests"] += 1
        cache_key = question.strip().lower()
        if cache_key in self.cache:
            self.cache_stats["hits"] += 1
            hit_rate = (self.cache_stats["hits"] / self.cache_stats["total_requests"]) * 100
            logger.info(f"💾 Cache hit for query: {question[:30]}... (Hit rate: {hit_rate:.1f}%)")
            yield self.cache[cache_key]
            return
        else:
            self.cache_stats["misses"] += 1

        # 1. Hybrid Retrieval
        if self.vector_store:
            emb_model = self._get_embedding_model()
            q_emb = emb_model.encode(question) if emb_model else np.zeros(384)
            # Increased pool size for richer context (30 candidates)
            search_k = 30 if doc_id else 30 
            
            if doc_id:
                print(f"🔍 [AI] Target Search: Restricted to {doc_id}")
            else:
                print(f"🔍 [AI] Global Search: Searching across all documents")
                
            yield "[STATUS]: Searching legal documents via FAISS...\n"
            retrieved = self.vector_store.search(
                query_embedding=q_emb,
                query_text=question,
                top_k=search_k,
                doc_ids=[doc_id] if doc_id else None,
                include_neighbors=True
            )
            print(f"📚 [AI] Retrieval: Found {len(retrieved)} potential chunks")
        else:
            retrieved = self._hybrid_retrieve(question)

        # Phase 7: Reranking DISABLED for performance (The Gold Standard)
        # Disabled for faster response times - semantic search is sufficient for most use cases
        reranker = None  # self._get_reranker()  # Disabled
        if reranker and retrieved:
            print(f"⚖️  [AI] Reranking: Benchmarking {len(retrieved)} candidates with BGE...")
            logger.info(f"Reranking {len(retrieved)} candidates...")
            # Prepare pairs for cross-encoder [(query, doc1), (query, doc2), ...]
            pairs = [[question, ch.get('text', '') if isinstance(ch, dict) else ch.text] for ch in retrieved]
            scores = reranker.predict(pairs)
            
            # Re-sort using cross-encoder scores
            for i, score in enumerate(scores):
                if isinstance(retrieved[i], dict):
                    retrieved[i]['rerank_score'] = float(score)
                else:
                    setattr(retrieved[i], 'rerank_score', float(score))
            
            retrieved.sort(key=lambda x: (x.get('rerank_score', 0) if isinstance(x, dict) else getattr(x, 'rerank_score', 0)), reverse=True)
            
            # Keep top 5 for construction
            retrieved = retrieved[:5]
            print(f"✅ [AI] Reranking Complete: Selected top {len(retrieved)} most accurate matches")
            yield f"[STATUS]: Found {len(retrieved)} relevant matches...\n"
            logger.info("Reranking complete")
        elif not reranker:
            print("⚡ [AI] Reranking: Skipped (Performance Optimization)")

        # Phase 3: Smart Filtering - Keep top 12 diverse, high-quality chunks
        filtered_retrieved = [ch for ch in retrieved if (isinstance(ch, dict) and ch.get('score', 1.0) > 0.35) or (not isinstance(ch, dict) and getattr(ch, 'score', 1.0) > 0.35)]
        if not filtered_retrieved and retrieved:
            filtered_retrieved = retrieved[:3] # Fallback to top 3 if filtering is too aggressive
        # Cap at 12 for optimal context/speed balance
        filtered_retrieved = filtered_retrieved[:12]
            
        context = "\n\n".join(f"SOURCE: {ch.get('doc_id', 'Unknown')}\n{ch.get('text', '')}" if isinstance(ch, dict) else f"SOURCE: {ch.doc_id}\n{ch.text}" for ch in filtered_retrieved)
        
        # 2. Advanced Phase 2 Prompt (Structured Legal Intelligence)
        prompt = f"""<system>
You are NyayNeti AI, a High-Precision Legal Reasoning Assistant. You are equipped with Qwen 2.5 7B capabilities.
Your goal is to provide deep, structured analysis based EXCLUSIVELY on the provided source documents.

### OPERATIONAL RULES:
1. **GROUNDING**: Use ONLY information in the "SOURCE:" context. If missing, say: "The provided document does not contain information regarding [topic]."
2. **PRECISION**: Identify names, dates, amounts exactly as they appear.
3. **FORMAT**: Use professional legal markdown. 
4. **STRUCTURE (MANDATORY)**:
   - ### SUMMARY: A 1-2 sentence overview.
   - ### ANALYSIS: Detailed breakdown. For critical facts or quotes you want to see in the PDF, wrap them in double brackets like: [[HIGHLIGHT: registration number DL-2CA-1872]].
   - ### CONCLUSION: Final answer based on facts.
5. **SYNC MARKERS**: You MUST use the [[HIGHLIGHT: exact text]] syntax for at least 2-3 key phrases from the source so the user can see them in the PDF.

</system>

<context>
{context}
</context>

<user_question>
{question}
</user_question>

Analysis:"""
        
        yield "[STATUS]: Formulating legal reasoning...\n"
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

    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics."""
        total = self.cache_stats["total_requests"]
        hits = self.cache_stats["hits"]
        hit_rate = (hits / total * 100) if total > 0 else 0
        
        return {
            "cache_size": len(self.cache),
            "max_size": self.max_cache_size,
            "total_requests": total,
            "hits": hits,
            "misses": self.cache_stats["misses"],
            "hit_rate_percent": round(hit_rate, 2),
            "memory_usage_estimate": f"{len(str(self.cache)) // 1024} KB"
        }
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
        yield "[STATUS]: Retrieving comparison context...\n"
        other_chunks = [ch for ch in chunks if (isinstance(ch, dict) and ch.get('doc_id') != selected_pdf_id) or (not isinstance(ch, dict) and ch.doc_id != selected_pdf_id)]
        
        if not selected_chunks:
            yield "ERROR: Selected PDF not found in database."
            return
        
        if not other_chunks:
            yield "ERROR: No other PDFs available for comparison."
            return
        
        # Build context from selected PDF (8 chunks for comprehensive coverage)
        selected_context = "\n".join(ch.get('text', '') if isinstance(ch, dict) else ch.text for ch in selected_chunks[:8])
        
        # FAISS-Powered Comparison: Find most relevant chunks from other docs
        print(f"🔍 [COMPARE] Using FAISS to find relevant context from {len(set(ch.get('doc_id') if isinstance(ch, dict) else ch.doc_id for ch in other_chunks))} reference documents...")
        
        # Get embedding for selected document summary
        emb_model = self._get_embedding_model()
        if emb_model:
            selected_summary = selected_context[:2000]  # Use first 2000 chars as query
            query_emb = emb_model.encode(selected_summary)
            
            # Search for top 5 most relevant chunks per document
            other_docs = {}
            for doc_id in set(ch.get('doc_id') if isinstance(ch, dict) else ch.doc_id for ch in other_chunks):
                if self.vector_store:
                    relevant_chunks = self.vector_store.search(
                        query_embedding=query_emb,
                        query_text=selected_summary,
                        top_k=5,
                        doc_ids=[doc_id],
                        include_neighbors=False
                    )
                    other_docs[doc_id] = [ch['text'] for ch in relevant_chunks]
                else:
                    # Fallback to first 4 chunks if no vector store
                    other_docs[doc_id] = [ch.get('text', '') if isinstance(ch, dict) else ch.text 
                                          for ch in other_chunks if (ch.get('doc_id') if isinstance(ch, dict) else ch.doc_id) == doc_id][:4]
        else:
            # Fallback: sample 4 chunks per doc
            other_docs = {}
            for ch in other_chunks:
                doc_id = ch.get('doc_id') if isinstance(ch, dict) else ch.doc_id
                text = ch.get('text', '') if isinstance(ch, dict) else ch.text
                if doc_id not in other_docs:
                    other_docs[doc_id] = []
                if len(other_docs[doc_id]) < 4:
                    other_docs[doc_id].append(text)
        other_context = "\n\n".join(
            f"Document: {doc_id}\n{' '.join(texts)}" 
            for doc_id, texts in other_docs.items()
        )
        print(f"✅ [COMPARE] Context built: {len(other_docs)} documents with FAISS-selected relevant sections")
        yield f"[STATUS]: Analyzing differences in {len(other_docs)} document(s)...\n"
        
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
        print(f"\n📊 [COMPARE] Starting Analysis for '{selected_pdf_id}'")
        print(f"📚 [COMPARE] Context: {len(selected_context)} selected chars vs {len(other_context)} reference chars")
        print(f"🤖 [COMPARE] Models: {self.ollama_model}")
        
        logger.info(f"📊 Running comparison for {selected_pdf_id} against {len(other_docs)} items")
        
        token_count = 0
        try:
            # Increased max_tokens to 2048 to allow for "thought" and "response"
            for token in self._call_llm(prompt, max_tokens=2048, stream=True):
                token_count += 1
                yield token
            print(f"\n✅ [COMPARE] Analysis complete! Full report generated ({token_count} tokens)")
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
{text[:2500]}

JSON RESULT:"""

        try:
            result = self._call_llm(prompt, max_tokens=512, stream=False)
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

