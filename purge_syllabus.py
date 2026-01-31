import os
import sys
from pathlib import Path

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from core.vector_store import PersistentVectorStore
from config import get_settings

def purge_ghost_syllabus():
    settings = get_settings()
    vs = PersistentVectorStore(storage_path=settings.EMBEDDING_DIR)
    
    print(f"Index storage: {settings.EMBEDDING_DIR}")
    docs = vs.list_documents()
    print(f"Initial doc count: {len(docs)}")
    
    ghost_filename = "3. vetted MVJ22CS631_Blockchain Technology-1.pdf"
    
    # 1. Remove from vector store
    found = False
    for doc in docs:
        if doc['doc_id'] == ghost_filename:
            print(f"Purging {ghost_filename} from vector store...")
            vs.delete_document(ghost_filename)
            found = True
            break
    
    if not found:
        print(f"Document {ghost_filename} not found in vector store index.")
    
    # 2. Delete from uploads
    upload_path = Path(settings.UPLOAD_DIR) / ghost_filename
    if upload_path.exists():
        print(f"Deleting file: {upload_path}")
        upload_path.unlink()
    else:
        print(f"File {upload_path} not found on disk.")

    # 3. Final count
    docs_after = vs.list_documents()
    print(f"Final doc count: {len(docs_after)}")

if __name__ == "__main__":
    purge_ghost_syllabus()
