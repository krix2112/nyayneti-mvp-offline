#!/usr/bin/env python3
"""
Pre-index all demo PDFs and text files for NyayNeti.
Run this once to populate the embedding store.
"""

import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from config import get_settings
from core.pdf_processor import extract_text_from_pdf
from core.citation_parser import extract_citations
from core.llm_engine import LLMEngine


def index_demo_data():
    settings = get_settings()
    
    print("=" * 60)
    print("NyayNeti Demo Data Indexer")
    print("=" * 60)
    
    # Initialize LLM engine
    llm_engine = LLMEngine(
        model_name=settings.LLM_MODEL_NAME,
        api_key=settings.RUNANYWHERE_API_KEY,
        embedding_dir=settings.EMBEDDING_DIR,
        model_path=settings.LLM_MODEL_PATH,
        context_length=settings.LLM_CONTEXT_LENGTH,
        gpu_layers=settings.LLM_GPU_LAYERS,
        n_threads=settings.LLM_THREADS,
        embedding_model=settings.EMBEDDING_MODEL,
        demo_mode=False,  # Force real embeddings
    )
    
    demo_dir = Path(settings.DEMO_DATA_DIR)
    
    if not demo_dir.exists():
        print(f"Demo data directory not found: {demo_dir}")
        return
    
    # Find all PDFs and text files
    files = list(demo_dir.glob("*.pdf")) + list(demo_dir.glob("*.PDF")) + list(demo_dir.glob("*.txt"))
    
    print(f"Found {len(files)} files to index")
    print()
    
    indexed = 0
    for file_path in files:
        print(f"Processing: {file_path.name}...")
        
        try:
            # Extract text
            if file_path.suffix.lower() == ".pdf":
                text = extract_text_from_pdf(str(file_path))
            else:
                text = file_path.read_text(encoding="utf-8", errors="ignore")
            
            if not text.strip():
                print(f"  ⚠️ No text extracted, skipping")
                continue
            
            # Extract citations
            citations = extract_citations(text)
            
            # Index document
            result = llm_engine.index_document(
                doc_id=file_path.name,
                text=text,
                metadata={"citations": citations, "source": "demo_data"}
            )
            
            print(f"  ✅ Indexed: {result['num_chunks']} chunks, {len(citations)} citations")
            indexed += 1
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print()
    print("=" * 60)
    print(f"Indexing complete! {indexed}/{len(files)} documents indexed.")
    print(f"Embeddings stored in: {settings.EMBEDDING_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    index_demo_data()
