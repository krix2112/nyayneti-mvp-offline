#!/usr/bin/env python3
"""
Test script for FAISS vector store implementation

This script validates all core functionality of the PersistentVectorStore:
- Initialization
- Adding documents
- Searching
- Persistence (save/load)
- Document deletion

Run this before declaring implementation complete.
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from core.vector_store import PersistentVectorStore
from sentence_transformers import SentenceTransformer
import numpy as np


def test_vector_store():
    print("=" * 60)
    print("TESTING FAISS VECTOR STORE")
    print("=" * 60)
    
    # Test 1: Initialization
    print("\n[TEST 1] Initializing vector store...")
    try:
        vs = PersistentVectorStore(storage_path="test_embeddings")
        print("✓ Initialization successful")
    except Exception as e:
        print(f"✗ Initialization failed: {e}")
        return False
    
    # Test 2: Add documents
    print("\n[TEST 2] Adding test documents...")
    try:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Test document 1
        chunks1 = [
            "Section 420 IPC deals with cheating.",
            "Punishment is imprisonment up to 7 years."
        ]
        embeddings1 = model.encode(chunks1)
        result1 = vs.add_document(
            doc_id="doc1",
            chunks=chunks1,
            embeddings=embeddings1,
            metadata={'filename': 'test1.pdf'}
        )
        print(f"✓ Added document 1: {result1}")
        
        # Test document 2
        chunks2 = [
            "Article 21 protects life and liberty.",
            "It is a fundamental right."
        ]
        embeddings2 = model.encode(chunks2)
        result2 = vs.add_document(
            doc_id="doc2",
            chunks=chunks2,
            embeddings=embeddings2,
            metadata={'filename': 'test2.pdf'}
        )
        print(f"✓ Added document 2: {result2}")
        
    except Exception as e:
        print(f"✗ Adding documents failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test 3: Search
    print("\n[TEST 3] Testing search...")
    try:
        query = "What is the punishment for cheating?"
        query_emb = model.encode([query])[0]
        results = vs.search(query_emb, top_k=2)
        
        print(f"✓ Search returned {len(results)} results")
        for i, result in enumerate(results):
            print(f"  Result {i+1}: score={result['score']:.3f}, text={result['text'][:50]}...")
        
        if len(results) == 0:
            print("✗ Search returned no results")
            return False
            
    except Exception as e:
        print(f"✗ Search failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test 4: Persistence
    print("\n[TEST 4] Testing persistence...")
    try:
        stats_before = vs.get_stats()
        print(f"Stats before reload: {stats_before}")
        
        # Create new instance (should load from disk)
        vs2 = PersistentVectorStore(storage_path="test_embeddings")
        stats_after = vs2.get_stats()
        print(f"Stats after reload: {stats_after}")
        
        if stats_before['total_chunks'] == stats_after['total_chunks']:
            print("✓ Persistence works correctly")
        else:
            print("✗ Persistence failed: chunk count mismatch")
            return False
    except Exception as e:
        print(f"✗ Persistence test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test 5: Delete
    print("\n[TEST 5] Testing document deletion...")
    try:
        result = vs2.delete_document("doc1")
        print(f"✓ Deletion result: {result}")
        
        if not result.get('success'):
            print("✗ Deletion failed")
            return False
        
        stats_final = vs2.get_stats()
        print(f"Final stats: {stats_final}")
        
        # Verify doc1 is gone
        if stats_final['total_documents'] == 1:
            print("✓ Document successfully deleted")
        else:
            print("✗ Document deletion verification failed")
            return False
            
    except Exception as e:
        print(f"✗ Deletion failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Cleanup
    print("\n[CLEANUP] Removing test directory...")
    try:
        import shutil
        shutil.rmtree("test_embeddings")
        print("✓ Cleanup successful")
    except Exception as e:
        print(f"⚠ Cleanup warning: {e}")
    
    print("\n" + "=" * 60)
    print("ALL TESTS PASSED ✓")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = test_vector_store()
    sys.exit(0 if success else 1)
