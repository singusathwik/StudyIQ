import React, { useState } from 'react';
import { 
  Sparkles, 
  SquarePen, 
  Search, 
  Pin, 
  Layers, 
  HelpCircle, 
  BarChart3, 
  Clock, 
  Trash2, 
  X, 
  Sun, 
  Moon, 
  BookOpen, 
  PanelLeftClose, 
  PanelLeftOpen, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export function Sidebar({
  isOpen,
  onToggle,
  savedKits = [],
  onLoadSavedKit,
  onDeleteSavedKit,
  onNewPrompt,
  activeTab,
  setActiveTab,
  currentTopic,
  darkMode,
  setDarkMode,
  xp,
  level,
  currentStreak,
  dueCount = 0,
  onStartDueReview,
  flashcardCount = 0,
  quizCount = 0,
  hasStudySet = false
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter kits based on search query
  const filteredKits = savedKits.filter(kit => 
    (kit.topic || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group into Pinned (first 2 or marked) and Recents
  const pinnedKits = filteredKits.slice(0, 2);
  const recentKits = filteredKits.slice(2);

  return (
    <aside className={`chatgpt-full-sidebar ${isOpen ? 'expanded' : 'rail-mode'}`}>
      
      {/* ─── EXPANDED FULL SIDEBAR (EXACT CHATGPT LAYOUT) ─── */}
      {isOpen ? (
        <div className="sidebar-expanded-content">
          
          {/* Top Header: Logo + Search + Collapse Button */}
          <div className="chatgpt-sidebar-top-bar">
            <div className="sidebar-brand-title" onClick={() => setActiveTab('create')}>
              <Sparkles size={18} className="sparkle-icon" />
              <span className="brand-logo-text">StudyIQ</span>
              <span className="brand-badge-pro">AI</span>
            </div>

            <div className="sidebar-top-actions">
              <button 
                type="button" 
                className="sidebar-action-icon"
                onClick={() => setSearchQuery(searchQuery ? '' : ' ')}
                title="Search topics"
              >
                <Search size={17} />
              </button>
              <button 
                type="button" 
                className="sidebar-action-icon"
                onClick={onToggle}
                title="Collapse sidebar"
              >
                <PanelLeftClose size={17} />
              </button>
            </div>
          </div>

          {/* "+ New chat" / "+ New Study Kit" Primary Button */}
          <div className="sidebar-new-chat-row">
            <button 
              type="button"
              className="chatgpt-new-chat-btn"
              onClick={() => {
                if (onNewPrompt) onNewPrompt();
                setActiveTab('create');
              }}
              title="Start New Study Kit"
            >
              <SquarePen size={18} className="new-chat-icon" />
              <span>New Study Kit</span>
            </button>
          </div>

          {/* Quick Nav Links (Flashcards, Quizzes, Dashboard, Review Due) */}
          <div className="chatgpt-nav-menu">
            
            {/* Flashcard Deck */}
            <button 
              type="button"
              className={`chatgpt-menu-item ${activeTab === 'flashcards' ? 'active' : ''}`}
              onClick={() => setActiveTab('flashcards')}
            >
              <Layers size={17} className="menu-icon" />
              <span className="menu-label">Flashcard Deck</span>
              {flashcardCount > 0 && (
                <span className="menu-count-badge">{flashcardCount}</span>
              )}
            </button>

            {/* Quiz Arena */}
            <button 
              type="button"
              className={`chatgpt-menu-item ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              <HelpCircle size={17} className="menu-icon" />
              <span className="menu-label">Quiz Arena</span>
              {quizCount > 0 && (
                <span className="menu-count-badge">{quizCount}</span>
              )}
            </button>

            {/* Dashboard / Analytics */}
            <button 
              type="button"
              className={`chatgpt-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 size={17} className="menu-icon" />
              <span className="menu-label">Dashboard</span>
            </button>

            {/* Review Due (Spaced Repetition) */}
            <button 
              type="button"
              className={`chatgpt-menu-item due-menu-item ${dueCount > 0 ? 'has-due' : ''}`}
              onClick={onStartDueReview}
              title={`${dueCount} cards due for spaced review`}
            >
              <Clock size={17} className="menu-icon text-warning" />
              <span className="menu-label">Review Due</span>
              {dueCount > 0 && (
                <span className="due-count-pill">{dueCount}</span>
              )}
            </button>

          </div>

          {/* Optional Search Filter Input */}
          {searchQuery.length > 0 && (
            <div className="sidebar-search-container">
              <Search size={14} className="search-icon-inline" />
              <input 
                type="text"
                placeholder="Search history..."
                value={searchQuery.trim()}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="sidebar-search-input"
              />
              <button 
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Scrollable History List (Pinned + Recents) */}
          <div className="chatgpt-history-scroll">
            
            {/* Pinned Topics */}
            {pinnedKits.length > 0 && !searchQuery.trim() && (
              <div className="history-section-group">
                <div className="history-group-header">Pinned</div>
                {pinnedKits.map(kit => (
                  <ChatGPTHistoryRow 
                    key={kit.id}
                    kit={kit}
                    isActive={currentTopic && currentTopic.toLowerCase() === (kit.topic || '').toLowerCase()}
                    onLoad={() => onLoadSavedKit(kit)}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteSavedKit(kit.id);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Recents History */}
            <div className="history-section-group">
              <div className="history-group-header">Recents</div>
              {filteredKits.length > 0 ? (
                filteredKits.map(kit => (
                  <ChatGPTHistoryRow 
                    key={kit.id}
                    kit={kit}
                    isActive={currentTopic && currentTopic.toLowerCase() === (kit.topic || '').toLowerCase()}
                    onLoad={() => onLoadSavedKit(kit)}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteSavedKit(kit.id);
                    }}
                  />
                ))
              ) : (
                <div className="sidebar-empty-recents">
                  <span>{searchQuery.trim() ? 'No topics found' : 'No study kits yet'}</span>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Footer User Profile (like ChatGPT) */}
          <div className="chatgpt-sidebar-footer">
            <div className="user-profile-card">
              <div className="user-avatar-badge">SS</div>
              <div className="user-details">
                <div className="user-display-name">Sathwik Singu</div>
                <div className="user-streak-info">🔥 {currentStreak}d Streak • Lvl {level}</div>
              </div>
              <button 
                type="button"
                className="user-theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* ─── SLIM ICON RAIL (COLLAPSED STATE) ─── */
        <div className="chatgpt-collapsed-rail">
          <div className="rail-top-icons">
            
            {/* Website Brand Logo with Pure CSS Hover Transition */}
            <div className="rail-logo-wrapper">
              <button 
                type="button"
                className="rail-btn brand-toggle"
                onClick={onToggle}
                aria-label="Open sidebar"
              >
                <span className="brand-logo-icon">
                  <Sparkles size={20} className="sparkle-icon brand-sparkle" />
                </span>
                <span className="brand-toggle-icon">
                  <PanelLeftOpen size={19} />
                </span>
              </button>

              {/* Hover Tooltip matching ChatGPT pill */}
              <div className="rail-hover-tooltip">
                <span>Open sidebar</span>
              </div>
            </div>

            {/* New Study Kit */}
            <button 
              type="button"
              className="rail-btn"
              onClick={() => {
                if (onNewPrompt) onNewPrompt();
                setActiveTab('create');
              }}
              title="New Study Kit"
            >
              <SquarePen size={18} />
            </button>

            {/* Flashcard Deck */}
            <button 
              type="button"
              className={`rail-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
              onClick={() => setActiveTab('flashcards')}
              title="Flashcard Deck"
            >
              <Layers size={18} />
            </button>

            {/* Quiz Arena */}
            <button 
              type="button"
              className={`rail-btn ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz')}
              title="Quiz Arena"
            >
              <HelpCircle size={18} />
            </button>

            {/* Dashboard */}
            <button 
              type="button"
              className={`rail-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              title="Dashboard"
            >
              <BarChart3 size={18} />
            </button>

            {/* Review Due */}
            <button 
              type="button"
              className={`rail-btn due-rail-btn ${dueCount > 0 ? 'has-due' : ''}`}
              onClick={onStartDueReview}
              title={`Review Due (${dueCount})`}
            >
              <Clock size={18} />
              {dueCount > 0 && <span className="rail-due-dot"></span>}
            </button>
          </div>

          <div className="rail-bottom-icons">
            <div 
              className="rail-avatar" 
              onClick={() => setDarkMode(!darkMode)}
              title="Sathwik Singu • Toggle Theme"
            >
              SS
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}

function ChatGPTHistoryRow({ kit, isActive, onLoad, onDelete }) {
  return (
    <div 
      className={`chatgpt-history-item ${isActive ? 'active' : ''}`}
      onClick={onLoad}
      title={kit.topic}
    >
      <MessageSquare size={15} className="history-bubble-icon" />
      <span className="history-topic-name">{kit.topic || 'Untitled Study Kit'}</span>
      <button 
        type="button"
        className="history-delete-btn"
        onClick={onDelete}
        title="Delete kit"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
