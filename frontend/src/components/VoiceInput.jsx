import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

/**
 * VoiceInput Component
 * Provides voice recording functionality with MediaRecorder API
 * Sends audio to backend for Whisper transcription
 */
const VoiceInput = ({ onTranscription, language = null }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    // Check browser support
    const isSupported = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        if (!isSupported) {
            setError('Your browser does not support audio recording / आपका ब्राउज़र ऑडियो रिकॉर्डिंग का समर्थन नहीं करता');
            return;
        }

        try {
            setError(null);
            console.log('[VOICE] Requesting microphone permission...');

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            console.log('[VOICE] Microphone permission granted');

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('[VOICE] Recording stopped');

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Create audio blob
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                console.log(`[VOICE] Audio blob created: ${(audioBlob.size / 1024).toFixed(1)}KB`);

                // Send to backend for transcription
                await transcribeAudio(audioBlob);
            };

            // Start recording
            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            console.log('[VOICE] Recording started');

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('[VOICE] Error starting recording:', err);

            if (err.name === 'NotAllowedError') {
                setError('Microphone permission denied / माइक्रोफ़ोन अनुमति अस्वीकृत');
            } else {
                setError('Failed to start recording / रिकॉर्डिंग शुरू करने में विफल');
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const transcribeAudio = async (audioBlob) => {
        setIsProcessing(true);
        setError(null);

        try {
            console.log('[VOICE] Sending audio to backend for transcription...');

            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            if (language) {
                formData.append('language', language);
            }

            const response = await fetch('http://localhost:8000/api/transcribe', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                const msg = errorData.details ? `${errorData.error}: ${errorData.details}` : (errorData.error || 'Transcription failed');
                throw new Error(msg);
            }

            const data = await response.json();

            console.log('[VOICE] Transcription successful:', data);
            console.log(`[VOICE] Text: ${data.text}`);
            console.log(`[VOICE] Language: ${data.language}`);
            console.log(`[VOICE] Duration: ${data.duration}s`);
            console.log(`[VOICE] Transcription time: ${data.transcription_time}s`);

            // Call parent callback with transcribed text
            if (onTranscription) {
                onTranscription(data.text, data);
            }

        } catch (err) {
            console.error('[VOICE] Transcription error:', err);
            setError(`Transcription failed: ${err.message} / प्रतिलेखन विफल`);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isSupported) {
        return null; // Hide button if not supported
    }

    return (
        <div className="voice-input-container">
            {/* Mic Button */}
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`voice-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
                {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                    <Square className="w-5 h-5" />
                ) : (
                    <Mic className="w-5 h-5" />
                )}
            </button>

            {/* Recording Indicator */}
            {isRecording && (
                <div className="recording-indicator">
                    <div className="pulse-dot" />
                    <span className="recording-time">{formatTime(recordingTime)}</span>
                </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
                <div className="processing-indicator">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transcribing...</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="voice-error">
                    {error}
                </div>
            )}

            <style>{`
        .voice-input-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .voice-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          border: 2px solid #FF9933;
          background: transparent;
          color: #FF9933;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .voice-button:hover:not(:disabled) {
          background: #FF9933;
          color: white;
          transform: scale(1.05);
        }
        
        .voice-button.recording {
          background: #ef4444;
          border-color: #ef4444;
          color: white;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .voice-button.processing {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .voice-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }
        
        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          animation: pulse-dot 1s ease-in-out infinite;
        }
        
        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        
        .processing-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #FF9933;
          font-size: 0.875rem;
        }
        
        .voice-error {
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

export default VoiceInput;
