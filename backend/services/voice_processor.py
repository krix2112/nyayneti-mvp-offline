"""
Voice processing service using faster-whisper for offline speech-to-text.
Supports Hindi and English transcription with automatic model downloading.
"""

import os
import time
import logging
from typing import Dict, Optional, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)


class WhisperTranscriber:
    """
    Offline speech-to-text transcriber using faster-whisper.
    Automatically downloads and caches the Whisper model on first use.
    """
    
    def __init__(self, model_size: str = "base", device: str = "cpu"):
        """
        Initialize Whisper transcriber.
        
        Args:
            model_size: Whisper model size (tiny, base, small, medium, large)
            device: Device to run on (cpu or cuda)
        """
        self.model_size = model_size
        self.device = device
        self.model = None
        self._model_loaded = False
        
        logger.info(f"WhisperTranscriber initialized: model={model_size}, device={device}")
    
    def _load_model(self) -> bool:
        """
        Load the Whisper model (lazy loading).
        Downloads model on first use (~140MB for base model).
        
        Returns:
            True if model loaded successfully
        """
        if self._model_loaded:
            return True
        
        try:
            from faster_whisper import WhisperModel
            
            logger.info(f"Loading Whisper model '{self.model_size}'...")
            start_time = time.time()
            
            # Model will be downloaded to ~/.cache/huggingface/hub/
            self.model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type="int8"  # Quantized for faster inference
            )
            
            load_time = time.time() - start_time
            logger.info(f"✅ Whisper model loaded in {load_time:.1f}s")
            
            self._model_loaded = True
            return True
            
        except ImportError:
            logger.error("faster-whisper not installed. Run: pip install faster-whisper")
            return False
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}", exc_info=True)
            return False
    
    def transcribe(
        self,
        audio_path: str,
        language: Optional[str] = None
    ) -> Tuple[bool, Dict]:
        """
        Transcribe audio file to text.
        
        Args:
            audio_path: Path to audio file (WAV format, 16kHz mono recommended)
            language: Language code ('hi' for Hindi, 'en' for English, None for auto-detect)
            
        Returns:
            Tuple of (success, result_dict)
            result_dict contains: {
                'text': str,
                'language': str,
                'duration': float,
                'transcription_time': float
            }
        """
        # Load model if not already loaded
        if not self._load_model():
            return False, {'error': 'Failed to load Whisper model'}
        
        try:
            logger.info(f"[VOICE] Transcribing audio: {audio_path}")
            logger.info(f"[VOICE] Language: {language or 'auto-detect'}")
            
            start_time = time.time()
            
            # Transcribe with faster-whisper
            segments, info = self.model.transcribe(
                audio_path,
                language=language,
                beam_size=5,
                vad_filter=True,  # Voice activity detection
                vad_parameters=dict(min_silence_duration_ms=500)
            )
            
            # Combine all segments into full text
            full_text = " ".join([segment.text for segment in segments])
            
            transcription_time = time.time() - start_time
            
            # Get detected language
            detected_language = info.language if hasattr(info, 'language') else (language or 'unknown')
            
            result = {
                'text': full_text.strip(),
                'language': detected_language,
                'duration': info.duration if hasattr(info, 'duration') else 0.0,
                'transcription_time': round(transcription_time, 2)
            }
            
            logger.info(f"[VOICE] ✅ Transcription complete in {transcription_time:.2f}s")
            logger.info(f"[VOICE] Detected language: {detected_language}")
            logger.info(f"[VOICE] Transcribed text: {result['text'][:100]}...")
            
            return True, result
            
        except Exception as e:
            error_msg = f"Transcription failed: {str(e)}"
            logger.error(f"[VOICE] ❌ {error_msg}", exc_info=True)
            return False, {'error': error_msg}
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded."""
        return self._model_loaded
    
    def get_model_info(self) -> Dict:
        """Get information about the current model."""
        return {
            'model_size': self.model_size,
            'device': self.device,
            'loaded': self._model_loaded
        }


# Global transcriber instance (singleton)
_transcriber_instance: Optional[WhisperTranscriber] = None


def get_transcriber() -> WhisperTranscriber:
    """
    Get or create the global Whisper transcriber instance.
    
    Returns:
        WhisperTranscriber instance
    """
    global _transcriber_instance
    
    if _transcriber_instance is None:
        _transcriber_instance = WhisperTranscriber(model_size="base", device="cpu")
    
    return _transcriber_instance
