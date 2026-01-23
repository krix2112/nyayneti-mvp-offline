import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import get_settings
from core.pdf_processor import extract_text_from_pdf
from core.citation_parser import extract_citations
from core.llm_engine import LLMEngine
from utils import allowed_file, ensure_dirs


# Load environment variables
load_dotenv()


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    settings = get_settings()
    ensure_dirs()

    # Initialize LLM engine with full configuration
    llm_engine = LLMEngine(
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

    # --- Health & Status Endpoints ---

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "message": "NyayNeti backend is live"}), 200

    @app.route("/api/status", methods=["GET"])
    def status():
        """Get detailed system status including model loading state."""
        model_status = llm_engine.get_model_status()
        return jsonify({
            "status": "ok",
            "service": "NyayNeti",
            "model": model_status,
        }), 200

    # --- Document Management Endpoints ---

    @app.route("/api/upload", methods=["POST"])
    def upload_pdf():
        """Upload and index a PDF document."""
        if "file" not in request.files:
            return jsonify({"error": "No file part in request"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Only PDF files are supported"}), 400

        upload_path = os.path.join(settings.UPLOAD_DIR, file.filename)
        file.save(upload_path)

        try:
            text = extract_text_from_pdf(upload_path)
            citations = extract_citations(text)

            index_result = llm_engine.index_document(
                doc_id=file.filename,
                text=text,
                metadata={"citations": citations},
            )

            return jsonify({
                "filename": file.filename,
                "citations": citations,
                "num_chunks": index_result.get("num_chunks", 0),
                "message": "File uploaded and indexed successfully",
            })
        except Exception as e:
            return jsonify({"error": f"Failed to process PDF: {str(e)}"}), 500

    @app.route("/api/documents", methods=["GET"])
    def list_documents():
        """List all indexed documents."""
        documents = llm_engine.get_indexed_documents()
        return jsonify({
            "documents": documents,
            "total": len(documents),
        }), 200

    @app.route("/api/documents/<doc_id>", methods=["GET"])
    def get_document(doc_id):
        """Get details for a specific document."""
        documents = llm_engine.get_indexed_documents()
        doc = next((d for d in documents if d["doc_id"] == doc_id), None)

        if not doc:
            return jsonify({"error": f"Document '{doc_id}' not found"}), 404

        return jsonify(doc), 200

    # --- Query & Analysis Endpoints ---

    @app.route("/api/query", methods=["POST"])
    def query():
        """Answer a legal question using RAG."""
        payload = request.get_json(force=True, silent=True) or {}
        question = payload.get("question", "").strip()

        if not question:
            return jsonify({"error": "Question is required"}), 400

        response = llm_engine.answer_question(question)
        return jsonify(response), 200

    @app.route("/api/summary", methods=["POST"])
    def summarize():
        """Summarize a specific document."""
        payload = request.get_json(force=True, silent=True) or {}
        doc_id = payload.get("doc_id", "").strip()

        if not doc_id:
            return jsonify({"error": "doc_id is required"}), 400

        response = llm_engine.summarize_document(doc_id)

        if "error" in response:
            return jsonify(response), 404

        return jsonify(response), 200

    @app.route("/api/citations", methods=["POST"])
    def extract_citations_endpoint():
        """Extract citations from provided text (without uploading a file)."""
        payload = request.get_json(force=True, silent=True) or {}
        text = payload.get("text", "").strip()

        if not text:
            return jsonify({"error": "text is required"}), 400

        citations = extract_citations(text)
        return jsonify({
            "citations": citations,
            "count": len(citations),
        }), 200

    return app


if __name__ == "__main__":
    settings = get_settings()
    app = create_app()
    print(f"Starting NyayNeti backend on port {settings.BACKEND_PORT}...")
    print(f"LLM Model: {settings.LLM_MODEL_PATH or 'Not configured (demo mode)'}")
    print(f"Debug mode: {settings.DEBUG}")
    app.run(host="0.0.0.0", port=settings.BACKEND_PORT, debug=settings.DEBUG)
