import React from 'react';
import { Bug, AlertOctagon, XCircle, Clock, FileWarning, RefreshCw, X } from 'lucide-react';

export function DebugPanel({ onInjectDebug, onClose }) {
  return (
    <div className="debug-panel-overlay glass-panel">
      <div className="debug-panel-header">
        <div className="debug-title">
          <Bug className="text-warning" size={20} />
          <span>Dev-Only Pipeline Error Simulator</span>
        </div>
        <button className="close-debug-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <p className="debug-desc">
        Test Zod schema validation and error handling live without needing the real AI API to fail on demand.
      </p>

      <div className="debug-actions-grid">
        
        <button 
          className="btn debug-btn btn-danger"
          onClick={() => onInjectDebug('malformed')}
        >
          <FileWarning size={16} />
          <span>Inject Malformed JSON</span>
        </button>

        <button 
          className="btn debug-btn btn-warning"
          onClick={() => onInjectDebug('empty')}
        >
          <AlertOctagon size={16} />
          <span>Inject Empty Response</span>
        </button>

        <button 
          className="btn debug-btn btn-danger"
          onClick={() => onInjectDebug('network')}
        >
          <XCircle size={16} />
          <span>Simulate Network Failure (500)</span>
        </button>

        <button 
          className="btn debug-btn btn-secondary"
          onClick={() => onInjectDebug('timeout')}
        >
          <Clock size={16} />
          <span>Simulate Request Timeout</span>
        </button>

      </div>
    </div>
  );
}
