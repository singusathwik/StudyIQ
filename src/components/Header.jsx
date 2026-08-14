import React from 'react';
import { 
  Zap, 
  Flame, 
  Moon, 
  Sun
} from 'lucide-react';

export function Header({ 
  xp, 
  level, 
  progressToNextLevel, 
  currentStreak, 
  darkMode, 
  setDarkMode
}) {
  return (
    <div className="floating-bottom-dock" aria-label="Study Progress & Gamification">
      
      {/* Streak Badge */}
      <div className="stat-pill streak-pill" title={`${currentStreak} day study streak!`}>
        <Flame size={15} className="flame-icon" />
        <span className="stat-val">{currentStreak}d</span>
      </div>

      {/* XP & Level Badge */}
      <div className="stat-pill xp-pill" title={`Level ${level} - ${progressToNextLevel}% to next level`}>
        <Zap size={15} className="zap-icon" />
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
        type="button"
        className="icon-btn theme-dock-toggle" 
        onClick={() => setDarkMode(!darkMode)}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

    </div>
  );
}
