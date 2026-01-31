import os
import json
import logging
import numpy as np
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, Response
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS

from config import get_settings
from core.pdf_processor import (
    extract_text_from_pdf, 
    split_text_into_chunks, 
    split_text_into_chunks_with_pages,
    get_pdf_page_count
)
from core.citation_parser import extract_citations
from core.llm_engine import LLMEngine
from core.comparator import Comparator
from core.vector_store import PersistentVectorStore
from core.document_drafter import get_document_drafter
from core.strength_analyzer import get_strength_analyzer
from core.citation_extractor import citation_extractor
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
    drafter = get_document_drafter(llm_engine=llm_engine)
    analyzer = get_strength_analyzer(llm_engine=llm_engine)

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
                
                # Step 2: Split into chunks with page info and extract citations
                yield f"data: {json.dumps({'progress': 25, 'status': 'Processing PDF structure and citations...'})}\n\n"
                time.sleep(0.1)
                
                # Extract citations from full text
                doc_citations = citation_extractor.extract_all_citations(text)
                citation_counts = citation_extractor.count_citations(text)
                logger.info(f"Citations found: {citation_counts}")
                
                # Split into chunks with page info for better highlighting
                chunks_info = split_text_into_chunks_with_pages(path, max_chars=1500)
                chunks = [c['text'] for c in chunks_info]
                logger.info(f"Created {len(chunks)} chunks with page mapping")
                
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
                
                # Prepare chunk-level metadata
                chunk_meta_list = []
                for chunk_info in chunks_info:
                    chunk_meta_list.append({
                        'page': chunk_info.get('primary_page', 1),
                        'pages': chunk_info.get('pages', []),
                        'bboxes': chunk_info.get('bboxes', [])
                    })
                
                metadata = {
                    'filename': file.filename,
                    'file_size': len(text),
                    'citations': doc_citations,
                    'citation_count': citation_counts,
                    'upload_date': datetime.now().isoformat(),
                    'total_pages': get_pdf_page_count(path) if 'get_pdf_page_count' in globals() else 1
                }
                
                result = vector_store.add_document(
                    doc_id=file.filename,
                    chunks=chunks,
                    embeddings=embeddings,
                    metadata=metadata,
                    chunk_metadata=chunk_meta_list
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
        data = request.json
        q = data.get("question")
        doc_id = data.get("doc_id") # Optional document restriction
        
        # Phase 6: Intelligent Input Validation
        is_valid, error_msg = llm_engine.is_query_meaningful(q)
        if not is_valid:
            logger.warning(f"Rejected invalid query: {q[:50]}...")
            def generate_error():
                yield f"ERROR: {error_msg}"
            return Response(generate_error(), mimetype='text/event-stream')

        from flask import Response
        return Response(llm_engine.answer_question_stream(q, doc_id=doc_id), mimetype='text/event-stream')

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

    # --- VOICE FEATURES ENDPOINTS ---
    
    @app.route("/api/transcribe", methods=["POST"])
    def transcribe_audio():
        """Transcribe audio file to text using Whisper"""
        import tempfile
        from services.voice_processor import get_transcriber
        from services.audio_utils import validate_audio_file, convert_to_wav, get_audio_duration, cleanup_temp_file
        
        try:
            # Check if audio file is present
            if 'audio' not in request.files:
                logger.warning("[VOICE] No audio file in request")
                return jsonify({'error': 'No audio file provided'}), 400
            
            audio_file = request.files['audio']
            
            if audio_file.filename == '':
                logger.warning("[VOICE] Empty filename")
                return jsonify({'error': 'No file selected'}), 400
            
            # Get optional language parameter
            language = request.form.get('language', None)  # 'hi' or 'en' or None for auto-detect
            
            logger.info(f"[VOICE] Received audio file: {audio_file.filename}")
            logger.info(f"[VOICE] Requested language: {language or 'auto-detect'}")
            
            # Save uploaded file temporarily
            temp_dir = tempfile.gettempdir()
            temp_input_path = os.path.join(temp_dir, f"voice_input_{datetime.now().strftime('%Y%m%d_%H%M%S')}.webm")
            audio_file.save(temp_input_path)
            
            logger.info(f"[VOICE] Saved to temp: {temp_input_path}")
            
            # Validate file size
            is_valid, error_msg = validate_audio_file(temp_input_path)
            if not is_valid:
                cleanup_temp_file(temp_input_path)
                logger.error(f"[VOICE] Validation failed: {error_msg}")
                return jsonify({'error': error_msg}), 400
            
            # Convert to WAV format (16kHz mono)
            temp_wav_path = os.path.join(temp_dir, f"voice_input_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav")
            success, result = convert_to_wav(temp_input_path, temp_wav_path)
            
            if not success:
                cleanup_temp_file(temp_input_path)
                logger.error(f"[VOICE] Conversion failed: {result}")
                return jsonify({'error': f'Audio conversion failed: {result}'}), 500
            
            wav_path = result
            logger.info(f"[VOICE] Converted to WAV: {wav_path}")
            
            # Get audio duration
            duration = get_audio_duration(wav_path)
            
            # Transcribe using Whisper
            transcriber = get_transcriber()
            success, transcription_result = transcriber.transcribe(wav_path, language=language)
            
            # Cleanup temp files
            cleanup_temp_file(temp_input_path)
            cleanup_temp_file(wav_path)
            
            if not success:
                error = transcription_result.get('error', 'Unknown error')
                logger.error(f"[VOICE] Transcription failed: {error}")
                return jsonify({'error': error}), 500
            
            # Return transcription result
            response_data = {
                'text': transcription_result['text'],
                'language': transcription_result['language'],
                'duration': duration or transcription_result.get('duration', 0),
                'transcription_time': transcription_result['transcription_time']
            }
            
            logger.info(f"[VOICE] ✅ Transcription successful: {response_data['text'][:50]}...")
            return jsonify(response_data), 200
            
        except Exception as e:
            logger.error(f"[VOICE] ❌ Transcription endpoint error: {e}", exc_info=True)
            return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    @app.route("/api/tts", methods=["GET"])
    def text_to_speech():
        """Convert text to speech using Piper neural TTS"""
        from services.piper_tts import get_tts_engine
        from flask import send_file
        
        try:
            text = request.args.get('text', '')
            lang = request.args.get('lang', 'en')
            
            if not text:
                return jsonify({'error': 'No text provided'}), 400
            
            engine = get_tts_engine()
            success, output_path_or_err = engine.synthesize(text, lang=lang)
            
            if not success:
                logger.error(f"[VOICE] TTS synthesis failed: {output_path_or_err}")
                return jsonify({'error': f'Synthesis failed: {output_path_or_err}'}), 500
            
            # Return the audio file
            return send_file(
                output_path_or_err,
                mimetype="audio/wav",
                as_attachment=False,
                download_name="speech.wav"
            )
            
        except Exception as e:
            logger.error(f"[VOICE] ❌ TTS endpoint error: {e}", exc_info=True)
            return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    # --- POWER FEATURES ENDPOINTS ---
    
    @app.route("/api/templates", methods=["GET"])
    def get_templates():
        """Get all legal document templates"""
        return jsonify(drafter.get_templates())

    @app.route("/api/draft-document", methods=["POST"])
    def draft_document():
        """Generate a legal document from template"""
        data = request.json
        template_type = data.get("template_type")
        user_inputs = data.get("user_inputs")
        enhance = data.get("enhance", True)
        
        if not template_type or not user_inputs:
            return jsonify({"error": "Template type and inputs required"}), 400
            
        result = drafter.generate_document(template_type, user_inputs, enhance_with_llm=enhance)
        return jsonify(result)

    @app.route("/api/analyze-draft-context", methods=["POST"])
    def analyze_draft_context():
        """Analyze a PDF to extract information for a specific template"""
        data = request.json
        doc_id = data.get("doc_id")
        template_type = data.get("template_type")
        
        if not doc_id or not template_type:
            return jsonify({"error": "doc_id and template_type required"}), 400
            
        # Get document text
        doc = next((d for d in vector_store.documents if d['doc_id'] == doc_id), None)
        if not doc:
            # Try reloading index if not found
            if hasattr(llm_engine, '_load_index'):
                chunks = llm_engine._load_index()
                doc_chunks = [ch for ch in chunks if ch.doc_id == doc_id]
                if doc_chunks:
                    text = "\n".join([ch.text for ch in doc_chunks])
                else:
                    return jsonify({"error": "Document not found"}), 404
            else:
                return jsonify({"error": "Document not found"}), 404
        else:
            text = doc.get('text', "")
            if not text:
                # Reconstruct text from chunks if full text not in meta
                doc_chunks = [ch for ch in vector_store.documents if ch['doc_id'] == doc_id]
                text = "\n".join([ch['text'] for ch in doc_chunks])

        template = drafter.get_template(template_type)
        if not template:
            return jsonify({"error": "Invalid template type"}), 400
            
        extracted_fields = llm_engine.analyze_document_for_drafting(text, template_type, template['fields'])
        
        return jsonify({
            "success": True,
            "extracted_fields": extracted_fields,
            "template_name": template['name']
        })

    @app.route("/api/analyze-strength", methods=["POST"])
    def analyze_strength():
        """Analyze legal document strength"""
        doc_id = request.json.get("doc_id")
        text = request.json.get("text")
        
        if doc_id:
            # Find document text from vector store
            doc = next((d for d in vector_store.documents if d['doc_id'] == doc_id), None)
            if not doc:
                return jsonify({"error": "Document not found"}), 404
            text = doc['text']
        
        if not text:
            return jsonify({"error": "Text or doc_id required"}), 400
            
        result = analyzer.analyze_document(text)
        return jsonify(result)

    @app.route("/api/search-citations", methods=["POST"])
    def search_by_citation():
        """Search documents by specific citation"""
        data = request.json
        citation = data.get("citation")
        citation_type = data.get("citation_type", "all")
        
        if not citation:
            return jsonify({"error": "Citation query required"}), 400
            
        # Get all documents from vector store
        all_docs = []
        doc_ids = set()
        for doc in vector_store.documents:
            if doc['doc_id'] not in doc_ids:
                all_docs.append(doc)
                doc_ids.add(doc['doc_id'])
                
        results = citation_extractor.search_documents_by_citation(all_docs, citation, citation_type)
        return jsonify({"results": results})

    @app.route("/api/citations/<doc_id>", methods=["GET"])
    def get_doc_citations(doc_id):
        """Get all citations for a specific document"""
        doc = next((d for d in vector_store.documents if d['doc_id'] == doc_id), None)
        if not doc:
            return jsonify({"error": "Document not found"}), 404
            
        citations = citation_extractor.extract_all_citations(doc['text'])
        counts = citation_extractor.count_citations(doc['text'])
        return jsonify({"citations": citations, "counts": counts})

    @app.route("/api/document/<doc_id>/pdf", methods=["GET"])
    def serve_pdf(doc_id):
        """Serve PDF file for viewer"""
        # doc_id is typically the filename in our current setup
        path = os.path.join(settings.UPLOAD_DIR, doc_id)
        if not os.path.exists(path):
            return jsonify({"error": "PDF not found"}), 404
            
        return send_from_directory(settings.UPLOAD_DIR, doc_id, mimetype='application/pdf')

    @app.route("/api/download/<filename>", methods=["GET"])
    def download_generated(filename):
        """Download generated DOCX/TXT file"""
        return send_from_directory("generated_documents", filename, as_attachment=True)

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
