import os
import logging
import time
import uuid
from pathlib import Path
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

class Pyttsx3TTS:
    """
    Offline Text-to-Speech using system native voices (SAPI5/nsss/espeak).
    Replaces Piper for better compatibility and valid offline support.
    """
    
    def __init__(self):
        self._engine = None

    def synthesize(self, text: str, lang: str = "en", output_path: str = None) -> Tuple[bool, str]:
        """
        Synthesize text to a WAV file.
        """
        try:
            import pyttsx3
            import pythoncom
            # CRITICAL: Initialize COM for the current thread (Flask uses threads)
            pythoncom.CoInitialize()
            
            engine = pyttsx3.init()
            engine.setProperty('rate', 170) # Optimal legal reading speed
            engine.setProperty('volume', 1.0)

            if not output_path:
                import tempfile
                temp_dir = tempfile.gettempdir()
                output_path = os.path.join(temp_dir, f"tts_{uuid.uuid4().hex}.wav")

            logger.info(f"[VOICE] Synthesizing: {text[:30]}...")
            
            # Select voice based on lang
            voices = engine.getProperty('voices')
            # Try to find a matching voice
            selected_voice = None
            if lang == 'hi':
                # detailed search for Hindi
                for v in voices:
                    if 'hindi' in v.name.lower() or 'hi-in' in v.id.lower():
                        selected_voice = v.id
                        break
            
            if not selected_voice and voices:
                 # Default to first available if language not found
                 selected_voice = voices[0].id
                 
            if selected_voice:
                engine.setProperty('voice', selected_voice)

            # Saving to file
            logger.info(f"[VOICE] Saving audio to: {output_path}")
            engine.save_to_file(text, output_path)
            engine.runAndWait()
            
            # small delay to ensure file handle is released/flushed
            time.sleep(0.5)
            
            if os.path.exists(output_path):
                f_size = os.path.getsize(output_path)
                logger.info(f"[VOICE] TTS complete: {output_path} (Size: {f_size} bytes)")
                if f_size > 44: # WAV header is 44 bytes. Anything larger means actual audio.
                    return True, output_path
                else:
                    return False, f"File generated but empty ({f_size} bytes)"
            else:
                logger.error(f"[VOICE] File NOT found after synthesis: {output_path}")
                return False, "File generation failed - file not found"

        except Exception as e:
            logger.error(f"[VOICE] TTS failed: {e}", exc_info=True)
            return False, f"Exception during synthesis: {str(e)}"

# Singleton
_tts_engine = None

def get_tts_engine():
    global _tts_engine
    if _tts_engine is None:
        _tts_engine = Pyttsx3TTS()
    return _tts_engine
