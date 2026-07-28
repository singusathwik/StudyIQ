import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Upload, 
  X, 
  Sparkles, 
  FileCode 
} from 'lucide-react';
import { exportToPDF, exportToCSV, getShareableURL, downloadJSONFile } from '../utils/exportShare';

export function ShareExportModal({ studySet, onImportSet, onClose }) {
  const [copied, setCopied] = useState(false);
  const jsonInputRef = useRef(null);

  const shareUrl = studySet ? getShareableURL(studySet) : '';

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleImportJSON = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.topic && parsed.blocks) {
          onImportSet(parsed);
          onClose();
        } else {
          alert("Invalid Study Set JSON format.");
        }
      } catch (err) {
        alert("Failed to parse JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-panel">
        
        <div className="modal-header">
          <div className="modal-title">
            <Share2 size={20} className="text-accent" />
            <h3>Export & Share Study Set</h3>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          
          {/* Section 1: Export Options */}
          {studySet && (
            <div className="export-options-group">
              <h4 className="option-group-title">Export Documents</h4>
              <div className="export-buttons-grid">
                
                <button className="btn btn-secondary" onClick={() => exportToPDF(studySet)}>
                  <FileText size={18} className="text-accent" />
                  <span>Export as PDF</span>
                </button>

                <button className="btn btn-secondary" onClick={() => exportToCSV(studySet)}>
                  <FileCode size={18} className="text-success" />
                  <span>Export as CSV (Flashcards)</span>
                </button>

                <button className="btn btn-secondary" onClick={() => downloadJSONFile(studySet)}>
                  <Download size={18} className="text-gold" />
                  <span>Download .JSON File</span>
                </button>

              </div>
            </div>
          )}

          {/* Section 2: Shareable Compressed URL */}
          {studySet && (
            <div className="share-url-group">
              <h4 className="option-group-title">Share via Compressed Link</h4>
              <p className="share-desc">No backend or authentication required. Recipient opens link to load set instantly.</p>
              
              <div className="share-input-row">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl || ''} 
                  className="text-input-field share-url-input" 
                />
                <button className="btn btn-primary copy-btn" onClick={handleCopyLink}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Import JSON Set */}
          <div className="import-json-group">
            <h4 className="option-group-title">Import Study Set</h4>
            <p className="share-desc">Load a saved .JSON study set directly into your workspace.</p>
            
            <input 
              ref={jsonInputRef} 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleImportJSON(e.target.files[0])}
            />

            <button className="btn btn-secondary import-btn" onClick={() => jsonInputRef.current?.click()}>
              <Upload size={18} />
              <span>Upload & Import .JSON File</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
