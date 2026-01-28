
import os
import sys
import subprocess
import webbrowser
import threading
import time
from pathlib import Path

# ANSI colors for better CLI experience
GREEN = '\033[92m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RED = '\033[91m'
BOLD = '\033[1m'
RESET = '\033[0m'

def print_banner():
    print(f"""{BLUE}
======================================================================
   _   _                  _   _      _   _ 
  | \ | |                | \ | |    | | (_)
  |  \| | _   _  __ _  __|  \| | ___| |_ _ 
  | . ` || | | |/ _` |/ _` . ` |/ _ \ __| |
  | |\  || |_| | (_| | (_| |\  |  __/ |_| |
  |_| \_| \__, |\__,_|\__,_| \_|\___|\__|_|
           __/ |                           
          |___/                            
======================================================================
{RESET}                                                  
{YELLOW}🔒 Fully Offline • Privacy-First • Court-Ready    {RESET}
""")

def check_dependencies():
    """Check if required Python packages are installed."""
    print(f"\n{BOLD}Checking dependencies...{RESET}")
    
    # Critical dependencies to run core app and Ollama fallback
    required = [
        'flask',
        'flask_cors',
        'sentence_transformers',
        'numpy',
        'pdfminer',
        'dotenv',
    ]
    
    # Non-critical dependency for local inference
    optional = ['llama-cpp-python']
    
    missing_required = []
    for package in required:
        try:
            __import__(package.replace('-', '_'))
            print(f"  {GREEN}✓{RESET} {package}")
        except ImportError:
            print(f"  {RED}✗{RESET} {package} (missing)")
            missing_required.append(package)

    missing_optional = []
    for package in optional:
        try:
            __import__(package.replace('-', '_'))
            print(f"  {GREEN}✓{RESET} {package} (optional)")
        except ImportError:
            print(f"  {YELLOW}ℹ{RESET} {package} (optional missing, will use Ollama)")
            missing_optional.append(package)
    
    if missing_required:
        print(f"\n{YELLOW}⚠️  Required dependencies missing{RESET}")
        print(f"   Run: {BOLD}pip install flask flask-cors pdfminer.six python-dotenv sentence-transformers numpy requests{RESET}")
        return False
    
    return True

def check_offline_models():
    """Verify that models are downloaded."""
    emb_path = Path("backend/models/embeddings/all-MiniLM-L6-v2")
    if emb_path.exists():
        print(f"{GREEN}✅ Embedding model found (OFFLINE READY){RESET}")
        return True
    else:
        print(f"{YELLOW}⚠️  Embedding model NOT found locally{RESET}")
        print(f"   The app will try to download it (Internet required for first run)")
        return False

def open_browser():
    """Wait for server to start then open browser."""
    print("Waiting for server startup...")
    time.sleep(5)
    print(f"{GREEN}✅ Browser opened to http://localhost:8000{RESET}")
    webbrowser.open("http://localhost:8000")

def run_backend():
    """Run the Flask backend directly."""
    # Ensure backend directory is in python path
    sys.path.insert(0, str(Path(__file__).parent / "backend"))
    
    from backend.app import create_app, get_settings
    
    # Set environment variables for production-like run
    os.environ['FLASK_ENV'] = 'production'
    os.environ['DEBUG'] = 'False'
    
    try:
        app = create_app()
        settings = get_settings()
        print(f"\n{GREEN}🚀 Starting backend server...{RESET}")
        # Disable reloader to prevent double-execution
        app.run(host="0.0.0.0", port=settings.BACKEND_PORT, debug=False, use_reloader=False)
    except Exception as e:
        print(f"\n{RED}❌ Backend failed to start{RESET}")
        print(e)
        import traceback
        traceback.print_exc()
        sys.exit(1)

def main():
    # Fix encoding for Windows terminals
    if sys.platform == 'win32':
        os.system('color')
        
    print_banner()
    print(f"Starting application...\n")
    print(f"✅ Python {sys.version.split()[0]} detected")
    
    if not check_dependencies():
        input("\nPress ENTER to exit...")
        sys.exit(1)
        
    check_offline_models()
    
    # Check demo docs
    demo_docs = list(Path("backend/demo_documents").glob("*.pdf"))
    if demo_docs:
        print(f"{GREEN}✅ {len(demo_docs)} demo documents found{RESET}")
    else:
        print(f"{YELLOW}⚠️  No demo documents found in backend/demo_documents{RESET}")

    # Start browser opener in background thread
    threading.Thread(target=open_browser, daemon=True).start()
    
    try:
        run_backend()
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}Shader shutting down...{RESET}")
        sys.exit(0)

if __name__ == "__main__":
    main()
