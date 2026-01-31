import sys
import os
import json
from pathlib import Path

# Add backend to path
sys.path.append(os.path.abspath("backend"))

from core.llm_engine import LLMEngine
from core.vector_store import PersistentVectorStore

def debug_context():
    print("--- Intercepting LLM Context ---")
    store = PersistentVectorStore(storage_path="backend/ml/embeddings/")
    engine = LLMEngine(
        model_name="deepseek-r1:1.5b",
        api_key=None,
        embedding_dir="backend/ml/embeddings/",
        vector_store=store
    )
    
    # Clear cache for testing
    engine.cache = {}
    
    query = "compare it with food corporation of india case"
    print(f"Query: {query}")
    
    # Manually reproduce the retrieval logic
    emb_model = engine._get_embedding_model()
    q_emb = emb_model.encode(query)
    retrieved = engine.vector_store.search(
        query_embedding=q_emb,
        query_text=query,
        top_k=5,
        include_neighbors=True
    )
    
    print(f"\nRetrieved {len(retrieved)} chunks:")
    for i, res in enumerate(retrieved):
        doc_id = res.get('doc_id')
        score = res.get('score')
        text_snippet = res.get('text', '')[:100].replace('\n', ' ')
        print(f"[{i}] DOC: {doc_id} | SCORE: {score:.4f} | TEXT: {text_snippet}...")
        if "Anuradha" in str(doc_id) or "Anuradha" in text_snippet:
            print("!!! GHOST DETECTED IN RETRIEVED CHUNKS !!!")

    print("\nProcessing Stream...")
    full_resp = ""
    for chunk in engine.answer_question_stream(query):
        if not chunk.startswith("DATA:"):
            full_resp += chunk
            
    print("\n--- LLM RESPONSE ---")
    print(full_resp)

if __name__ == "__main__":
    debug_context()
