
import os
import json
import pickle
from pathlib import Path

# Paths based on previous context
EMBEDDING_DIR = Path(r"ml/embeddings")
INDEX_PATH = EMBEDDING_DIR / "index.jsonl"
EMBEDDINGS_PATH = EMBEDDING_DIR / "embeddings.pkl"
DOC_ID_TO_REMOVE = "Constitution_of_India.PDF"

def remove_document():
    print(f"Removing {DOC_ID_TO_REMOVE} from database...")
    
    # 1. Clean index.jsonl
    if INDEX_PATH.exists():
        print("Cleaning index.jsonl...")
        with open(INDEX_PATH, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        removed_count = 0
        for line in lines:
            try:
                data = json.loads(line)
                if data.get('doc_id') == DOC_ID_TO_REMOVE:
                    removed_count += 1
                else:
                    new_lines.append(line)
            except:
                new_lines.append(line)
        
        with open(INDEX_PATH, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Removed {removed_count} chunk entries.")

    # 2. Clean embeddings.pkl
    if EMBEDDINGS_PATH.exists():
        print("Cleaning embeddings.pkl...")
        try:
            with open(EMBEDDINGS_PATH, 'rb') as f:
                embeddings = pickle.load(f)
            
            keys_to_remove = [k for k in embeddings.keys() if k.startswith(f"{DOC_ID_TO_REMOVE}_")]
            for k in keys_to_remove:
                del embeddings[k]
                
            with open(EMBEDDINGS_PATH, 'wb') as f:
                pickle.dump(embeddings, f)
            print(f"Removed {len(keys_to_remove)} vectors.")
        except Exception as e:
            print(f"Error processing pickle: {e}")

    print("Success.")

if __name__ == "__main__":
    remove_document()
