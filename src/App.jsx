import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { ClaudeInputSection } from './components/ClaudeInputSection';
import { FlashcardDeck } from './components/FlashcardDeck';
import { QuizEngine } from './components/QuizEngine';
import { ProgressDashboard } from './components/ProgressDashboard';
import { DebugPanel } from './components/DebugPanel';
import { ShareExportModal } from './components/ShareExportModal';
import { ReviewSubjectModal } from './components/ReviewSubjectModal';
import { Sidebar } from './components/Sidebar';

import { useGenerate } from './hooks/useGenerate';
import { useSpacedRepetition } from './hooks/useSpacedRepetition';
import { useGamification } from './hooks/useGamification';
import { useSessionHistory } from './hooks/useSessionHistory';
import { useSavedKits } from './hooks/useSavedKits';
import { decodeShareableURL } from './utils/exportShare';

export default function App() {
  // App Navigation: 'create' (default study studio), 'flashcards', 'quiz', 'dashboard'
  const [activeTab, setActiveTab] = useState('create');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('study_assistant_theme') === 'dark';
  });
  const [showDebug, setShowDebug] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Business Logic Custom Hooks
  const { 
    generate, 
    cancel, 
    reset, 
    loading, 
    error, 
    data: studySet, 
    setData: setStudySet, 
    parseStatus 
  } = useGenerate();

  const { 
    savedKits, 
    saveKit, 
    updateKitProgress, 
    deleteKit 
  } = useSavedKits();

  const { 
    allCards,
    dueCards, 
    dueCount, 
    totalCount,
    importDeck, 
    reviewCard, 
    resetData: resetSM2 
  } = useSpacedRepetition();

  const { 
    xp, 
    level, 
    progressToNextLevel, 
    currentStreak, 
    longestStreak, 
    cardsReviewedTotal, 
    sessionsCompleted, 
    unlockedBadges, 
    badgeDefinitions, 
    recentBadgeToast, 
    awardXP, 
    logCardReviewed, 
    logSessionComplete 
  } = useGamification();

  const { 
    history, 
    rollingAverageAccuracy, 
    topicsNeedingImprovement, 
    accuracyOverTime, 
    recordSession, 
    clearHistory 
  } = useSessionHistory();

  // Dark Mode toggle effect
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('study_assistant_theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('study_assistant_theme', 'light');
    }
  }, [darkMode]);

  // Decode shared URL set param on startup
  useEffect(() => {
    const sharedData = decodeShareableURL();
    if (sharedData && sharedData.topic && sharedData.blocks) {
      setStudySet(sharedData);
      setActiveTab('flashcards');
    }
  }, [setStudySet]);

  // Automatically import cards, save kit, and redirect to flashcards tab when set is generated
  useEffect(() => {
    if (studySet && studySet.blocks) {
      const flashcardBlock = studySet.blocks.find(b => b.type === 'flashcard_deck');
      if (flashcardBlock && flashcardBlock.items) {
        importDeck(flashcardBlock.items, studySet.topic);
      }
      saveKit(studySet);
      setActiveTab('flashcards');
    }
  }, [studySet, importDeck, saveKit]);

  const handleStartGenerate = (text, topicHint, numCards, numQuizzes, options) => {
    generate(text, topicHint, numCards, numQuizzes, options);
  };


  const handleInjectDebug = (overrideType) => {
    generate("Sample study notes for debug testing", "Debug Mode", 6, 5, overrideType);
    setShowDebug(false);
  };

  /**
   * Handle user selecting a specific subject from ReviewSubjectModal
   */
  const handleSelectSubjectForReview = useCallback((selectedTopic, mode = 'due') => {
    setShowReviewModal(false);

    // If specific topic is chosen and exists in savedKits, load that exact saved set!
    if (selectedTopic !== 'ALL') {
      const matchedKit = savedKits.find(k => k.topic.toLowerCase() === selectedTopic.toLowerCase());
      if (matchedKit && matchedKit.studySet) {
        setStudySet(matchedKit.studySet);
        setActiveTab('flashcards');
        return;
      }
    }

    // Otherwise filter cards by topic or 'ALL'
    const sourceCards = mode === 'due' ? (dueCards.length > 0 ? dueCards : allCards) : allCards;
    const cardsToUse = selectedTopic === 'ALL'
      ? sourceCards
      : sourceCards.filter(c => (c.topic || c.sm2?.topic || '').toLowerCase() === selectedTopic.toLowerCase());

    if (!cardsToUse || cardsToUse.length === 0) return;

    // Build Flashcard items
    const flashcardItems = cardsToUse.map((c, i) => ({
      id: c.id || `rev-fc-${i}`,
      front: c.front,
      back: c.back,
      sm2: c
    }));

    // Build Quiz items (MCQ, True/False)
    const mcqItems = cardsToUse.map((c, i) => ({
      id: `rev-mcq-${i}`,
      question: `Review Q${i + 1}: ${c.front}`,
      options: [
        c.back,
        "Incorrect Distractor 1",
        "Incorrect Distractor 2",
        "Incorrect Distractor 3"
      ],
      answer: c.back,
      explanation: `Correct answer: "${c.back}". Active recall reinforces long-term memory.`
    }));

    const tfItems = cardsToUse.slice(0, 5).map((c, i) => ({
      id: `rev-tf-${i}`,
      question: `True or False: "${c.front}" is directly answered by "${c.back}"?`,
      answer: true,
      explanation: `True! ${c.back}`
    }));

    const virtualSet = {
      topic: selectedTopic === 'ALL' ? 'Mixed Subject Review' : `${selectedTopic} Review`,
      concepts: [selectedTopic, 'Spaced Repetition Review'],
      blocks: [
        {
          type: 'flashcard_deck',
          title: 'Review Flashcard Deck',
          items: flashcardItems
        },
        {
          type: 'mcq',
          title: 'Review Quiz Arena',
          items: mcqItems
        },
        {
          type: 'true_false',
          title: 'Review True/False Check',
          items: tfItems
        }
      ]
    };

    setStudySet(virtualSet);
    setActiveTab('flashcards');
  }, [savedKits, dueCards, allCards]);

  const handleSelectStudySpace = () => {
    setStudySet(null);
    setActiveTab('create');
  };

  const handleLoadSavedKit = (kit) => {
    if (!kit || !kit.studySet) return;
    setStudySet(kit.studySet);
    setActiveTab('flashcards');
  };

  const handleReviewCardLog = (cardId, isCorrect) => {
    logCardReviewed(cardId, isCorrect);
    if (studySet?.topic) {
      updateKitProgress(studySet.topic, { cardsReviewedDelta: 1 });
    }
  };

  const handleRecordQuizSession = (sessionData) => {
    recordSession(sessionData);
    if (studySet?.topic && sessionData.totalQuestions > 0) {
      const accuracy = Math.round((sessionData.correctCount / sessionData.totalQuestions) * 100);
      updateKitProgress(studySet.topic, { quizAccuracyVal: accuracy });
    }
  };

  // Extract flashcard items & quiz count
  const currentFlashcards = studySet?.blocks?.find(b => b.type === 'flashcard_deck')?.items || [];
  const currentQuizCount = (studySet?.blocks || [])
    .filter(b => ['mcq', 'true_false', 'fill_blank'].includes(b.type))
    .reduce((acc, b) => acc + (b.items?.length || 0), 0);

  const isHome = activeTab === 'home';
  const showSidebar = sidebarOpen && !isHome;

  return (
    <div className={`app-layout-container ${showSidebar ? 'sidebar-open' : 'sidebar-closed'} ${isHome ? 'layout-home' : ''}`}>
      
      {/* ChatGPT-Style Left Navigation & History Sidebar (Hidden on Homepage) */}
      {!isHome && (
        <Sidebar 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          savedKits={savedKits}
          onLoadSavedKit={handleLoadSavedKit}
          onDeleteSavedKit={deleteKit}
          onNewPrompt={handleSelectStudySpace}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentTopic={studySet?.topic}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          xp={xp}
          level={level}
          currentStreak={currentStreak}
          dueCount={dueCount}
          onStartDueReview={() => setShowReviewModal(true)}
          flashcardCount={currentFlashcards.length}
          quizCount={currentQuizCount}
          hasStudySet={!!studySet}
        />
      )}

      <div className="app-main-viewport">
        
        {/* Top Minimal Header Bar (Gamification stats) */}
        <Header 
          xp={xp}
          level={level}
          progressToNextLevel={progressToNextLevel}
          currentStreak={currentStreak}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Main Content Workspace */}
        <main className="main-content focus-study-workspace">
        
        {/* Dev Debug Panel Overlay */}
        {showDebug && (
          <DebugPanel 
            onInjectDebug={handleInjectDebug}
            onClose={() => setShowDebug(false)}
          />
        )}

        {/* Section 1: Landing Page Homepage */}
        {activeTab === 'home' && (
          <LandingPage 
            onLaunchDashboard={() => handleSelectStudySpace()}
          />
        )}

        {/* Section 2: Claude AI Generator (Prompting Page) */}
        {activeTab === 'create' && (
          <div className="claude-space-container">
            <ClaudeInputSection 
              onGenerate={handleStartGenerate}
              loading={loading}
              parseStatus={parseStatus}
              error={error}
              onClearError={() => reset ? reset() : null}
              currentStreak={currentStreak}
              xp={xp}
              level={level}
              savedKits={savedKits}
              onLoadSavedKit={handleLoadSavedKit}
              onDeleteSavedKit={deleteKit}
            />
          </div>
        )}

        {/* Section 3: Standalone Flashcards Section */}
        {activeTab === 'flashcards' && (
          <div className="standalone-workspace-container">
            <FlashcardDeck 
              cards={currentFlashcards}
              topic={studySet?.topic || 'Flashcard Deck'}
              onReviewCard={reviewCard}
              onCardReviewedLog={handleReviewCardLog}
              onOpenShareModal={() => setShowShareModal(true)}
              onNewPrompt={handleSelectStudySpace}
              onRevisitAll={() => setShowReviewModal(true)}
              totalCompletedCardsCount={totalCount}
            />
          </div>
        )}

        {/* Section 4: Standalone Quiz Arena Section */}
        {activeTab === 'quiz' && (
          <div className="standalone-workspace-container">
            <QuizEngine 
              blocks={studySet?.blocks || []}
              topic={studySet?.topic || 'Quiz Arena'}
              onRecordSession={handleRecordQuizSession}
              onAwardXP={awardXP}
              onLogSessionComplete={logSessionComplete}
              onOpenShareModal={() => setShowShareModal(true)}
              onNewPrompt={handleSelectStudySpace}
              onRevisitAll={() => setShowReviewModal(true)}
              totalCompletedCardsCount={totalCount}
            />
          </div>
        )}

        {/* Section 5: Performance Analytics & Progress Dashboard */}
        {activeTab === 'dashboard' && (
          <ProgressDashboard 
            history={history}
            rollingAverageAccuracy={rollingAverageAccuracy}
            topicsNeedingImprovement={topicsNeedingImprovement}
            accuracyOverTime={accuracyOverTime}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            cardsReviewedTotal={cardsReviewedTotal}
            sessionsCompleted={sessionsCompleted}
            unlockedBadges={unlockedBadges}
            badgeDefinitions={badgeDefinitions}
            onClearHistory={clearHistory}
          />
        )}

      </main>

      {/* Review Subject Selector Modal */}
      {showReviewModal && (
        <ReviewSubjectModal 
          savedKits={savedKits}
          allCards={allCards}
          dueCards={dueCards}
          onSelectSubject={handleSelectSubjectForReview}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {/* Share / Export Modal */}
      {showShareModal && (
        <ShareExportModal 
          studySet={studySet}
          onImportSet={(imported) => {
            setStudySet(imported);
            setActiveTab('flashcards');
          }}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Celebratory Badge Unlock Toast */}
      {recentBadgeToast && (
        <div className="toast-container">
          <div className="badge-toast">
            <span style={{ fontSize: '1.8rem' }}>{recentBadgeToast.icon}</span>
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>Badge Unlocked!</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>{recentBadgeToast.name}: {recentBadgeToast.desc}</div>
            </div>
          </div>
        </div>
      )}

      </div>

    </div>
  );
}
