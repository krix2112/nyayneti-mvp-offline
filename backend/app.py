import os
import json
import logging
import numpy as np
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, Response
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS

from config import get_settings
from core.pdf_processor import extract_text_from_pdf, split_text_into_chunks
from core.citation_parser import extract_citations
from core.llm_engine import LLMEngine
from core.comparator import Comparator
from core.vector_store import PersistentVectorStore
from utils import allowed_file, ensure_dirs

# Configure logging
BASE_DIR = Path(__file__).resolve().parent
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)
LOG_FILE = LOGS_DIR / "backend.log"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(str(LOG_FILE)),
        logging.StreamHandler()  # Also print to console
    ]
)
logger = logging.getLogger(__name__)


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

    # Initialize vector store and embedding model
    vector_store = None
    embedding_model = None
    
    try:
        logger.info(f"Initializing vector store from {settings.EMBEDDING_DIR}")
        vector_store = PersistentVectorStore(storage_path=settings.EMBEDDING_DIR)
        logger.info("Vector store initialized successfully")
        
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading embedding model from: {settings.EMBEDDING_MODEL_PATH}")
        embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL_PATH)
        logger.info("Embedding model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to initialize vector store or embeddings: {e}", exc_info=True)
        # Don't crash - set to None and handle gracefully in endpoints

    # Keep existing LLM engine for compare-pdf functionality
    llm_engine = LLMEngine(
        model_name="deepseek-r1:1.5b",
        api_key=None,
        embedding_dir=settings.EMBEDDING_DIR,
        model_path=settings.LLM_MODEL_PATH,
        embedding_model=settings.EMBEDDING_MODEL_PATH,
        demo_mode=False,
        ollama_model="deepseek-r1:1.5b",
        vector_store=vector_store,
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
        """Upload PDF and index it immediately into vector store"""
        file = request.files.get("file")
        if not file or not file.filename.lower().endswith(".pdf"):
            logger.error("Invalid file upload attempt")
            return jsonify({"error": "Valid PDF required"}), 400
        
        path = os.path.join(settings.UPLOAD_DIR, file.filename)
        file.save(path)
        
        # Process PDF with vector store
        def generate_progress():
            import time
            import traceback
            import uuid
            try:
                logger.info(f"📤 Upload started for: {file.filename}")
                
                # Step 1: Extract text
                yield f"data: {json.dumps({'progress': 10, 'status': 'Extracting text from PDF...'})}\n\n"
                time.sleep(0.1)
                text = extract_text_from_pdf(path)
                logger.info(f"✅ Text extracted: {len(text)} characters")
                
                # Step 2: Split into chunks
                yield f"data: {json.dumps({'progress': 30, 'status': 'Splitting into chunks...'})}\n\n"
                time.sleep(0.1)
                chunks = split_text_into_chunks(text, max_chars=1500)
                logger.info(f"Created {len(chunks)} chunks")
                
                # Step 3: Generate embeddings
                yield f"data: {json.dumps({'progress': 50, 'status': 'Generating AI embeddings (this may take a moment)...'})}\n\n"
                time.sleep(0.1)
                
                if embedding_model is None:
                    raise Exception("Embedding model not initialized")
                
                embeddings = embedding_model.encode(
                    chunks,
                    show_progress_bar=False,
                    convert_to_numpy=True
                )
                logger.info(f"Generated embeddings: shape {embeddings.shape}")
                
                # Step 4: Add to vector store
                yield f"data: {json.dumps({'progress': 80, 'status': 'Indexing into vector store...'})}\n\n"
                time.sleep(0.1)
                
                if vector_store is None:
                    raise Exception("Vector store not initialized")
                
                metadata = {
                    'filename': file.filename,
                    'file_size': len(text)
                }
                
                result = vector_store.add_document(
                    doc_id=file.filename,
                    chunks=chunks,
                    embeddings=embeddings,
                    metadata=metadata
                )
                
                logger.info(f"Successfully indexed document: {result}")
                
                # Also index with llm_engine for backward compatibility
                llm_engine.index_document(doc_id=file.filename, text=text)
                
                # Step 5: Complete
                stats = vector_store.get_stats()
                completion_data = {
                    'progress': 100,
                    'status': 'Complete!',
                    'success': True,
                    'filename': file.filename,
                    'chunks': len(chunks),
                    'total_documents': stats['total_documents']
                }
                yield f"data: {json.dumps(completion_data)}\n\n"
                logger.info(f"✅ Upload complete for {file.filename}")
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"❌ Indexing failed: {error_msg}", exc_info=True)
                yield f"data: {json.dumps({'progress': 0, 'status': f'Error: {error_msg}', 'error': True})}\n\n"
        
        return Response(generate_progress(), mimetype='text/event-stream')

    @app.route("/api/documents")
    def docs():
        """List all indexed documents"""
        try:
            if vector_store is None:
                # Fallback to llm_engine
                return jsonify({"documents": llm_engine.get_indexed_documents()})
            
            documents = vector_store.list_documents()
            stats = vector_store.get_stats()
            
            return jsonify({
                'documents': documents,
                'total': len(documents),
                'total_chunks': stats['total_chunks']
            }), 200
        except Exception as e:
            logger.error(f"List documents failed: {e}", exc_info=True)
            return jsonify({'error': str(e)}), 500

    @app.route("/api/query/stream", methods=["POST"])
    def query():
        q = request.json.get("question")
        
        # Phase 6: Intelligent Input Validation
        is_valid, error_msg = llm_engine.is_query_meaningful(q)
        if not is_valid:
            logger.warning(f"Rejected invalid query: {q[:50]}...")
            def generate_error():
                yield f"ERROR: {error_msg}"
            return Response(generate_error(), mimetype='text/event-stream')

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
        
        # Phase 6: Intelligent Input Validation (if query is provided)
        if query:
            is_valid, error_msg = llm_engine.is_query_meaningful(query)
            if not is_valid:
                logger.warning(f"Rejected invalid comparison query: {query[:50]}...")
                def generate_error():
                    yield f"ERROR: {error_msg}"
                return Response(generate_error(), mimetype='text/event-stream')

        from flask import Response
        return Response(
            llm_engine.compare_pdf_stream(selected_pdf, query),
            mimetype='text/event-stream'
        )
    
    @app.route("/api/stats", methods=["GET"])
    def get_vector_store_stats():
        """Get vector store statistics"""
        try:
            if vector_store is None:
                return jsonify({'error': 'Vector store not available'}), 500
            
            stats = vector_store.get_stats()
            return jsonify(stats), 200
        except Exception as e:
            logger.error(f"Get stats failed: {e}", exc_info=True)
            return jsonify({'error': str(e)}), 500
    
    @app.route("/api/document/<doc_id>", methods=["DELETE"])
    def delete_document(doc_id):
        """Delete a document from vector store"""
        try:
            if vector_store is None:
                return jsonify({'error': 'Vector store not available'}), 500
            
            result = vector_store.delete_document(doc_id)
            return jsonify(result), 200
        except Exception as e:
            logger.error(f"Delete document failed: {e}", exc_info=True)
            return jsonify({'error': str(e)}), 500

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
