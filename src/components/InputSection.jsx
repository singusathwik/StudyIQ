import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, AlertCircle, X, CheckCircle, RefreshCw, FileCode, BookOpen } from 'lucide-react';
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

export function InputSection({ onGenerate, loading, parseStatus, error, onClearError }) {
  const [textInput, setTextInput] = useState('');
  const [topicHint, setTopicHint] = useState('');
  const [parsingFile, setParsingFile] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const fileInputRef = useRef(null);

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

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onGenerate(textInput, topicHint);
  };

  const loadSample = (sample) => {
    setTextInput(sample.text);
    setTopicHint(sample.title.split(':')[0]);
    setFileError(null);
  };

  return (
    <div className="create-study-kit-card glass-panel">
      
      {/* Header Title Row */}
      <div className="create-card-header">
        <div className="title-with-badge">
          <div className="create-icon-badge">
            <Sparkles size={20} className="sparkle-icon" />
          </div>
          <div>
            <h2>Create New Study Kit</h2>
            <p className="card-desc">Paste your lecture notes, textbook summaries, or upload a document (PDF / DOCX).</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="preset-samples">
          <span className="preset-lbl">Quick Presets:</span>
          {SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-btn"
              onClick={() => loadSample(s)}
            >
              {s.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        
        {/* Main Textarea */}
        <div className="form-group">
          <div className="textarea-wrapper">
            <textarea
              id="notes-input"
              rows={6}
              className="text-input-field notes-textarea"
              placeholder="Paste your study material, lecture notes, or key concepts here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={loading}
            />
            {textInput && (
              <span className="char-count-badge">{textInput.length} chars</span>
            )}
          </div>
        </div>

        {/* Topic Hint & Drag Drop Row */}
        <div className="form-row align-center">
          
          <div className="form-group flex-1">
            <label className="input-label-sm">Topic Title (Optional)</label>
            <input
              id="topic-hint"
              type="text"
              className="text-input-field"
              placeholder="e.g. Cognitive Psychology, Photosynthesis"
              value={topicHint}
              onChange={(e) => setTopicHint(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* File Upload Zone */}
          <div className="form-group flex-1">
            <label className="input-label-sm">Attach Document (PDF or DOCX)</label>
            <div 
              className={`file-drop-zone sleek ${parsingFile ? 'parsing' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,.docx,.doc,.txt" 
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />

              {parsingFile ? (
                <div className="drop-status">
                  <RefreshCw className="spin-icon" size={16} />
                  <span>Parsing file text...</span>
                </div>
              ) : uploadedFileName ? (
                <div className="drop-status success">
                  <CheckCircle size={16} className="check-icon" />
                  <span className="file-name">{uploadedFileName}</span>
                  <button 
                    type="button"
                    className="clear-file-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFileName(null);
                      setTextInput('');
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="drop-status">
                  <Upload size={16} className="upload-icon" />
                  <span>Click or drag PDF / DOCX file</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Submit Action Row */}
        <div className="form-actions-row">
          <button 
            type="submit" 
            className="btn btn-primary generate-main-btn"
            disabled={loading || !textInput.trim()}
          >
            {loading ? (
              <>
                <RefreshCw className="spin-icon" size={18} />
                <span>Generating Study Kit...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Flashcards & Quizzes</span>
              </>
            )}
          </button>
        </div>

        {/* Client-side File Error Alert */}
        {fileError && (
          <div className="alert-box alert-warning">
            <AlertCircle size={16} />
            <span>{fileError}</span>
            <button type="button" className="close-alert" onClick={() => setFileError(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Backend Generation Error Alert */}
        {error && (
          <div className="alert-box alert-danger">
            <AlertCircle size={16} />
            <div className="error-text-content">
              <strong>Generation Error:</strong> {error}
            </div>
            <button type="button" className="close-alert" onClick={onClearError}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Status Indicator */}
        {parseStatus && (
          <div className="status-indicator">
            <RefreshCw className="spin-icon" size={16} />
            <span>{parseStatus}</span>
          </div>
        )}

      </form>
    </div>
  );
}
