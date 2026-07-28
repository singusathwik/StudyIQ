import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Check, 
  X, 
  HelpCircle,
  Brain,
  Layers,
  Share2,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { calculateSM2 } from '../utils/sm2';

export function FlashcardDeck({ 
  cards = [], 
  topic = '', 
  onReviewCard, 
  onCardReviewedLog,
  onOpenShareModal,
  onNewPrompt,
  onRevisitAll,
  totalCompletedCardsCount = 0
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState({});

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '1' && isFlipped) {
        handleRating(1); // Hard
      } else if (e.key === '2' && isFlipped) {
        handleRating(5); // Easy
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, totalCards]);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(totalCards - 1);
    }
  };

  const handleRating = (quality) => {
    if (!currentCard) return;

    const currentSM2Data = currentCard.sm2 || { interval: 0, repetition: 0, easeFactor: 2.5 };
    const updatedSM2 = calculateSM2(quality, currentSM2Data.interval, currentSM2Data.repetition, currentSM2Data.easeFactor);

    if (onReviewCard) {
      onReviewCard(currentCard.id, updatedSM2, quality);
    }

    if (onCardReviewedLog) {
      onCardReviewedLog(currentCard.id, quality >= 3);
    }

    setSessionReviewed(prev => ({
      ...prev,
      [currentCard.id]: quality >= 3 ? 'easy' : 'hard'
    }));

    handleNext();
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="flashcard-empty glass-panel">
        <Layers size={48} className="empty-icon" />
        <h3>No Flashcards Loaded</h3>
        <p>Use the AI Generator tab to create a study kit from your notes or PDF documents.</p>
      </div>
    );
  }

  return (
    <div className="flashcards-standalone-section glass-panel">
      
      {/* Top Banner Toolbar */}
      <div className="flashcards-section-header">
        <div className="header-meta">
          <span className="section-badge">
            <Layers size={14} />
            <span>FLASHCARD DECK</span>
          </span>
          <h2 className="deck-main-title">{topic || 'Flashcard Deck'}</h2>
        </div>

        <div className="header-actions-row">
          {onRevisitAll && totalCompletedCardsCount > 0 && (
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onRevisitAll}
              title="Revisit all cards in your completed library"
            >
              <RotateCcw size={15} />
              <span>Revisit All Completed ({totalCompletedCardsCount})</span>
            </button>
          )}

          {onOpenShareModal && (
            <button className="btn btn-secondary btn-sm" onClick={onOpenShareModal}>
              <Share2 size={16} />
              <span>Export / Share</span>
            </button>
          )}

          {onNewPrompt && (
            <button className="btn btn-primary btn-sm" onClick={onNewPrompt}>
              <ArrowLeft size={16} />
              <span>New Prompt</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Stage with Card + Side Thumbnail Navigator */}
      <div className="flashcards-workspace-stage">
        
        {/* Left Side / Main Stage: 3D Flip Card */}
        <div className="card-stage-container">
          
          <div className="stage-top-bar">
            <span className="card-counter-pill">
              Card {currentIndex + 1} of {totalCards}
            </span>

            <div className="deck-keys-hint">
              <span>[Space] Flip</span>
              <span>[←/→] Navigate</span>
              <span>[1] Hard</span>
              <span>[2] Easy</span>
            </div>
          </div>

          {/* 3D CSS Card Flip */}
          <div 
            className={`flashcard-scene ${isFlipped ? 'flipped' : ''}`} 
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="flashcard-card">
              
              {/* Front Face (Question / Prompt) */}
              <div className="flashcard-face flashcard-front">
                <span className="face-label">QUESTION / PROMPT</span>
                <p className="card-text">{currentCard?.front}</p>
                <div className="card-flip-prompt">
                  <RotateCw size={15} />
                  <span>Click or press Space to reveal answer</span>
                </div>
              </div>

              {/* Back Face (Answer / Explanation) */}
              <div className="flashcard-face flashcard-back">
                <span className="face-label">ANSWER / EXPLANATION</span>
                <p className="card-text">{currentCard?.back}</p>
                <div className="card-flip-prompt">
                  <Sparkles size={15} />
                  <span>Rate recall below to schedule next review</span>
                </div>
              </div>

            </div>
          </div>

          {/* Controls: Prev / Next + SM-2 Buttons */}
          <div className="flashcard-controls">
            <button className="btn btn-secondary" onClick={handlePrev}>
              <ChevronLeft size={18} />
              <span>Prev</span>
            </button>

            {isFlipped ? (
              <div className="sm2-rating-buttons">
                <button className="btn btn-hard" onClick={() => handleRating(1)}>
                  <X size={16} />
                  <span>Hard (Again Soon)</span>
                </button>
                <button className="btn btn-easy" onClick={() => handleRating(5)}>
                  <Check size={16} />
                  <span>Easy (Passed)</span>
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsFlipped(true)}>
                <RotateCw size={16} />
                <span>Reveal Answer</span>
              </button>
            )}

            <button className="btn btn-secondary" onClick={handleNext}>
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>

        </div>

        {/* Right Side: Interactive Deck Index Navigator */}
        <div className="deck-navigator-sidebar">
          <div className="sidebar-header">
            <h3>Deck Navigator</h3>
            <span className="count-tag">{totalCards} Cards</span>
          </div>

          <div className="deck-cards-list">
            {cards.map((card, idx) => {
              const status = sessionReviewed[card.id];
              const isSelected = idx === currentIndex;

              return (
                <button 
                  key={idx}
                  className={`deck-item-btn ${isSelected ? 'selected' : ''} ${status ? status : ''}`}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsFlipped(false);
                  }}
                >
                  <div className="item-num">{idx + 1}</div>
                  <div className="item-content">
                    <span className="item-text">{card.front}</span>
                  </div>
                  {status === 'easy' && <Check size={14} className="status-icon easy" />}
                  {status === 'hard' && <X size={14} className="status-icon hard" />}
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
