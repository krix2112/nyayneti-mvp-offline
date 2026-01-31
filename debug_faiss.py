import sys
import os

print(f"Python: {sys.version}")
print(f"Executable: {sys.executable}")
print(f"Path: {sys.path}")

try:
    import faiss
    print(f"FAISS Version: {faiss.__version__}")
    print("FAISS imported successfully!")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Other Error: {e}")
    
try:
    import numpy
    print(f"Numpy Version: {numpy.__version__}")
except ImportError:
    print("Numpy not found")
