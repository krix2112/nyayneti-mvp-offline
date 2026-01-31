import os
import logging
import json
import time
import requests
from pathlib import Path
from typing import Optional, Tuple
import wave
import numpy as np

logger = logging.getLogger(__name__)

class PiperTTS:
    """
    Offline Neural Text-to-Speech using Piper (ONNX).
    Supports high-quality English and Hindi voices.
    """
    
    VOICES = {
        "en": {
            "model_url": "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/amy/low/en_US-amy-low.onnx",
            "config_url": "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/amy/low/en_US-amy-low.onnx.json",
            "filename": "en_US-amy-low.onnx"
        },
        "hi": {
            "model_url": "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/hi/hi_IN/gajendra/medium/hi_IN-gajendra-medium.onnx",
            "config_url": "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/hi/hi_IN/gajendra/medium/hi_IN-gajendra-medium.onnx.json",
            "filename": "hi_IN-gajendra-medium.onnx"
        }
    }

    def __init__(self, models_dir: str = "models/tts"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.voices = {} # Cache for loaded PiperVoice objects
        self._piper_module = None

    def _get_piper(self):
        """Lazy load piper module"""
        if self._piper_module is None:
            try:
                from piper.voice import PiperVoice
                self._piper_module = PiperVoice
            except ImportError:
                logger.error("piper-tts not installed")
                return None
        return self._piper_module

    def _ensure_model(self, lang: str) -> Tuple[bool, Optional[str]]:
        """Download model and config if not present"""
        if lang not in self.VOICES:
            return False, f"Unsupported language: {lang}"
        
        v_info = self.VOICES[lang]
        model_path = self.models_dir / v_info["filename"]
        config_path = self.models_dir / f"{v_info['filename']}.json"
        
        if not model_path.exists() or not config_path.exists():
            logger.info(f"[VOICE] Downloading Piper model for {lang}...")
            try:
                # Download model
                r = requests.get(v_info["model_url"], stream=True)
                with open(model_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                # Download config
                r = requests.get(v_info["config_url"])
                with open(config_path, 'wb') as f:
                    f.write(r.content)
                
                logger.info(f"[VOICE] Downloaded Piper model: {v_info['filename']}")
            except Exception as e:
                logger.error(f"[VOICE] Failed to download Piper model: {e}")
                return False, str(e)
                
        return True, str(model_path)

    def synthesize(self, text: str, lang: str = "en", output_path: str = None) -> Tuple[bool, str]:
        """
        Synthesize text to a WAV file.
        """
        piper_class = self._get_piper()
        if not piper_class:
            return False, "Piper module not available"

        success, model_path_or_err = self._ensure_model(lang)
        if not success:
            return False, model_path_or_err

        model_path = model_path_or_err
        config_path = f"{model_path}.json"

        try:
            if lang not in self.voices:
                logger.info(f"[VOICE] Loading Piper voice: {lang}")
                self.voices[lang] = piper_class.load(model_path, config_path=config_path, use_cuda=False)
            
            voice = self.voices[lang]
            
            if not output_path:
                import tempfile
                from datetime import datetime
                temp_dir = tempfile.gettempdir()
                output_path = os.path.join(temp_dir, f"tts_output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav")

            start_time = time.time()
            with wave.open(output_path, "wb") as wav_file:
                voice.synthesize(text, wav_file)
            
            logger.info(f"[VOICE] TTS synth complete in {time.time() - start_time:.2f}s: {output_path}")
            return True, output_path

        except Exception as e:
            logger.error(f"[VOICE] TTS synthesis failed: {e}", exc_info=True)
            return False, str(e)

# Singleton instance
_tts_engine = None

def get_tts_engine():
    global _tts_engine
    if _tts_engine is None:
        # Resolve path relative to backend root
        backend_root = Path(__file__).parent.parent
        models_dir = backend_root / "models" / "tts"
        _tts_engine = PiperTTS(models_dir=str(models_dir))
    return _tts_engine
