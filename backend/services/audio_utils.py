"""
Audio utilities for format conversion and validation.
Handles conversion of various audio formats to WAV 16kHz mono for Whisper.
"""

import os
import logging
from pathlib import Path
from typing import Tuple, Optional

logger = logging.getLogger(__name__)

# Maximum audio file size (10MB)
MAX_AUDIO_SIZE_MB = 10
MAX_AUDIO_SIZE_BYTES = MAX_AUDIO_SIZE_MB * 1024 * 1024


def validate_audio_file(file_path: str) -> Tuple[bool, Optional[str]]:
    """
    Validate audio file size and existence.
    
    Args:
        file_path: Path to audio file
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        if not os.path.exists(file_path):
            return False, f"File not found: {file_path}"
        
        file_size = os.path.getsize(file_path)
        
        if file_size == 0:
            return False, "Audio file is empty"
        
        if file_size > MAX_AUDIO_SIZE_BYTES:
            size_mb = file_size / (1024 * 1024)
            return False, f"Audio file too large: {size_mb:.1f}MB (max {MAX_AUDIO_SIZE_MB}MB)"
        
        logger.info(f"Audio file validated: {file_size / 1024:.1f}KB")
        return True, None
        
    except Exception as e:
        logger.error(f"Error validating audio file: {e}", exc_info=True)
        return False, f"Validation error: {str(e)}"


def convert_to_wav(input_path: str, output_path: Optional[str] = None) -> Tuple[bool, str]:
    """
    Convert audio file to WAV format (16kHz mono) for Whisper.
    Note: Whisper's faster-whisper can handle WebM directly, so we just validate and return.
    
    Args:
        input_path: Path to input audio file
        output_path: Optional output path (not used, kept for API compatibility)
        
    Returns:
        Tuple of (success, output_path_or_error_message)
    """
    try:
        # Whisper's faster-whisper can handle WebM, MP3, WAV, etc. directly
        # No conversion needed - just return the input path
        logger.info(f"Audio file ready for Whisper: {input_path}")
        
        # Get duration if possible
        import os
        file_size = os.path.getsize(input_path)
        logger.info(f"Audio file size: {file_size / 1024:.1f}KB")
        
        return True, input_path
        
    except Exception as e:
        error_msg = f"Audio validation failed: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return False, error_msg


def get_audio_duration(file_path: str) -> Optional[float]:
    """
    Get audio file duration in seconds.
    Note: Returns None since we skip conversion. Whisper will provide duration.
    
    Args:
        file_path: Path to audio file
        
    Returns:
        Duration in seconds, or None
    """
    # Duration will be provided by Whisper after transcription
    return None


def cleanup_temp_file(file_path: str) -> None:
    """
    Safely delete temporary audio file.
    
    Args:
        file_path: Path to file to delete
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up temp file: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to cleanup temp file {file_path}: {e}")
