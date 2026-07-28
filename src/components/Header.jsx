import React from 'react';
import { 
  Zap, 
  Flame, 
  Award, 
  Moon, 
  Sun, 
  BarChart3, 
  Sparkles,
  Layers,
  HelpCircle,
  Home,
  Bot
} from 'lucide-react';

export function Header({ 
  xp, 
  level, 
  progressToNextLevel, 
  currentStreak, 
  darkMode, 
  setDarkMode, 
  dueCount, 
  onStartDueReview, 
  activeTab, 
  setActiveTab,
  onSelectStudySpace,
  hasStudySet,
  flashcardCount,
  quizCount
}) {
  return (
    <header className="app-header">
      <div className="header-container">
        
        {/* Brand Title */}
        <div className="brand-section" onClick={() => setActiveTab('home')}>
          <div className="brand-icon">
            <Sparkles className="sparkle-icon" size={22} />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">StudyIQ</h1>
            <span className="brand-subtitle">AI Assistant</span>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={16} />
            <span>Home</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => {
              if (onSelectStudySpace) {
                onSelectStudySpace();
              } else {
                setActiveTab('create');
              }
            }}
          >
            <Bot size={16} />
            <span>AI Generator</span>
          </button>

          {/* Render Flashcards & Quiz Arena ONLY after prompt generation */}
          {hasStudySet && (
            <>
              <button 
                className={`nav-tab ${activeTab === 'flashcards' ? 'active' : ''}`}
                onClick={() => setActiveTab('flashcards')}
              >
                <Layers size={16} />
                <span>Flashcards {flashcardCount > 0 ? `(${flashcardCount})` : ''}</span>
              </button>

              <button 
                className={`nav-tab ${activeTab === 'quiz' ? 'active' : ''}`}
                onClick={() => setActiveTab('quiz')}
              >
                <HelpCircle size={16} />
                <span>Quiz Arena {quizCount > 0 ? `(${quizCount})` : ''}</span>
              </button>
            </>
          )}

          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={16} />
            <span>Dashboard</span>
          </button>

          {dueCount > 0 && (
            <button 
              className="nav-tab due-cards-badge"
              onClick={onStartDueReview}
              title={`${dueCount} card${dueCount > 1 ? 's' : ''} due for review today!`}
            >
              <Layers size={16} />
              <span>Review Due ({dueCount})</span>
            </button>
          )}
        </nav>

        {/* User Level, Streak, Gamification Stats */}
        <div className="header-actions">
          
          {/* Streak Badge */}
          <div className="stat-pill streak-pill" title={`${currentStreak} day study streak!`}>
            <Flame size={16} className="flame-icon" />
            <span className="stat-val">{currentStreak}d</span>
          </div>

          {/* XP & Level Badge */}
          <div className="stat-pill xp-pill" title={`Level ${level} - ${progressToNextLevel}% to next level`}>
            <Zap size={16} className="zap-icon" />
            <div className="xp-info">
              <div className="xp-top">
                <span className="level-lbl">Lvl {level}</span>
                <span className="xp-val">{xp} XP</span>
              </div>
              <div className="level-bar-bg">
                <div className="level-bar-fill" style={{ width: `${progressToNextLevel}%` }}></div>
              </div>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button 
            className="icon-btn" 
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

        </div>

      </div>
    </header>
  );
}
