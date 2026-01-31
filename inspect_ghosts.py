import os
import json
import pickle
from pathlib import Path

def inspect_storage():
    paths = [
        "backend/ml/embeddings/index.jsonl",
        "backend/ml/embeddings/doc_mapping.json",
        "ml/embeddings/index.jsonl",
        "ml/embeddings/doc_mapping.json",
        "backend/ml/embeddings/documents.pkl",
    ]
    
    print("--- Storage Inspection ---")
    for p in paths:
        if os.path.exists(p):
            size = os.path.getsize(p)
            print(f"FOUND: {p} ({size/1024:.2f} KB)")
            if p.endswith(".json"):
                with open(p, "r") as f:
                    data = json.load(f)
                    print(f"  Docs in {p}: {list(data.keys())}")
            if p.endswith(".jsonl"):
                with open(p, "r") as f:
                    lines = f.readlines()
                    docs = set()
                    for l in lines[:500]: # Check first 500
                        try:
                            docs.add(json.loads(l).get("doc_id"))
                        except: pass
                    print(f"  Sample Docs in {p}: {list(docs)}")
        else:
            print(f"NOT FOUND: {p}")

    # Inspect documents.pkl if it exists
    pkl_path = "backend/ml/embeddings/documents.pkl"
    if os.path.exists(pkl_path):
        with open(pkl_path, "rb") as f:
            docs = pickle.load(f)
            print(f"PKL Docs count: {len(docs)}")
            doc_ids = set()
            for d in docs:
                if isinstance(d, dict): doc_ids.add(d.get("doc_id"))
                else: doc_ids.add(getattr(d, "doc_id", "unknown"))
            print(f"PKL Unique Doc IDs: {list(doc_ids)}")

if __name__ == "__main__":
    inspect_storage()
