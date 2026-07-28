import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ArrowUp, 
  Sparkles, 
  Mic, 
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
  BarChart2
} from 'lucide-react';
import { parseFileContent } from '../utils/fileParser';

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

  const fileInputRef = useRef(null);

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
    if (!textInput.trim() || loading) return;
    onGenerate(textInput, topicHint, numCards, numQuizzes);
  };

  const loadSample = (sample) => {
    setTextInput(sample.text);
    setTopicHint(sample.title.split(':')[0]);
    setFileError(null);
  };

  return (
    <div className="claude-input-container">
      
      {/* Claude-Style Greeting Headline */}
      <div className="claude-greeting-row">
        <span className="claude-asterisk">✳</span>
        <h1 className="claude-greeting-text">{greeting}</h1>
      </div>

      {/* Claude Prompt Card Box */}
      <div className="claude-prompt-card">
        
        <form onSubmit={handleSubmit} className="claude-prompt-form">
          
          {/* Main Auto-expanding Input Area */}
          <div className="claude-textarea-container">
            <textarea
              className="claude-textarea"
              placeholder="How can I help you study today? Paste notes, textbook excerpt, or topic summary..."
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
            
            {/* Left Controls: Attach File + Presets + Quantity config */}
            <div className="toolbar-left">
              
              {/* Attach File (+) Button */}
              <button 
                type="button"
                className="claude-icon-action-btn"
                title="Attach PDF or Word Document (.docx)"
                onClick={() => fileInputRef.current?.click()}
              >
                {parsingFile ? <RefreshCw size={18} className="spin-icon" /> : <Plus size={20} />}
              </button>

              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,.docx,.doc,.txt" 
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />

              {/* Quantity Options Pill Button */}
              <button 
                type="button"
                className={`claude-pill-btn ${showConfig ? 'active' : ''}`}
                onClick={() => setShowConfig(!showConfig)}
                title="Set number of flashcards and quiz questions"
              >
                <Sliders size={13} />
                <span>{numCards} Cards, {numQuizzes} Qs</span>
              </button>

              {/* Topic Hint Toggle Button */}
              <button 
                type="button"
                className={`claude-pill-btn ${topicHint ? 'active' : ''}`}
                onClick={() => setShowTopicField(!showTopicField)}
              >
                <span>{topicHint ? `Topic: ${topicHint}` : 'Add Topic'}</span>
              </button>

              {/* Preset Sample Chips */}
              <div className="claude-preset-chips">
                {SAMPLES.map((s, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    className="claude-sample-chip"
                    onClick={() => loadSample(s)}
                  >
                    {s.title.split(':')[0]}
                  </button>
                ))}
              </div>

            </div>

            {/* Right Controls: Model Pill + Submit Arrow */}
            <div className="toolbar-right">
              
              {/* Model Indicator Pill */}
              <div className="claude-model-pill">
                <Brain size={14} className="text-accent" />
                <span>Claude 3.5 Sonnet</span>
              </div>

              {/* Submit Send Button */}
              <button 
                type="submit" 
                className="claude-submit-btn"
                disabled={loading || !textInput.trim()}
                title="Generate Study Kit (Ctrl + Enter)"
              >
                {loading ? <RefreshCw size={18} className="spin-icon" /> : <ArrowUp size={18} />}
              </button>

            </div>

          </div>

          {/* Sub-bar Session Meter */}
          <div className="claude-submeter-bar">
            <div className="submeter-left">
              <span>SM-2 Engine Active</span>
              <span className="dot-divider">•</span>
              <span>Target: {numCards} Flashcards & {numQuizzes} Quizzes</span>
              <span className="dot-divider">•</span>
              <span>Streak: {currentStreak}d 🔥</span>
            </div>
            <div className="submeter-right">
              <span>Ctrl + Enter to generate</span>
            </div>
          </div>

        </form>

      </div>

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

      {/* Status Indicator */}
      {parseStatus && (
        <div className="status-indicator centered">
          <RefreshCw className="spin-icon" size={16} />
          <span>{parseStatus}</span>
        </div>
      )}

      {/* Saved Study Kits Library Section */}
      {savedKits && savedKits.length > 0 && (
        <div className="saved-kits-library">
          <div className="saved-library-header">
            <div className="lib-title-row">
              <BookOpen size={18} className="text-accent" />
              <h3>Your Saved Topic Kits</h3>
            </div>
            <span className="lib-count-badge">{savedKits.length} Kits</span>
          </div>

          <div className="saved-kits-grid">
            {savedKits.map((kit) => (
              <div key={kit.id} className="saved-kit-card glass-panel">
                
                <div className="kit-card-top">
                  <span className="kit-date">{kit.createdAt}</span>
                  <button 
                    className="delete-kit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeleteSavedKit) onDeleteSavedKit(kit.id);
                    }}
                    title="Delete Study Kit"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h4 className="kit-topic-title">{kit.topic}</h4>

                {/* Completion Progress Bar */}
                <div className="kit-progress-wrapper">
                  <div className="kit-progress-labels">
                    <span className="prog-text">Completion Progress</span>
                    <span className="prog-val">{kit.completedPercent || 10}%</span>
                  </div>
                  <div className="kit-progress-bg">
                    <div 
                      className="kit-progress-fill" 
                      style={{ width: `${kit.completedPercent || 10}%` }}
                    ></div>
                  </div>
                </div>

                <div className="kit-meta-tags">
                  <span className="kit-tag"><Layers size={12} /> {kit.flashcardCount} Cards</span>
                  <span className="kit-tag"><HelpCircle size={12} /> {kit.quizCount} Quizzes</span>
                </div>

                <button 
                  className="btn btn-secondary btn-sm kit-open-btn"
                  onClick={() => onLoadSavedKit && onLoadSavedKit(kit)}
                >
                  <span>Review Kit</span>
                  <ArrowRight size={14} />
                </button>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
