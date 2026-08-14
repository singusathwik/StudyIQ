import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hybrid Voice Speech Recognition & Real-time Reactive Waveform Hook
 * Features live AudioContext AnalyserNode frequency extraction so bars move directly to the user's voice,
 * combined with Web Speech API and Groq Whisper / Gemini AI transcription.
 */
export function useSpeechRecognition(options = {}) {
  const isContinuousOption = options && options.continuous === true;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState(null);
  const [audioLevels, setAudioLevels] = useState([18, 28, 42, 28, 18]); // Real-time frequency levels (0-100)

  const SpeechRecognition = typeof window !== 'undefined' && (
    window.SpeechRecognition || window.webkitSpeechRecognition
  );
  const isSupported = !!SpeechRecognition || (typeof window !== 'undefined' && !!navigator.mediaDevices);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isContinuousRef = useRef(isContinuousOption);
  const accumulatedTextRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);
  
  // Real-time AudioContext frequency analyser refs
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    isContinuousRef.current = isContinuousOption;
  }, [isContinuousOption]);

  const cleanupAudioAnalyser = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevels([18, 28, 42, 28, 18]);
  }, []);

  const setupAudioAnalyser = useCallback((stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.65;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateWaveform = () => {
        if (!isListeningRef.current || !analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Group into 5 dynamic frequency bands (Bass -> Mid -> Treble)
        const bands = 5;
        const binStep = Math.max(1, Math.floor(bufferLength / bands));
        const levels = [];

        for (let i = 0; i < bands; i++) {
          let sum = 0;
          for (let j = 0; j < binStep; j++) {
            sum += dataArray[i * binStep + j] || 0;
          }
          const avg = sum / binStep;
          // Scale dynamically from 15% (idle) to 100% based on speech amplitude
          const scaled = Math.min(100, Math.max(18, Math.round((avg / 255) * 110 * 1.6)));
          levels.push(scaled);
        }

        setAudioLevels(levels);
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };

      updateWaveform();
    } catch (e) {
      console.warn("AudioContext Analyser not available:", e);
    }
  }, []);

  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  const createAndStartRecognition = useCallback(() => {
    if (!SpeechRecognition) return;

    cleanupRecognition();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {};

      recognition.onresult = (event) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalChunk += item[0].transcript + ' ';
          } else {
            interimChunk += item[0].transcript;
          }
        }

        if (finalChunk) {
          accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + finalChunk)
            .replace(/\s+/g, ' ')
            .trim();
          setTranscript(accumulatedTextRef.current);
        }

        setInterimTranscript(interimChunk);
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError("Microphone permission was denied. Please allow microphone access in your browser.");
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current && isContinuousRef.current) {
          setTimeout(() => {
            if (isListeningRef.current) {
              createAndStartRecognition();
            }
          }, 200);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (err) {
      console.warn("Native speech recognition fallback:", err);
    }
  }, [SpeechRecognition, cleanupRecognition]);

  const startListening = useCallback(async () => {
    setError(null);
    setInterimTranscript('');
    isListeningRef.current = true;
    setIsListening(true);
    audioChunksRef.current = [];

    // 1. Capture Mic MediaStream and attach live Audio Analyser
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Setup real-time reactive audio frequency analyzer
        setupAudioAnalyser(stream);

        let mimeType = 'audio/webm';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          }
          const mediaRecorder = new MediaRecorder(stream, { mimeType });
          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          mediaRecorder.start(250);
          mediaRecorderRef.current = mediaRecorder;
        }
      }
    } catch (permErr) {
      console.warn("Microphone access error:", permErr);
      if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
        setError("Microphone access was blocked. Please enable microphone permissions in your browser address bar.");
        isListeningRef.current = false;
        setIsListening(false);
        return;
      }
    }

    // 2. Start Web Speech API for real-time live preview
    createAndStartRecognition();
  }, [createAndStartRecognition, setupAudioAnalyser]);

  const stopListening = useCallback(async () => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterimTranscript('');
    cleanupRecognition();
    cleanupAudioAnalyser();

    let recordedBlob = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        const mr = mediaRecorderRef.current;
        await new Promise((resolve) => {
          mr.onstop = () => resolve();
          if (mr.state === 'recording') {
            mr.requestData();
            mr.stop();
          } else {
            resolve();
          }
        });

        if (audioChunksRef.current.length > 0) {
          const type = mr.mimeType || 'audio/webm';
          recordedBlob = new Blob(audioChunksRef.current, { type });
        }
      } catch (e) {
        console.warn("MediaRecorder stop error:", e);
      }
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }

    return recordedBlob;
  }, [cleanupRecognition, cleanupAudioAnalyser]);

  const transcribeAudioWithAI = useCallback(async (blob) => {
    if (!blob || blob.size < 200) return '';
    setIsTranscribing(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const audioBase64 = await base64Promise;

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: blob.type || 'audio/webm'
        })
      });

      const data = await res.json();
      setIsTranscribing(false);

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      if (data && data.text) {
        const cleaned = data.text.trim();
        accumulatedTextRef.current = cleaned;
        setTranscript(cleaned);
        return cleaned;
      }
      return '';
    } catch (err) {
      console.warn("AI Audio Transcription error:", err);
      setIsTranscribing(false);
      setError(`Audio transcription notice: ${err.message || 'Please speak louder or check microphone'}`);
      return '';
    }
  }, []);

  const resetTranscript = useCallback(() => {
    accumulatedTextRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      cleanupRecognition();
      cleanupAudioAnalyser();
      if (mediaStreamRef.current) {
        try {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
        } catch (e) {}
      }
    };
  }, [cleanupRecognition, cleanupAudioAnalyser]);

  return {
    isSupported,
    isListening,
    isTranscribing,
    transcript,
    interimTranscript,
    audioLevels,
    error,
    startListening,
    stopListening,
    transcribeAudioWithAI,
    resetTranscript,
    setTranscript
  };
}
