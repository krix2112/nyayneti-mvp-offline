import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from config import get_settings
from core.llm_engine import LLMEngine

os.environ["DEMO_MODE"] = "false"

settings = get_settings()
engine = LLMEngine(
    model_name=settings.LLM_MODEL_NAME,
    api_key=settings.RUNANYWHERE_API_KEY,
    embedding_dir=settings.EMBEDDING_DIR,
    model_path=settings.LLM_MODEL_PATH,
    context_length=settings.LLM_CONTEXT_LENGTH,
    gpu_layers=settings.LLM_GPU_LAYERS,
    n_threads=settings.LLM_THREADS,
    embedding_model=settings.EMBEDDING_MODEL,
    demo_mode=settings.DEMO_MODE,
)

print("Running test query...")
try:
    res = engine.answer_question("What articles of constitution are cited?")
    print("Success! Got response.")
    print(f"Response keys: {res.keys()}")
    for k, v in res.items():
        print(f"  {k}: {type(v)}")
        if isinstance(v, list) and v:
            print(f"    First item of {k} is type: {type(v[0])}")
            if isinstance(v[0], dict):
                for sk, sv in v[0].items():
                    print(f"      {sk}: {type(sv)}")
    
    import json
    # Explicitly test JSON serialization here
    json_dumps_res = json.dumps(res)
    print("JSON Serialization success!")
except Exception as e:
    import traceback
    traceback.print_exc()
