import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ArrowUp, 
  Sparkles, 
  Mic, 
  MicOff,
  FileText, 
  CheckCircle, 
  X, 
  RefreshCw, 
  Brain,
  Sliders,
  Layers,
  HelpCircle,
  BookOpen,
  Trash2,
  ArrowRight,
  AlertCircle,
  Square,
  Zap,
  ChevronDown
} from 'lucide-react';
import { parseFileContent } from '../utils/fileParser';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const SAMPLES = [
  {
    title: "Neuroscience: Spaced Repetition",
    text: `Spaced repetition is an evidence-based learning technique that is usually performed with flashcards. Newly introduced and more difficult flashcards are shown more frequently, while older and less difficult flashcards are shown less frequently in order to exploit the psychological spacing effect. The SM-2 algorithm calculates intervals based on user feedback rating from 0 to 5. Active recall involves retrieving information from memory without looking at notes.`
  },
  {
    title: "Biology: Photosynthesis & ATP",
    text: `Photosynthesis is the process used by plants and other organisms to convert light energy into chemical energy. Sunlight powers the reaction between carbon dioxide and water to produce glucose and oxygen gas. Chlorophyll is the green pigment inside chloroplasts responsible for absorbing light energy. ATP (adenosine triphosphate) acts as the cellular energy currency.`
  },
  {
    title: "Computer Science: Data Structures",
    text: `Data structures organize and store data for efficient access and modification. Arrays provide O(1) random access by index. Binary Search Trees maintain sorted elements allowing logarithmic average lookup times. Hash tables store key-value pairs using hash functions for near constant-time search operations.`
  }
];

const PROVIDERS = [
  {
    id: 'google',
    name: 'Google Gemini',
    icon: '✦',
    badgeClass: 'badge-google',
    color: '#4F46E5',
    defaultModel: 'gemini-2.5-flash',
    models: [
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Primary)' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { id: 'gemini-flash-latest', label: 'Gemini Flash Latest' }
    ]
  },
  {
    id: 'groq',
    name: 'Groq AI',
    icon: '⚡',
    badgeClass: 'badge-groq',
    color: '#10B981',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Groq: Llama 3.3 70B' },
      { id: 'mixtral-8x7b-32768', label: 'Groq: Mixtral 8x7B' },
      { id: 'gemma2-9b-it', label: 'Groq: Gemma 2 9B' }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    icon: '✳',
    badgeClass: 'badge-anthropic',
    color: '#D97706',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: [
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
    ]
  }
];

export function ClaudeInputSection({ 
  onGenerate, 
  loading, 
  parseStatus, 
  error, 
  onClearError, 
  currentStreak, 
  xp, 
  level,
  savedKits = [],
  onLoadSavedKit,
  onDeleteSavedKit
}) {
  const [textInput, setTextInput] = useState('');
  const [topicHint, setTopicHint] = useState('');
  const [showTopicField, setShowTopicField] = useState(false);
  const [numCards, setNumCards] = useState(10);
  const [numQuizzes, setNumQuizzes] = useState(5);
  const [showConfig, setShowConfig] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Multi-Agent Selection State (Default: Google Gemini 2.5 Flash)
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  // Enhanced Speech-To-Text Lecture Dictation Hook with Real-time Reactive Waveforms
  const {
    isSupported: voiceSupported,
    isListening,
    isTranscribing,
    transcript: speechTranscript,
    interimTranscript,
    audioLevels = [18, 28, 42, 28, 18],
    error: speechError,
    startListening,
    stopListening,
    transcribeAudioWithAI,
    resetTranscript
  } = useSpeechRecognition({ continuous: true });

  // Sync speech transcript directly into the textarea in real time
  useEffect(() => {
    if (speechTranscript) {
      setTextInput(speechTranscript);
      if (!topicHint && speechTranscript.length > 15) {
        const firstWords = speechTranscript.split(' ').slice(0, 4).join(' ');
        setTopicHint(firstWords.replace(/[^\w\s]/gi, ''));
      }
    }
  }, [speechTranscript]);

  // Voice recording timer counter
  useEffect(() => {
    if (isListening) {
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 4) {
      setGreeting("It’s a late-night study session.");
    } else if (hour >= 4 && hour < 12) {
      setGreeting("Good morning. What are we mastering today?");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon. Ready to study?");
    } else {
      setGreeting("It’s an evening study session.");
    }
  }, []);

  const handleProviderChange = (provId) => {
    setSelectedProvider(provId);
    const prov = PROVIDERS.find(p => p.id === provId);
    if (prov) {
      setSelectedModel(prov.defaultModel);
    }
  };

  const handleToggleVoice = async () => {
    if (isListening) {
      const audioBlob = await stopListening();
      if (audioBlob && audioBlob.size > 500) {
        const aiText = await transcribeAudioWithAI(audioBlob);
        if (aiText) {
          setTextInput(aiText);
          const firstWords = aiText.split(' ').slice(0, 4).join(' ');
          setTopicHint(firstWords.replace(/[^\w\s]/gi, ''));
        }
      }
    } else {
      resetTranscript();
      await startListening();
    }
  };

  const handleVoiceStopAndGenerate = async () => {
    const audioBlob = await stopListening();
    let finalContent = (textInput || speechTranscript || '').trim();

    if (audioBlob && audioBlob.size > 500) {
      const aiText = await transcribeAudioWithAI(audioBlob);
      if (aiText) {
        finalContent = aiText;
        setTextInput(aiText);
        const firstWords = aiText.split(' ').slice(0, 4).join(' ');
        setTopicHint(firstWords.replace(/[^\w\s]/gi, ''));
      }
    }

    if (!finalContent || loading) return;

    const options = {
      provider: selectedProvider,
      model: selectedModel
    };
    onGenerate(finalContent, topicHint, numCards, numQuizzes, options);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setParsingFile(true);
    setFileError(null);
    setUploadedFileName(file.name);

    const result = await parseFileContent(file);
    setParsingFile(false);

    if (result.success) {
      setTextInput(result.text);
      if (!topicHint) {
        setTopicHint(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    } else {
      setFileError(result.error);
      setUploadedFileName(null);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isListening) stopListening();
    if (!textInput.trim() || loading) return;

    const options = {
      provider: selectedProvider,
      model: selectedModel
    };

    onGenerate(textInput, topicHint, numCards, numQuizzes, options);
  };

  const loadSample = (sample) => {
    setTextInput(sample.text);
    setTopicHint(sample.title.split(':')[0]);
    setFileError(null);
  };

  const activeProvObj = PROVIDERS.find(p => p.id === selectedProvider) || PROVIDERS[0];
  const activeModelObj = activeProvObj.models.find(m => m.id === selectedModel) || activeProvObj.models[0];

  return (
    <div className="claude-input-container">
      
      {/* Top Greeting */}
      <div className="agent-header-row">
        <div className="claude-greeting-row">
          <span className="claude-asterisk">{activeProvObj.icon}</span>
          <h1 className="claude-greeting-text">{greeting}</h1>
        </div>
      </div>

      {/* Main AI Prompt Card Box */}
      <div className="claude-prompt-card">
        
        <form onSubmit={handleSubmit} className="claude-prompt-form">
          
          {/* Active Voice Lecture Recording Live Banner */}
          {isListening && (
            <div className="voice-recording-banner glass-panel">
              <div className="voice-banner-left">
                <span className="recording-pulse-dot"></span>
                <span className="voice-banner-title">Listening to Voice...</span>
                <span className="voice-timer-badge">{formatTimer(recordingDuration)}</span>
                
                {/* Real-Time Reactive Audio Waveform Bars */}
                <div className="waveform-anim real-time-waveform" title="Live Voice Frequency Meter">
                  {audioLevels.map((lvl, idx) => (
                    <span 
                      key={idx} 
                      className="waveform-bar real-time-bar"
                      style={{ height: `${lvl}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="voice-banner-actions">
                <button
                  type="button"
                  className="btn-voice-stop"
                  onClick={handleToggleVoice}
                >
                  <Square size={13} />
                  <span>Done Speaking</span>
                </button>

                <button
                  type="button"
                  className="btn-voice-generate"
                  onClick={handleVoiceStopAndGenerate}
                  disabled={loading || isTranscribing}
                >
                  <Zap size={14} />
                  <span>Command {activeProvObj.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          )}

          {/* Voice Audio Transcription Natural Indicator */}
          {isTranscribing && (
            <div className="natural-ai-thinking-card" style={{ margin: '8px 0 12px' }}>
              <Sparkles className="sparkle-spin-icon" size={16} />
              <span>✦ Converting your voice notes into text...</span>
            </div>
          )}

          {/* Main Auto-expanding Input Area */}
          <div className="claude-textarea-container">
            <textarea
              className="claude-textarea"
              placeholder={`Ask ${activeProvObj.name} to generate flashcards & quizzes... Speak into mic or paste notes/topics...`}
              rows={4}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e);
                }
              }}
            />

            {/* Real-time Interim Live Voice Transcription Preview */}
            {isListening && interimTranscript && (
              <div className="voice-interim-preview">
                <span>🎙️ "{interimTranscript}"</span>
              </div>
            )}
          </div>

          {/* Optional Topic Field Bar */}
          {showTopicField && (
            <div className="claude-topic-row">
              <input 
                type="text"
                className="claude-topic-input"
                placeholder="Topic Title / Subject Hint (e.g. Quantum Computing)..."
                value={topicHint}
                onChange={(e) => setTopicHint(e.target.value)}
              />
              <button 
                type="button" 
                className="close-topic-btn"
                onClick={() => setShowTopicField(false)}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Quantity Selector Panel (Cards & Quizzes) */}
          {showConfig && (
            <div className="claude-config-row">
              <div className="config-group">
                <Layers size={14} className="text-accent" />
                <span className="config-label">Flashcards:</span>
                <select 
                  value={numCards} 
                  onChange={(e) => setNumCards(Number(e.target.value))}
                  className="config-select"
                >
                  <option value={5}>5 Cards</option>
                  <option value={10}>10 Cards</option>
                  <option value={15}>15 Cards</option>
                  <option value={20}>20 Cards</option>
                </select>
              </div>

              <div className="config-group">
                <HelpCircle size={14} className="text-accent" />
                <span className="config-label">Quizzes:</span>
                <select 
                  value={numQuizzes} 
                  onChange={(e) => setNumQuizzes(Number(e.target.value))}
                  className="config-select"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>

              <button 
                type="button" 
                className="close-topic-btn"
                onClick={() => setShowConfig(false)}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Uploaded File Chip Banner */}
          {uploadedFileName && (
            <div className="claude-file-chip">
              <FileText size={14} className="text-accent" />
              <span className="chip-name">{uploadedFileName}</span>
              <button 
                type="button" 
                className="chip-remove"
                onClick={() => {
                  setUploadedFileName(null);
                  setTextInput('');
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Bottom Toolbar inside Input Card */}
          <div className="claude-toolbar">
            
            {/* Left Controls: Attach File (+) + Model Dropdown */}
            <div className="toolbar-left">
              
              {/* Attach File (+) Button */}
              <button 
                type="button"
                className="claude-icon-action-btn"
                title="Attach PDF or Word Document (.docx)"
                onClick={() => fileInputRef.current?.click()}
              >
                {parsingFile ? <RefreshCw size={18} className="spin-icon" /> : <Plus size={19} />}
              </button>

              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,.docx,.doc,.txt" 
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />

              {/* Unified All-in-One AI Agent & Model Dropdown */}
              <div className="claude-model-pill" title="Select AI Model">
                <select 
                  value={`${selectedProvider}:${selectedModel}`}
                  onChange={(e) => {
                    const [prov, mdl] = e.target.value.split(':');
                    setSelectedProvider(prov);
                    setSelectedModel(mdl);
                  }}
                  className="model-select-inline"
                  aria-label="Select AI Agent and Model"
                >
                  {PROVIDERS.map((prov) => (
                    <optgroup key={prov.id} label={`${prov.icon} ${prov.name}`}>
                      {prov.models.map((m) => (
                        <option key={m.id} value={`${prov.id}:${m.id}`}>
                          {m.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown size={14} className="model-dropdown-arrow" />
              </div>

            </div>

            {/* Right Controls: Highlighted Voice Button + Circular Submit Arrow */}
            <div className="toolbar-right">
              
              {/* Highlighted Voice Lecture Dictation Button with Reactive Equalizer */}
              <button 
                type="button"
                className={`claude-voice-highlight-btn ${isListening ? 'recording' : ''}`}
                onClick={handleToggleVoice}
                title={isListening ? "Stop Voice Recording & Transcribe" : "Speak Chaotic Lecture Summary (Voice AI Feature)"}
              >
                <div className="voice-btn-inner">
                  {isListening ? (
                    <div className="mini-reactive-equalizer">
                      {audioLevels.slice(0, 4).map((lvl, idx) => (
                        <span 
                          key={idx} 
                          className="mini-meter-bar" 
                          style={{ height: `${Math.max(20, lvl * 0.85)}%` }} 
                        />
                      ))}
                    </div>
                  ) : (
                    <Mic size={16} className="voice-mic-svg" />
                  )}
                  <span className="voice-btn-label">
                    {isListening ? `${formatTimer(recordingDuration)}` : 'Speak Lecture'}
                  </span>
                  {isListening && <span className="voice-live-dot" />}
                </div>
              </button>

              {/* Submit Send Button (Circle with Arrow) */}
              <button 
                type="submit" 
                className="claude-submit-btn"
                disabled={loading || (!textInput.trim() && !isListening)}
                title="Generate Study Kit (Ctrl + Enter)"
              >
                {loading ? <RefreshCw size={18} className="spin-icon" /> : <ArrowRight size={18} />}
              </button>

            </div>

          </div>

        </form>

      </div>

      {/* Helper Chips Ribbon Row - Positioned Below Main Input Box */}
      <div className="claude-chips-ribbon">
        
        {/* Highlighted Voice Lecture Quick Chip */}
        <button 
          type="button"
          className={`claude-pill-chip voice-quick-chip ${isListening ? 'active recording' : ''}`}
          onClick={handleToggleVoice}
          title="Speak chaotic lecture notes into the microphone"
        >
          <Mic size={13} className="voice-chip-icon" />
          <span>{isListening ? 'Listening to Lecture...' : 'Speak Chaotic Lecture'}</span>
        </button>

        {/* Quantity Options Pill Button */}
        <button 
          type="button"
          className={`claude-pill-chip ${showConfig ? 'active' : ''}`}
          onClick={() => setShowConfig(!showConfig)}
          title="Set number of flashcards and quiz questions"
        >
          <Sliders size={13} />
          <span>{numCards} Cards, {numQuizzes} Qs</span>
        </button>

        {/* Topic Hint Toggle Button */}
        <button 
          type="button"
          className={`claude-pill-chip ${topicHint ? 'active' : ''}`}
          onClick={() => setShowTopicField(!showTopicField)}
        >
          <span>{topicHint ? `Topic: ${topicHint}` : 'Add Topic'}</span>
        </button>

        {/* Preset Sample Subject Chips */}
        {SAMPLES.map((s, idx) => (
          <button 
            key={idx} 
            type="button" 
            className="claude-pill-chip"
            onClick={() => loadSample(s)}
          >
            {s.title.split(':')[0]}
          </button>
        ))}

      </div>

      {/* Natural Human-Friendly Sub-bar Status */}
      <div className="claude-submeter-bar" style={{ marginTop: '8px' }}>
        <div className="submeter-left">
          <span>Ready to build <strong>{numCards} flashcards & {numQuizzes} quizzes</strong> with {activeProvObj.name.split(' ')[0]}</span>
        </div>
        <div className="submeter-right">
          <span>Press <strong>Ctrl + Enter</strong> to generate</span>
        </div>
      </div>

      {/* Voice Recognition Error */}
      {speechError && (
        <div className="alert-box alert-warning small-alert">
          <AlertCircle size={16} />
          <span>{speechError}</span>
        </div>
      )}

      {/* File Parsing Error */}
      {fileError && (
        <div className="alert-box alert-warning small-alert">
          <AlertCircle size={16} />
          <span>{fileError}</span>
          <button type="button" className="close-alert" onClick={() => setFileError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Backend Generation Error */}
      {error && (
        <div className="alert-box alert-danger small-alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button type="button" className="close-alert" onClick={onClearError}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Natural AI Thinking & Progress Banner */}
      {(loading || parseStatus) && (
        <div className="natural-ai-thinking-card">
          <Sparkles className="sparkle-spin-icon" size={17} />
          <span className="thinking-text">
            {parseStatus || `✦ ${activeProvObj.name.split(' ')[0]} is preparing your flashcards & quiz...`}
          </span>
        </div>
      )}

    </div>
  );
}
