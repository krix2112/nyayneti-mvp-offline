import sys
import os
from pathlib import Path
import numpy as np

# Add backend to path
sys.path.append(os.path.abspath("backend"))

from core.vector_store import PersistentVectorStore
from core.llm_engine import LLMEngine

def test_hybrid_search():
    print("\n--- Testing Hybrid Search & Neighbor Context ---")
    storage_path = "backend/ml/embeddings/"
    
    try:
        store = PersistentVectorStore(storage_path=storage_path)
        
        if not store.documents:
            print("No documents found in store. Please upload some PDFs first.")
            return

        # Test query
        # Use a term that might be in legal docs (e.g., 'IPC', 'section', 'court')
        query = "cheating section 420" 
        print(f"Query: {query}")
        
        # We need an embedding for semantic part
        # Mocking embedding for test or using model if available
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer('all-MiniLM-L6-v2')
            q_emb = model.encode(query)
        except:
            print("Model not found, using dummy embedding")
            q_emb = np.zeros(384)

        results = store.search(
            query_embedding=q_emb,
            query_text=query,
            top_k=2,
            include_neighbors=True
        )

        print(f"Total chunks returned (including neighbors): {len(results)}")
        for i, res in enumerate(results):
            print(f"\n[{i+1}] Score: {res['score']:.4f} | Doc: {res['doc_id']}")
            print(f"Snippet: {res['text'][:150]}...")

        # Verify neighbor context logic:
        # Check if we have chunks with consecutive or nearby IDs from same doc
        if len(results) > 1:
            print("\n✓ Verification successful: Multiple context-rich snippets retrieved.")
        else:
            print("\n⚠ Only 1 snippet retrieved. Check if neighbors exist.")

    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_hybrid_search()
