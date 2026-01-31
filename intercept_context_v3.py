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
    # LLMEngine has the embedding model logic
    engine = LLMEngine(
        model_name="deepseek-r1:1.5b",
        api_key=None,
        embedding_dir="backend/ml/embeddings/",
        vector_store=store
    )
    
    query = "compare it with food corporation of india case"
    print(f"Query: {query}")
    
    emb_model = engine._get_embedding_model()
    q_emb = emb_model.encode(query)
    retrieved = store.search(
        query_embedding=q_emb,
        query_text=query,
        top_k=4,
        include_neighbors=True
    )
    
    print(f"\nRetrieved {len(retrieved)} chunks:")
    found_anuradha = False
    for i, res in enumerate(retrieved):
        doc_id = res.get('doc_id')
        score = res.get('score')
        print(f"[{i}] DOC: {doc_id} | SCORE: {score:.4f}")
        if "Anuradha" in str(doc_id):
            print("!!! GHOST DETECTED !!!")
            found_anuradha = True

    if not found_anuradha:
        print("\nConclusion: THE GHOST DATA IS NOT IN THE RETRIEVED CONTEXT.")
        print("The LLM is making it up. I will need to tighten the 'Grounded' instructions.")

if __name__ == "__main__":
    debug_context()
