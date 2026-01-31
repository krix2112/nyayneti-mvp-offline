import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

/**
 * VoiceOutput Component
 * Provides text-to-speech functionality using Web Speech Synthesis API
 * Supports Hindi and English with auto-detection
 */
const VoiceOutput = ({ text, language = null }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const detectLanguage = (text) => {
    // Simple language detection based on character ranges
    const hindiPattern = /[\u0900-\u097F]/;
    return hindiPattern.test(text) ? 'hi' : 'en';
  };

  const speak = async () => {
    try {
      setError(null);
      setLoading(true);

      // Stop any existing audio
      if (audio) {
        audio.pause();
      }

      const lang = language || detectLanguage(text);
      const encodedText = encodeURIComponent(text);
      const ttsUrl = `http://localhost:8000/api/tts?text=${encodedText}&lang=${lang}`;

      console.log(`[TTS] Requesting neural audio: ${lang}`);

      const newAudio = new Audio(ttsUrl);

      newAudio.onplay = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setLoading(false);
      };

      newAudio.onpause = () => {
        setIsPaused(true);
      };

      newAudio.onended = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      newAudio.onerror = (e) => {
        console.error('[TTS] Audio error:', e);
        setError('Failed to load neural voice / तंत्रिका आवाज लोड करने में विफल');
        setLoading(false);
        setIsSpeaking(false);
      };

      setAudio(newAudio);
      await newAudio.play();

    } catch (err) {
      console.error('[TTS] Error:', err);
      setError('Failed to start speech / वाचन शुरू करने में विफल');
      setLoading(false);
    }
  };

  const pause = () => {
    if (audio && !audio.paused) {
      audio.pause();
    }
  };

  const resume = () => {
    if (audio && audio.paused) {
      audio.play();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  if (!text) {
    return null;
  }

  return (
    <div className="voice-output-container">
      {!isSpeaking ? (
        <button
          onClick={speak}
          disabled={loading}
          className={`voice-output-button ${loading ? 'loading' : ''}`}
          title="Listen to response / प्रतिक्रिया सुनें"
        >
          {loading ? (
            <div className="loader-small"></div>
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
          <span>{loading ? 'Processing...' : 'Listen'}</span>
        </button>
      ) : (
        <div className="voice-controls">
          {!isPaused ? (
            <button
              onClick={pause}
              className="voice-control-button"
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={resume}
              className="voice-control-button"
              title="Resume"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={stop}
            className="voice-control-button stop"
            title="Stop"
          >
            <VolumeX className="w-4 h-4" />
          </button>

          {/* Sound wave animation */}
          <div className="sound-wave">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="voice-output-error">
          {error}
        </div>
      )}

      <style>{`
        .voice-output-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .voice-output-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #FF9933;
          background: transparent;
          color: #FF9933;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .voice-output-button:hover:not(:disabled) {
          background: #FF9933;
          color: white;
        }

        .voice-output-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          border-color: #cbd5e1;
          color: #94a3b8;
        }

        .loader-small {
          width: 12px;
          height: 12px;
          border: 2px solid #FF9933;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .voice-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .voice-control-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          border: 1px solid #FF9933;
          background: transparent;
          color: #FF9933;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .voice-control-button:hover {
          background: #FF9933;
          color: white;
        }
        
        .voice-control-button.stop {
          border-color: #ef4444;
          color: #ef4444;
        }
        
        .voice-control-button.stop:hover {
          background: #ef4444;
          color: white;
        }
        
        .sound-wave {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 1.5rem;
          margin-left: 0.5rem;
        }
        
        .wave-bar {
          width: 3px;
          background: #FF9933;
          border-radius: 2px;
          animation: wave 1s ease-in-out infinite;
        }
        
        .wave-bar:nth-child(1) {
          animation-delay: 0s;
        }
        
        .wave-bar:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .wave-bar:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes wave {
          0%, 100% {
            height: 8px;
          }
          50% {
            height: 20px;
          }
        }
        
        .voice-output-error {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #fee2e2;
          border: 1px solid #ef4444;
          border-radius: 0.375rem;
          color: #991b1b;
          font-size: 0.75rem;
          white-space: nowrap;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default VoiceOutput;
