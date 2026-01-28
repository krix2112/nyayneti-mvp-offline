"""
NyayNeti Offline Verification Tool
===================================
Verifies that the application is fully configured for offline operation.
Tests all critical components without internet connection.

Usage: python verify_offline.py
"""

import os
import sys
from pathlib import Path
import socket


def block_internet_check():
    """Test if we can detect internet connectivity (for verification)."""
    try:
        # Try to resolve Google DNS
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True
    except OSError:
        return False


def check_file(path, description, required=True):
    """Check if a file exists."""
    exists = Path(path).exists()
    status = "✅" if exists else ("❌" if required else "⚠️ ")
    print(f"  {status} {description}")
    if not exists and required:
        print(f"      Missing: {path}")
    return exists


def check_directory(path, description):
    """Check if directory exists and is not empty."""
    dir_path = Path(path)
    if not dir_path.exists():
        print(f"  ❌ {description} - Directory missing")
        return False
    
    files = list(dir_path.rglob("*"))
    file_count = len([f for f in files if f.is_file()])
    
    if file_count == 0:
        print(f"  ⚠️  {description} - Empty (no files)")
        return False
    else:
        print(f"  ✅ {description} - {file_count} files found")
        return True


def main():
    print("\n" + "="*70)
    print("🔍 NYAYNETI OFFLINE VERIFICATION TOOL")
    print("="*70)
    
    # Check if internet is available
    has_internet = block_internet_check()
    if has_internet:
        print("\n⚠️  WARNING: Internet connection detected!")
        print("   For true offline testing, disconnect WiFi/Ethernet")
        print("   Proceeding with verification anyway...\n")
    else:
        print("\n✅ OFFLINE MODE CONFIRMED - No internet detected\n")
    
    # Check Python dependencies
    print("=" * 70)
    print("📦 CHECKING PYTHON DEPENDENCIES")
    print("=" * 70)
    
    deps = {
        'flask': 'Flask',
        'flask_cors': 'Flask-CORS',
        'sentence_transformers': 'Sentence Transformers',
        'numpy': 'NumPy',
        'pdfminer': 'PDF Miner',
        'dotenv': 'Python-dotenv',
    }
    
    missing_deps = []
    for module, name in deps.items():
        try:
            __import__(module.replace('-', '_'))
            print(f"  ✅ {name}")
        except ImportError:
            print(f"  ❌ {name} - NOT INSTALLED")
            missing_deps.append(name)
    
    # Check embedding model
    print("\n" + "=" * 70)
    print("🤖 CHECKING AI MODELS")
    print("=" * 70)
    
    embedding_model = check_directory(
        "backend/models/embeddings/all-MiniLM-L6-v2",
        "Embedding Model (all-MiniLM-L6-v2)"
    )
    
    llm_model = check_file(
        "ml/models/Llama-3.2-3B-Instruct-Q4_K_M.gguf",
        "LLM Model (Llama-3.2-3B GGUF)",
        required=False
    )
    
    # Check data directories
    print("\n" + "=" * 70)
    print("📁 CHECKING DATA DIRECTORIES")
    print("=" * 70)
    
    check_directory("backend/uploads", "Upload Directory")
    check_directory("backend/demo_documents", "Demo Documents")
    check_directory("ml/embeddings", "Embeddings Database")
    
    # Check scripts
    print("\n" + "=" * 70)
    print("📜 CHECKING LAUNCHER SCRIPTS")
    print("=" * 70)
    
    check_file("run.py", "Main Launcher", required=True)
    check_file("setup_offline_models.py", "Offline Setup Script", required=True)
    check_file("index_demo_docs.py", "Demo Indexer Script", required=True)
    
    # Final assessment
    print("\n" + "=" * 70)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 70)
    
    issues = []
    
    if missing_deps:
        issues.append(f"Missing {len(missing_deps)} Python package(s)")
        print(f"\n❌ {issues[-1]}")
        print(f"   Run: pip install -r backend/requirements.txt")
    
    if not embedding_model:
        issues.append("Embedding model not found")
        print(f"\n❌ {issues[-1]}")
        print(f"   Run: python setup_offline_models.py")
    
    if not llm_model:
        print(f"\n⚠️  LLM model not found (app will use Ollama fallback)")
        print(f"   Download from: https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF")
    
    if not issues:
        print(f"\n🎉 ALL CHECKS PASSED!")
        print(f"\n✅ Your NyayNeti installation is ready for OFFLINE operation")
        print(f"\n🚀 To launch the app:")
        print(f"   python run.py")
        
        if has_internet:
            print(f"\n💡 For true offline testing, disconnect internet and re-run this check")
    else:
        print(f"\n⚠️  {len(issues)} issue(s) detected:")
        for issue in issues:
            print(f"   - {issue}")
        print(f"\n📝 Fix the issues above and re-run: python verify_offline.py")
    
    print("\n" + "=" * 70 + "\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Verification failed: {e}")
        import traceback
        traceback.print_exc()
