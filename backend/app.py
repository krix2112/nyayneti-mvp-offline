import os
import json
import numpy as np
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, Response
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS

from config import get_settings
from core.pdf_processor import extract_text_from_pdf
from core.citation_parser import extract_citations
from core.llm_engine import LLMEngine
from core.comparator import Comparator
from utils import allowed_file, ensure_dirs


class NyayNetiJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, (np.bool_, bool)):
            return bool(obj)
        return super().default(obj)


# Load environment variables
load_dotenv()


def create_app() -> Flask:
    backend_dir = Path(__file__).parent.absolute()
    dist_dir = backend_dir.parent / "frontend" / "dist"
    
    # Initialize with absolute path to frontend build
    app = Flask(__name__, static_folder=str(dist_dir))
    app.json = NyayNetiJSONProvider(app)
    CORS(app)

    ensure_dirs()
    settings = get_settings()

    llm_engine = LLMEngine(
        model_name="deepseek-r1:1.5b",
        api_key=None,
        embedding_dir=settings.EMBEDDING_DIR,
        model_path=settings.LLM_MODEL_PATH,
        embedding_model=settings.EMBEDDING_MODEL_PATH,
        demo_mode=False,
        ollama_model="deepseek-r1:1.5b",
    )

    comparator = Comparator(llm_engine=llm_engine)

    # --- API ROUTES ---
    @app.route("/api/health")
    def health(): return jsonify({"status": "ready", "offline": True})

    @app.route("/api/status")
    def status():
        return jsonify({
            "status": "ok", 
            "model": {"ollama_available": True, "indexed_docs_count": len(llm_engine.get_indexed_documents())}
        })

    @app.route("/api/upload", methods=["POST"])
    def upload():
        file = request.files.get("file")
        if not file or not file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Valid PDF required"}), 400
        
        path = os.path.join(settings.UPLOAD_DIR, file.filename)
        file.save(path)
        
        # Process PDF synchronously with progress updates
        def generate_progress():
            import time
            import traceback
            try:
                print(f"📤 Upload started for: {file.filename}")
                
                # Step 1: Extract text
                yield f"data: {json.dumps({'progress': 10, 'status': 'Extracting text from PDF...'})}\n\n"
                time.sleep(0.1)
                text = extract_text_from_pdf(path)
                print(f"✅ Text extracted: {len(text)} characters")
                
                # Step 2: Split into chunks
                yield f"data: {json.dumps({'progress': 30, 'status': 'Splitting into chunks...'})}\n\n"
                time.sleep(0.1)
                
                # Step 3: Generate embeddings (this is the slow part)
                yield f"data: {json.dumps({'progress': 40, 'status': 'Generating AI embeddings (this may take a moment)...'})}\n\n"
                time.sleep(0.1)
                
                result = llm_engine.index_document(doc_id=file.filename, text=text)
                
                # Step 4: Complete
                yield f"data: {json.dumps({'progress': 100, 'status': 'Complete!', 'success': True, 'filename': file.filename, 'chunks': result.get('num_chunks', 0)})}\n\n"
                print(f"✅ Upload complete for {file.filename}")
                
            except Exception as e:
                error_msg = str(e)
                print(f"❌ Indexing failed: {error_msg}")
                print(f"Traceback: {traceback.format_exc()}")
                yield f"data: {json.dumps({'progress': 0, 'status': f'Error: {error_msg}', 'error': True})}\n\n"
        
        return Response(generate_progress(), mimetype='text/event-stream')

    @app.route("/api/documents")
    def docs(): return jsonify({"documents": llm_engine.get_indexed_documents()})

    @app.route("/api/query/stream", methods=["POST"])
    def query():
        q = request.json.get("question")
        from flask import Response
        return Response(llm_engine.answer_question_stream(q), mimetype='text/event-stream')

    @app.route("/api/compare", methods=["POST"])
    def compare():
        d1, d2 = request.json.get("doc1_id"), request.json.get("doc2_id")
        return jsonify(comparator.compare_documents(d1, d2))

    @app.route("/api/compare-pdf", methods=["POST"])
    def compare_pdf():
        selected_pdf = request.json.get("selected_pdf_id")
        query = request.json.get("query", "")
        
        if not selected_pdf:
            return jsonify({"error": "Please select a PDF"}), 400
        
        from flask import Response
        return Response(
            llm_engine.compare_pdf_stream(selected_pdf, query),
            mimetype='text/event-stream'
        )

    # --- FRONTEND SERVING ---
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def catch_all(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, "index.html")

    return app

if __name__ == "__main__":
    app = create_app()
    from config import get_settings
    port = get_settings().BACKEND_PORT
    print(f"NyayNeti LIVE at http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
