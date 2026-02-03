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
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Force Werkzeug to log to console with our level
import logging as py_logging
py_logging.getLogger('werkzeug').setLevel(py_logging.INFO)
py_logging.getLogger('werkzeug').addHandler(py_logging.StreamHandler())

# Enhanced Terminal Logging
class ColoredFormatter(logging.Formatter):
    """Custom formatter for colored terminal output"""
    grey = "\x1b[38;20m"
    blue = "\x1b[34;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format_str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    def format(self, record):
        log_fmt = self.format_str
        if record.levelno == logging.DEBUG:
            log_fmt = self.grey + self.format_str + self.reset
        elif record.levelno == logging.INFO:
            log_fmt = self.blue + self.format_str + self.reset
        elif record.levelno == logging.WARNING:
            log_fmt = self.yellow + self.format_str + self.reset
        elif record.levelno == logging.ERROR:
            log_fmt = self.red + self.format_str + self.reset
        elif record.levelno == logging.CRITICAL:
            log_fmt = self.bold_red + self.format_str + self.reset
        formatter = logging.Formatter(log_fmt, datefmt='%H:%M:%S')
        return formatter.format(record)

# Update handler to use colored formatter
console_handler = logging.StreamHandler()
console_handler.setFormatter(ColoredFormatter())
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
root_logger.handlers = [console_handler, logging.FileHandler(str(LOG_FILE))]

# Ensure specific engines also log clearly
logging.getLogger('flask_cors').setLevel(logging.INFO)


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

    print("\n" + "="*50)
    print("🚀 STARTING NYAYNETI BACKEND INTELLIGENCE SYSTEM")
    print("="*50 + "\n")
    ensure_dirs()
    settings = get_settings()

    # Initialize vector store and embedding model
    vector_store = None
    embedding_model = None
    
    try:
        logger.info(f"Initializing vector store from {settings.EMBEDDING_DIR}")
        vector_store = PersistentVectorStore(storage_path=settings.EMBEDDING_DIR)
        logger.info("✅ Vector store initialized")
    except Exception as e:
        logger.error(f"Failed to initialize vector store: {e}")

    # Lazy Loading Wrapper for Embedding Model
    class ModelManager:
        def __init__(self, settings):
            self.settings = settings
            self._model = None
        
        def get_model(self):
            if self._model is None:
                from sentence_transformers import SentenceTransformer
                logger.info(f"⏳ Lazy-loading embedding model: {self.settings.EMBEDDING_MODEL_PATH}...")
                self._model = SentenceTransformer(self.settings.EMBEDDING_MODEL_PATH)
                logger.info("✅ Embedding model loaded (Lazy)")
            return self._model

    model_manager = ModelManager(settings)

    # Keep existing LLM engine for compare-pdf functionality
    llm_engine = LLMEngine(
        model_name="deepseek-r1:1.5b",
        api_key=None,
        embedding_dir=settings.EMBEDDING_DIR,
        model_path=None, # DISABLED: Forcing Ollama (deepseek-r1:1.5b) for maximum speed
        embedding_model=settings.EMBEDDING_MODEL_PATH,
        context_length=settings.LLM_CONTEXT_LENGTH,
        n_threads=settings.LLM_THREADS,
        gpu_layers=settings.LLM_GPU_LAYERS,
        ollama_model="deepseek-r1:1.5b", # Reverted to available 1.5B model for stability
        vector_store=vector_store,
    )

    # Warm up the LLM engine for faster first response
    print("🔥 Warming up AI engine for faster responses...")
    try:
        # Pre-load models in background
        import threading
        def warmup_task():
            llm_engine._ensure_models_loaded()
            print("✅ AI engine warmed up!")
        warmup_thread = threading.Thread(target=warmup_task, daemon=True)
        warmup_thread.start()
    except Exception as e:
        logger.warning(f"Warmup failed: {e}")

    comparator = Comparator(llm_engine=llm_engine)
    drafter = get_document_drafter(llm_engine=llm_engine)
    analyzer = get_strength_analyzer(llm_engine=llm_engine)

    analyzer = get_strength_analyzer(llm_engine=llm_engine)

    # --- GLOBAL ERROR HANDLERS ---
    @app.errorhandler(Exception)
    def handle_exception(e):
        """Global exception handler for cleaner terminal logs"""
        import traceback
        # format error
        tb = traceback.format_exc()
        logger.error(f"🔥 CRITICAL SERVER ERROR: {str(e)}\n{tb}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

    @app.before_request
    def log_request_info():
        if request.path != "/api/health" and not request.path.startswith("/static"):
             logger.info(f"📨 [{request.method}] {request.path}")

    @app.after_request
    def log_response_info(response):
        if request.path != "/api/health" and not request.path.startswith("/static"):
             logger.info(f"📤 Status: {response.status_code}")
        return response

    # --- API ROUTES ---
    @app.route("/api/health")
    def health(): return jsonify({"status": "ready", "offline": True})

    @app.route("/api/status")
    def status():
        return jsonify({
            "status": "ok", 
            "model": {"ollama_available": True, "indexed_docs_count": len(llm_engine.get_indexed_documents()) if hasattr(llm_engine, 'get_indexed_documents') else 0}
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
                print(f"\n📤 [UPLOAD] Received file: {file.filename}")
                logger.info(f"📤 Upload started for: {file.filename}")
                
                # Step 1: Extract text
                print(f"📄 [UPLOAD] Step 1: Extracting text from PDF...")
                yield f"data: {json.dumps({'progress': 10, 'status': 'processing', 'message': 'Extracting text from PDF...'})}\n\n"
                time.sleep(0.1)
                text = extract_text_from_pdf(path)
                print(f"✅ [UPLOAD] Text extracted: {len(text)} characters")
                logger.info(f"✅ Text extracted: {len(text)} characters")
                
                # Step 2: Split into chunks with page info and extract citations
                print(f"🧠 [UPLOAD] Step 2: Processing structure & citations...")
                yield f"data: {json.dumps({'progress': 25, 'status': 'processing', 'message': 'Processing PDF structure and citations...'})}\n\n"
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
                # Lazy load here
                embedding_model = model_manager.get_model()
                
                if embedding_model is None:
                    raise Exception("Embedding model initialization failed")
                
                print(f"🧩 [UPLOAD] Step 3: Generating {len(chunks)} semantic embeddings...")
                
                embeddings = embedding_model.encode(
                    chunks,
                    show_progress_bar=False,
                    convert_to_numpy=True
                )
                logger.info(f"Generated embeddings: shape {embeddings.shape}")
                
                # Step 4: Add to vector store
                yield f"data: {json.dumps({'progress': 80, 'status': 'processing', 'message': 'Indexing into vector store...'})}\n\n"
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
                
                print(f"🎉 [UPLOAD] Success: '{file.filename}' is fully indexed and ready for AI analysis.")
                logger.info(f"Successfully indexed document: {result}")
                
                # Also index with llm_engine for backward compatibility
                llm_engine.index_document(doc_id=file.filename, text=text)
                
                # Step 5: Complete
                stats = vector_store.get_stats()
                completion_data = {
                    'progress': 100,
                    'status': 'completed',
                    'message': 'Complete!',
                    'success': True,
                    'filename': file.filename,
                    'chunks': len(chunks),
                    'total_documents': stats['total_documents'],
                    'data': {
                        'name': file.filename,
                        'total_chunks': len(chunks)
                    }
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
        logger.info(f"🚀 [API] Compare Request Received for '{selected_pdf}'")
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
            print(f"\n🎙️ [VOICE] ============ TRANSCRIPTION REQUEST ============")
            
            # Check if audio file is present
            if 'audio' not in request.files:
                logger.warning("🚫 [VOICE] No audio file in request")
                return jsonify({'error': 'No audio file provided'}), 400
            
            audio_file = request.files['audio']
            
            if audio_file.filename == '':
                logger.warning("🚫 [VOICE] Empty filename")
                return jsonify({'error': 'No file selected'}), 400
            
            # Get optional language parameter
            language = request.form.get('language', None)  # 'hi' or 'en' or None for auto-detect
            
            print(f"📥 [VOICE] Received audio: {audio_file.filename}")
            print(f"🌐 [VOICE] Language: {language or 'auto-detect'}")
            
            # Save uploaded file temporarily
            temp_dir = tempfile.gettempdir()
            temp_input_path = os.path.join(temp_dir, f"voice_input_{datetime.now().strftime('%Y%m%d_%H%M%S')}.webm")
            audio_file.save(temp_input_path)
            
            print(f"💾 [VOICE] Saved to: {temp_input_path}")
            
            # Validate file size
            is_valid, error_msg = validate_audio_file(temp_input_path)
            if not is_valid:
                cleanup_temp_file(temp_input_path)
                print(f"❌ [VOICE] Validation failed: {error_msg}")
                return jsonify({'error': error_msg}), 400
            
            print(f"✅ [VOICE] File validated")
            
            # Convert to WAV format (16kHz mono)
            temp_wav_path = os.path.join(temp_dir, f"voice_input_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav")
            success, result = convert_to_wav(temp_input_path, temp_wav_path)
            
            if not success:
                cleanup_temp_file(temp_input_path)
                print(f"❌ [VOICE] Conversion failed: {result}")
                return jsonify({'error': f'Audio conversion failed: {result}'}), 500
            
            wav_path = result
            print(f"🔄 [VOICE] Audio ready for Whisper")
            
            # Get audio duration
            duration = get_audio_duration(wav_path)
            
            # Transcribe using Whisper
            print(f"🤖 [VOICE] Starting Whisper transcription...")
            transcriber = get_transcriber()
            success, transcription_result = transcriber.transcribe(wav_path, language=language)
            
            # Cleanup temp files
            cleanup_temp_file(temp_input_path)
            cleanup_temp_file(wav_path)
            
            if not success:
                error = transcription_result.get('error', 'Unknown error')
                print(f"❌ [VOICE] Transcription failed: {error}")
                return jsonify({'error': error}), 500
            
            # Return transcription result
            response_data = {
                'text': transcription_result['text'],
                'language': transcription_result['language'],
                'duration': duration or transcription_result.get('duration', 0),
                'transcription_time': transcription_result['transcription_time']
            }
            
            if response_data['text'].strip():
                print(f"✅ [VOICE] SUCCESS! Transcribed: '{response_data['text'][:100]}'")
            else:
                print(f"⚠️ [VOICE] WARNING: Empty transcription (no speech detected)")
                print(f"   Duration: {response_data['duration']}s | Language: {response_data['language']}")
                print(f"   💡 TIP: Speak louder or closer to the microphone")
            
            print(f"🎙️ [VOICE] ============ REQUEST COMPLETE ============\n")
            return jsonify(response_data), 200
            
        except Exception as e:
            print(f"💥 [VOICE] ❌ CRITICAL ERROR: {e}")
            logger.error(f"[VOICE] Transcription endpoint error: {e}", exc_info=True)
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
        doc_chunks = [ch for ch in vector_store.documents if ch.doc_id == doc_id]
        
        if not doc_chunks:
            # Try reloading index if not found
            if hasattr(llm_engine, '_load_index'):
                chunks = llm_engine._load_index()
                # Determine if chunks are dicts or objects
                doc_chunks = []
                for ch in chunks:
                    c_id = ch.get('doc_id') if isinstance(ch, dict) else ch.doc_id
                    if c_id == doc_id:
                        doc_chunks.append(ch)

                if doc_chunks:
                    text = "\n".join([ch.get('text') if isinstance(ch, dict) else ch.text for ch in doc_chunks])
                else:
                    return jsonify({"error": "Document not found"}), 404
            else:
                return jsonify({"error": "Document not found"}), 404
        else:
            text = "\n".join([ch.text for ch in doc_chunks])

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

        if vector_store is None:
            return jsonify({'error': 'Vector store not available'}), 500
        
        if doc_id:
            # Find document text from vector store chunks
            doc_chunks = [d for d in vector_store.documents if d.doc_id == doc_id]
            if not doc_chunks:
                return jsonify({"error": "Document not found"}), 404
            text = "\n".join([d.text for d in doc_chunks])
        
        if not text:
            return jsonify({"error": "Text or doc_id required"}), 400
            
        result = analyzer.analyze_document(text)
        return jsonify(result)

    @app.route("/api/search-citations-old", methods=["POST"])
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
            # Handle both dict (legacy) and DocumentChunk object
            d_id = doc.doc_id if hasattr(doc, 'doc_id') else doc.get('doc_id')
            
            if d_id not in doc_ids:
                # Reconstruct full text for this doc
                doc_chunks = [d for d in vector_store.documents if (d.doc_id if hasattr(d, 'doc_id') else d.get('doc_id')) == d_id]
                full_text = "\n".join([d.text if hasattr(d, 'text') else d.get('text') for d in doc_chunks])
                
                # Create a dict representation for citation extractor
                all_docs.append({'doc_id': d_id, 'text': full_text})
                doc_ids.add(d_id)
                
        results = citation_extractor.search_documents_by_citation(all_docs, citation, citation_type)
        return jsonify({"results": results})

    @app.route("/api/search-citations-old2", methods=["POST"])
    def search_citations():
        """Search across all documents for specific citations with optional AI analysis"""
        data = request.json
        search_term = data.get("term", "").strip()
        use_ai = data.get("use_ai", False)
        
        if not search_term:
            return jsonify({"results": []})
        
        results = []
        documents = vector_store.list_documents() if vector_store else llm_engine.get_indexed_documents()
        
        for doc in documents:
            doc_id = doc.get('doc_id') or doc.get('filename')
            if not doc_id:
                continue
                
            # Get document text
            if vector_store:
                doc_chunks = [d for d in vector_store.documents if d.doc_id == doc_id]
                if not doc_chunks:
                    continue
                full_text = "\n".join([d.text for d in doc_chunks])
            else:
                # Fallback to llm_engine method
                continue
                
            # Extract comprehensive citations (with caching)
            doc_citations = citation_extractor.extract_all_citations_comprehensive(full_text, doc_id=doc_id)
            
            # Check if search term exists and count occurrences
            found_count = doc_citations.get('counts', {}).get(search_term, 0)
            if found_count > 0:
                result_item = {
                    'doc_id': doc_id,
                    'filename': doc.get('filename', doc_id),
                    'mentions': found_count,
                    'type': citation_extractor.classify_citation_type(search_term),
                    'citation_details': {
                        'case_names': doc_citations['case_names'][:3],
                        'articles': doc_citations['articles'][:3],
                        'sections': doc_citations['ipc_sections'] + doc_citations['crpc_sections']
                    }
                }
                
                # Add AI analysis if requested
                if use_ai:
                    try:
                        # Get context around the citation
                        context_matches = []
                        for match in re.finditer(re.escape(search_term), full_text, re.IGNORECASE):
                            start = max(0, match.start() - 300)
                            end = min(len(full_text), match.end() + 300)
                            context_matches.append(full_text[start:end])
                        
                        if context_matches:
                            context = context_matches[0]  # Use first occurrence context
                            
                            # Create AI prompt
                            ai_prompt = f"""<system>You are a legal expert analyzing Indian law documents.</system>

Document: {doc.get('filename', doc_id)}
Search Term: "{search_term}"
Context: {context}

Provide a concise 2-3 sentence analysis of the legal significance of "{search_term}" in this specific document. Focus on:
1. How this citation is applied in the case
2. Its legal implications or interpretation
3. Any notable judicial observations

Keep response under 100 words."""

                            # Get AI response
                            ai_response = llm_engine._call_llm(ai_prompt, max_tokens=200, stream=False)
                            result_item['ai_analysis'] = ai_response.strip()
                    except Exception as e:
                        logger.warning(f"AI analysis failed for {doc_id}: {e}")
                        result_item['ai_analysis'] = "AI analysis unavailable"
                
                results.append(result_item)
        
        # Sort by mentions (descending)
        results.sort(key=lambda x: x['mentions'], reverse=True)
        
        return jsonify({"results": results, "total_found": len(results)})

    @app.route("/api/citations/<doc_id>", methods=["GET"])
    def get_doc_citations(doc_id):
        """Get all citations for a specific document"""
        if vector_store is None:
            return jsonify({'error': 'Vector store not available'}), 500

        # Helper to get doc_id from chunk (handles both object and dict)
        def get_chunk_doc_id(chunk):
            if hasattr(chunk, 'doc_id'): return chunk.doc_id
            if isinstance(chunk, dict): return chunk.get('doc_id')
            return None

        # Case-insensitive matching + extension stripping check
        doc_id_clean = doc_id.lower()
        doc_chunks = [d for d in vector_store.documents if (get_chunk_doc_id(d) or "").lower() == doc_id_clean]
        
        # If not found, try stripping .pdf if doc_id has it
        if not doc_chunks and doc_id_clean.endswith('.pdf'):
            doc_id_clean = doc_id_clean[:-4]
            doc_chunks = [d for d in vector_store.documents if (get_chunk_doc_id(d) or "").lower() == doc_id_clean]

        if not doc_chunks:
            logger.warning(f"Citations requested for unknown doc_id: {doc_id}")
            return jsonify({"error": f"Document '{doc_id}' not found in index"}), 404
            
        full_text = "\n".join([d.text if hasattr(d, 'text') else d.get('text', '') for d in doc_chunks])
        
        if not full_text.strip():
            return jsonify({"citations": {}, "counts": {"total": 0}}), 200
            
        try:
            citations = citation_extractor.extract_all_citations(full_text)
            counts = citation_extractor.count_citations(full_text)
            return jsonify({"citations": citations, "counts": counts})
        except Exception as e:
            logger.error(f"Citation extraction failed: {e}")
            return jsonify({"error": "Failed to extract citations", "details": str(e)}), 500

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

    @app.route("/api/search-citations", methods=["POST"])
    def api_search_citations_endpoint():
        """
        Search for citations across all indexed documents.
        Supports both keyword and AI-powered semantic search.
        """
        try:
            data = request.json
            term = data.get('term', '').strip()
            use_ai = data.get('use_ai', False)
            
            if not term:
                return jsonify({'error': 'No search term provided'}), 400
            
            print(f"\n🔍 [CITATION] ============ CITATION SEARCH ============")
            print(f"📝 [CITATION] Term: '{term}'")
            print(f"🤖 [CITATION] Mode: {'AI Semantic' if use_ai else 'Keyword'}")
            
            # Search using vector store
            results = vector_store.search_citations(term, use_ai=use_ai, top_k=20)
            
            # Enrich results with document metadata
            enriched_results = []
            for result in results:
                doc_id = result['doc_id']
                doc_info = vector_store.doc_id_to_indices.get(doc_id, {})
                metadata = doc_info.get('metadata', {})
                
                enriched_results.append({
                    'doc_id': doc_id,
                    'filename': metadata.get('filename', doc_id),
                    'text': result['text'],
                    'relevance': result['relevance'],
                    'type': result['type'],
                    'chunk_id': result.get('chunk_id', 0),
                    'count': result.get('count', 1)
                })
            
            print(f"✅ [CITATION] Found {len(enriched_results)} results")
            print(f"🔍 [CITATION] ============ SEARCH COMPLETE ============\n")
            
            return jsonify({
                'results': enriched_results,
                'total': len(enriched_results),
                'search_term': term,
                'mode': 'ai' if use_ai else 'keyword'
            }), 200
            
        except Exception as e:
            print(f"❌ [CITATION] Search failed: {e}")
            logger.error(f"Citation search error: {e}", exc_info=True)
            return jsonify({'error': f'Search failed: {str(e)}'}), 500

    # --- STANDALONE CITATION FINDER ENDPOINTS ---
    
    @app.route("/api/citation-finder/upload", methods=["POST"])
    def upload_for_citation_finder():
        """Standalone citation finder - upload PDF for citation analysis"""
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if not file.filename or not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Invalid PDF file"}), 400
            
        try:
            # Save temporarily
            temp_path = os.path.join(settings.UPLOAD_DIR, f"temp_{file.filename}")
            file.save(temp_path)
            
            # Extract text
            text = extract_text_from_pdf(temp_path)
            
            # Extract citations with AI analysis
            citations = citation_extractor.extract_all_citations_comprehensive(text)
            
            # Get AI-powered citation summary
            ai_prompt = f"""<system>You are a legal expert specializing in Indian law citations.</system>

Analyze this legal document and provide a comprehensive citation summary:

Document Type: {file.filename}
Total Citations Found: {sum(len(v) for v in [citations['case_names'], citations['ipc_sections'], citations['crpc_sections'], citations['articles'], citations['acts']] if isinstance(v, list))}

Key Citations:
- Case Law: {', '.join(citations['case_names'][:5]) if citations['case_names'] else 'None'}
- IPC Sections: {', '.join(citations['ipc_sections'][:5]) if citations['ipc_sections'] else 'None'}
- CrPC Sections: {', '.join(citations['crpc_sections'][:5]) if citations['crpc_sections'] else 'None'}
- Constitutional Articles: {', '.join(citations['articles'][:5]) if citations['articles'] else 'None'}

Provide a 3-4 sentence analysis covering:
1. Most significant citations and their legal importance
2. Primary legal themes addressed
3. Key judicial precedents referenced
4. Overall citation strength of the document

Keep response concise and focused."""

            ai_summary = llm_engine._call_llm(ai_prompt, max_tokens=300, stream=False)
            
            # Clean up temp file
            os.remove(temp_path)
            
            return jsonify({
                "success": True,
                "filename": file.filename,
                "citations": citations,
                "ai_summary": ai_summary.strip(),
                "stats": {
                    "total_citations": sum(len(v) for v in [citations['case_names'], citations['ipc_sections'], citations['crpc_sections'], citations['articles'], citations['acts']] if isinstance(v, list)),
                    "case_law": len(citations['case_names']),
                    "ipc_sections": len(citations['ipc_sections']),
                    "crpc_sections": len(citations['crpc_sections']),
                    "articles": len(citations['articles']),
                    "acts": len(citations['acts'])
                }
            })
            
        except Exception as e:
            logger.error(f"Citation finder upload failed: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route("/api/citation-finder/analyze-text", methods=["POST"])
    def analyze_citation_text():
        """Analyze citations in provided text with AI"""
        data = request.json
        text = data.get("text", "")
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
            
        try:
            # Extract citations
            citations = citation_extractor.extract_all_citations_comprehensive(text)
            
            # AI analysis
            ai_prompt = f"""<system>You are a legal citation analyst.</system>

Analyze these legal citations and their context:

Citations Found:
- Cases: {', '.join(citations['case_names'][:10]) if citations['case_names'] else 'None'}
- IPC: {', '.join(citations['ipc_sections'][:10]) if citations['ipc_sections'] else 'None'}
- CrPC: {', '.join(citations['crpc_sections'][:10]) if citations['crpc_sections'] else 'None'}
- Articles: {', '.join(citations['articles'][:10]) if citations['articles'] else 'None'}
- Acts: {', '.join(citations['acts'][:10]) if citations['acts'] else 'None'}

Context: {text[:1000]}...

Provide a focused 2-3 sentence analysis of:
1. Most impactful citations
2. Legal domains covered
3. Citation quality and relevance

Be concise and specific."""

            ai_analysis = llm_engine._call_llm(ai_prompt, max_tokens=250, stream=False)
            
            return jsonify({
                "citations": citations,
                "ai_analysis": ai_analysis.strip(),
                "citation_count": sum(len(v) for v in [citations['case_names'], citations['ipc_sections'], citations['crpc_sections'], citations['articles'], citations['acts']] if isinstance(v, list))
            })
            
        except Exception as e:
            logger.error(f"Text citation analysis failed: {e}")
            return jsonify({"error": str(e)}), 500

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
