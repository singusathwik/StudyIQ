import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export function ReviewSubjectModal({ 
  savedKits = [], 
  allCards = [], 
  dueCards = [], 
  onSelectSubject, 
  onClose 
}) {
  const [activeFilter, setActiveFilter] = useState('due'); // 'due' or 'all'

  // Extract unique topics from savedKits and allCards
  const topicMap = {};

  // Map from savedKits
  savedKits.forEach(kit => {
    if (!kit.topic) return;
    const key = kit.topic.trim();
    if (!topicMap[key]) {
      topicMap[key] = {
        topic: kit.topic,
        kit,
        flashcardCount: kit.flashcardCount || 0,
        quizCount: kit.quizCount || 0,
        completedPercent: kit.completedPercent || 0,
        dueCardsCount: 0
      };
    }
  });

  // Calculate due cards count per topic
  dueCards.forEach(card => {
    const topic = card.topic || card.sm2?.topic || 'General';
    const key = topic.trim();
    if (!topicMap[key]) {
      topicMap[key] = {
        topic,
        kit: null,
        flashcardCount: 0,
        quizCount: 0,
        completedPercent: 0,
        dueCardsCount: 0
      };
    }
    topicMap[key].dueCardsCount += 1;
  });

  const topicsList = Object.values(topicMap);
  const topicsWithDueCards = topicsList.filter(t => t.dueCardsCount > 0);

  const displayList = activeFilter === 'due' ? topicsWithDueCards : topicsList;

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-panel review-subject-modal">
        
        {/* Header */}
        <div className="modal-header">
          <div className="lib-title-row">
            <BookOpen size={22} className="text-accent" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Select Subject to Review</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="modal-filter-tabs">
          <button 
            className={`filter-tab-btn ${activeFilter === 'due' ? 'active' : ''}`}
            onClick={() => setActiveFilter('due')}
          >
            <Clock size={15} />
            <span>Due Today ({topicsWithDueCards.length})</span>
          </button>

          <button 
            className={`filter-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <BookOpen size={15} />
            <span>All Saved Subjects ({topicsList.length})</span>
          </button>
        </div>

        {/* All Subjects Combined Quick Banner */}
        <div 
          className="all-mixed-card"
          onClick={() => onSelectSubject('ALL', activeFilter)}
        >
          <div className="mixed-left">
            <Sparkles size={20} className="text-gold" />
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '0.98rem' }}>All Subjects (Mixed Review)</h4>
              <p style={{ fontSize: '0.78rem', opacity: 0.8 }}>Review combined flashcards & quizzes from all topics</p>
            </div>
          </div>
          <button className="btn btn-primary btn-sm">
            <span>Start All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* List of Subjects */}
        <div className="subjects-scroll-list">
          {displayList.length > 0 ? (
            displayList.map((item, idx) => (
              <div key={idx} className="subject-item-card">
                
                <div className="sub-info">
                  <h4 className="sub-title">{item.topic}</h4>
                  <div className="sub-meta">
                    {item.dueCardsCount > 0 && (
                      <span className="due-tag"><Clock size={12} /> {item.dueCardsCount} Due</span>
                    )}
                    {item.flashcardCount > 0 && (
                      <span className="meta-pill"><Layers size={12} /> {item.flashcardCount} Cards</span>
                    )}
                    {item.quizCount > 0 && (
                      <span className="meta-pill"><HelpCircle size={12} /> {item.quizCount} Quizzes</span>
                    )}
                  </div>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => onSelectSubject(item.topic, activeFilter)}
                >
                  <span>Review</span>
                  <ArrowRight size={14} />
                </button>

              </div>
            ))
          ) : (
            <div className="chart-empty">
              {activeFilter === 'due' 
                ? "No cards are due for review today! Switch to 'All Saved Subjects' to revisit past cards." 
                : "No saved study subjects found yet. Use AI Generator to create your first kit!"}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
