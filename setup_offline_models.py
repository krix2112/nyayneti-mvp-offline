"""
NyayNeti Offline Model Setup Script
====================================
Downloads and prepares all required AI models for offline operation.
Run this ONCE with internet connection before going offline.

Usage: python setup_offline_models.py
"""

import os
import sys
from pathlib import Path

def setup_embedding_model():
    """Download sentence-transformers model for offline use."""
    print("\n" + "="*60)
    print("📦 DOWNLOADING EMBEDDING MODEL FOR OFFLINE USE")
    print("="*60)
    
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        print("❌ ERROR: sentence-transformers not installed!")
        print("   Run: pip install sentence-transformers")
        sys.exit(1)
    
    # Create models directory
    models_dir = Path(__file__).parent / "backend" / "models" / "embeddings"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    local_path = models_dir / "all-MiniLM-L6-v2"
    
    print(f"\n🔽 Downloading: {model_name}")
    print(f"📁 Target location: {local_path}")
    print("\nThis may take 2-5 minutes depending on your connection...")
    
    try:
        # Download and cache the model
        model = SentenceTransformer(model_name)
        
        # Save to local directory for offline access
        model.save(str(local_path))
        
        print(f"\n✅ SUCCESS! Embedding model downloaded to:")
        print(f"   {local_path}")
        print(f"\n📊 Model size: ~90MB")
        
        # Verify it works
        print("\n🧪 Testing model...")
        test_embedding = model.encode("Test sentence for verification")
        print(f"✅ Model test successful! (Embedding dimension: {len(test_embedding)})")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR downloading model: {e}")
        return False


def download_demo_documents():
    """Provide instructions for adding demo legal documents."""
    print("\n" + "="*60)
    print("📜 DEMO LEGAL DOCUMENTS SETUP")
    print("="*60)
    
    demo_dir = Path(__file__).parent / "backend" / "demo_documents"
    demo_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n📁 Demo documents directory created: {demo_dir}")
    print("\n📝 TO ADD DEMO DOCUMENTS:")
    print("   1. Place 20-30 landmark Indian Supreme Court judgment PDFs in:")
    print(f"      {demo_dir}")
    print("   2. Run: python index_demo_docs.py")
    print("   3. Documents will be auto-indexed for offline use")
    print("\n💡 Suggested cases to include:")
    print("   - Kesavananda Bharati v. State of Kerala (1973)")
    print("   - Maneka Gandhi v. Union of India (1978)")
    print("   - Vishaka v. State of Rajasthan (1997)")
    print("   - K.S. Puttaswamy v. Union of India (2017)")
    print("   - And more landmark constitutional/criminal law cases")
    
    return True


def verify_llm_model():
    """Check if the LLM model file exists."""
    print("\n" + "="*60)
    print("🤖 CHECKING LLM MODEL")
    print("="*60)
    
    llm_path = Path(__file__).parent / "ml" / "models" / "Llama-3.2-3B-Instruct-Q4_K_M.gguf"
    
    if llm_path.exists():
        size_mb = llm_path.stat().st_size / (1024 * 1024)
        print(f"\n✅ LLM model found: {llm_path}")
        print(f"📊 Size: {size_mb:.1f} MB")
        return True
    else:
        print(f"\n⚠️  LLM model NOT found at: {llm_path}")
        print("\n📥 TO DOWNLOAD LLM MODEL:")
        print("   Visit: https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF")
        print("   Download: Llama-3.2-3B-Instruct-Q4_K_M.gguf (~1.9GB)")
        print(f"   Place in: {llm_path.parent}")
        print("\n💡 Alternative: The app will fall back to Ollama if available")
        return False


def create_index_script():
    """Create a script to index demo documents."""
    print("\n" + "="*60)
    print("📝 CREATING DEMO INDEXING SCRIPT")
    print("="*60)
    
    script_path = Path(__file__).parent / "index_demo_docs.py"
    
    script_content = '''"""
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
    
    print(f"\\n📚 Found {len(pdf_files)} legal documents to index...")
    
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
        print(f"\\n[{i}/{len(pdf_files)}] Processing: {pdf_path.name}")
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
    
    print(f"\\n✅ Demo corpus indexing complete!")
    print(f"📊 Total documents indexed: {len(pdf_files)}")

if __name__ == "__main__":
    index_all_demo_docs()
'''
    
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(script_content)
    
    print(f"✅ Created: {script_path}")
    return True


def main():
    """Main setup routine."""
    print("\n" + "="*70)
    print("🚀 NYAYNETI OFFLINE SETUP WIZARD")
    print("="*70)
    print("\nThis script will prepare NyayNeti for fully offline operation.")
    print("You need internet connection NOW, but not after setup completes.\n")
    
    input("Press ENTER to continue...")
    
    success = True
    
    # Step 1: Download embedding model
    if not setup_embedding_model():
        success = False
    
    # Step 2: Check LLM model
    verify_llm_model()
    
    # Step 3: Setup demo documents directory
    download_demo_documents()
    
    # Step 4: Create indexing script
    create_index_script()
    
    # Final summary
    print("\n" + "="*70)
    print("📋 SETUP SUMMARY")
    print("="*70)
    
    if success:
        print("\n✅ Embedding model downloaded and ready for offline use")
        print("✅ Demo documents directory created")
        print("✅ Indexing script created")
        print("\n🎯 NEXT STEPS:")
        print("   1. Add PDF legal judgments to backend/demo_documents/")
        print("   2. Run: python index_demo_docs.py")
        print("   3. Launch app: python run.py")
        print("\n🌐 After setup, you can DISCONNECT from internet!")
    else:
        print("\n⚠️  Some steps failed. Check errors above.")
    
    print("\n" + "="*70)

if __name__ == "__main__":
    main()
