"""
Auto-index demo legal documents for offline use.
"""

import os
from pathlib import Path
from backend.core.pdf_processor import extract_text_from_pdf
from backend.core.llm_engine import LLMEngine
from backend.config import get_settings

def index_all_demo_docs():
    """Index all PDFs in demo_documents/ directory."""
    settings = get_settings()
    demo_dir = Path(__file__).parent / "backend" / "demo_documents"
    
    if not demo_dir.exists():
        print(f"❌ Demo directory not found: {demo_dir}")
        return
    
    pdf_files = list(demo_dir.glob("*.pdf")) + list(demo_dir.glob("*.PDF"))
    
    if not pdf_files:
        print(f"⚠️  No PDF files found in {demo_dir}")
        return
    
    print(f"\n📚 Found {len(pdf_files)} legal documents to index...")
    
    # Initialize LLM engine for indexing
    llm_engine = LLMEngine(
        model_name=settings.LLM_MODEL_NAME,
        api_key=None,
        embedding_dir=settings.EMBEDDING_DIR,
        model_path=settings.LLM_MODEL_PATH,
        embedding_model=settings.EMBEDDING_MODEL_PATH,  # Use local path
        demo_mode=False,
    )
    
    for i, pdf_path in enumerate(pdf_files, 1):
        print(f"\n[{i}/{len(pdf_files)}] Processing: {pdf_path.name}")
        try:
            text = extract_text_from_pdf(str(pdf_path))
            result = llm_engine.index_document(
                doc_id=pdf_path.name,
                text=text,
                metadata={"source": "demo_corpus", "type": "legal_judgment"}
            )
            print(f"   ✅ Indexed {result['num_chunks']} chunks")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print(f"\n✅ Demo corpus indexing complete!")
    print(f"📊 Total documents indexed: {len(pdf_files)}")

if __name__ == "__main__":
    index_all_demo_docs()
