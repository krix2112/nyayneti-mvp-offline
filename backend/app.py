import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from config import get_settings
from core.pdf_processor import extract_text_from_pdf
from core.citation_parser import extract_citations
from core.llm_engine import LLMEngine
from utils import allowed_file, ensure_dirs


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    settings = get_settings()
    ensure_dirs()

    llm_engine = LLMEngine(
        model_name=settings.LLM_MODEL_NAME,
        api_key=settings.RUNANYWHERE_API_KEY,
        embedding_dir=settings.EMBEDDING_DIR,
    )

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "message": "NyayNeti backend is live"}), 200

    @app.route("/api/upload", methods=["POST"])
    def upload_pdf():
        if "file" not in request.files:
            return jsonify({"error": "No file part in request"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Only PDF files are supported"}), 400

        settings = get_settings()
        upload_path = os.path.join(settings.UPLOAD_DIR, file.filename)
        file.save(upload_path)

        text = extract_text_from_pdf(upload_path)
        citations = extract_citations(text)

        llm_engine.index_document(
            doc_id=file.filename,
            text=text,
            metadata={"citations": citations},
        )

        return jsonify(
            {
                "filename": file.filename,
                "citations": citations,
                "message": "File uploaded and indexed successfully",
            }
        )

    @app.route("/api/query", methods=["POST"])
    def query():
        payload = request.get_json(force=True, silent=True) or {}
        question = payload.get("question", "").strip()

        if not question:
            return jsonify({"error": "Question is required"}), 400

        response = llm_engine.answer_question(question)
        return jsonify(response), 200

    return app


if __name__ == "__main__":
    settings = get_settings()
    app = create_app()
    app.run(host="0.0.0.0", port=settings.BACKEND_PORT, debug=settings.DEBUG)

