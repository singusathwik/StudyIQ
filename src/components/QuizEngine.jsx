import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mic, 
  MicOff, 
  RotateCcw, 
  Award, 
  ArrowRight, 
  HelpCircle,
  Sparkles,
  Check,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export function QuizEngine({ 
  blocks = [], 
  topic = '', 
  onRecordSession, 
  onAwardXP, 
  onLogSessionComplete,
  onOpenShareModal,
  onNewPrompt,
  onRevisitAll,
  totalCompletedCardsCount = 0
}) {
  const initialQuestions = useRef([]);

  useEffect(() => {
    const list = [];
    (blocks || []).forEach(block => {
      if (['mcq', 'true_false', 'fill_blank'].includes(block.type)) {
        (block.items || []).forEach(item => {
          list.push({
            ...item,
            blockType: block.type,
            blockTitle: block.title
          });
        });
      }
    });
    initialQuestions.current = list;
    setActiveQuestions(list);
  }, [blocks]);

  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timerSetting, setTimerSetting] = useState(20);
  const [timeLeft, setTimeLeft] = useState(20);
  const [fillBlankInput, setFillBlankInput] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [wrongQuestionIds, setWrongQuestionIds] = useState([]);

  const { 
    isSupported: voiceSupported, 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    error: voiceError
  } = useSpeechRecognition();

  const currentQ = activeQuestions[currentIndex];
  const totalQ = activeQuestions.length;

  useEffect(() => {
    if (isFinished || !currentQ || timerSetting === 0 || showExplanation) return;

    setTimeLeft(timerSetting);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, isFinished, timerSetting, showExplanation]);

  useEffect(() => {
    if (!transcript || showExplanation || isFinished || !currentQ) return;

    const lowerTranscript = transcript.toLowerCase().trim();

    if (currentQ.blockType === 'mcq') {
      const matchOpt = (currentQ.options || []).find(opt => 
        lowerTranscript.includes(opt.toLowerCase()) || 
        opt.toLowerCase().includes(lowerTranscript)
      );
      if (matchOpt) {
        handleAnswerSubmit(matchOpt);
        stopListening();
      }
    } else if (currentQ.blockType === 'true_false') {
      if (lowerTranscript.includes('true') || lowerTranscript.includes('yes')) {
        handleAnswerSubmit(true);
        stopListening();
      } else if (lowerTranscript.includes('false') || lowerTranscript.includes('no')) {
        handleAnswerSubmit(false);
        stopListening();
      }
    }
  }, [transcript, currentQ, showExplanation, isFinished]);

  const handleTimeout = () => {
    if (!currentQ) return;
    processAnswer("[Timed Out]", false);
  };

  const handleAnswerSubmit = (selectedAnswer) => {
    if (showExplanation || !currentQ) return;

    let isCorrect = false;
    if (currentQ.blockType === 'mcq') {
      isCorrect = String(selectedAnswer).trim().toLowerCase() === String(currentQ.answer).trim().toLowerCase();
    } else if (currentQ.blockType === 'true_false') {
      isCorrect = Boolean(selectedAnswer) === Boolean(currentQ.answer);
    } else if (currentQ.blockType === 'fill_blank') {
      isCorrect = String(selectedAnswer).trim().toLowerCase() === String(currentQ.answer).trim().toLowerCase();
    }

    processAnswer(selectedAnswer, isCorrect);
  };

  const processAnswer = (answerVal, isCorrect) => {
    const qId = currentQ.id || `q-${currentIndex}`;

    setUserAnswers(prev => ({
      ...prev,
      [qId]: { answer: answerVal, isCorrect }
    }));

    if (isCorrect) {
      if (onAwardXP) onAwardXP(10, 'Correct Quiz Answer');
      advanceToNextQuestion();
    } else {
      setShowExplanation(true);
    }
  };

  const advanceToNextQuestion = () => {
    setShowExplanation(false);
    setFillBlankInput('');
    if (currentIndex < totalQ - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);

    let correctCount = 0;
    const wrongs = [];
    const wrongConceptTags = [];

    activeQuestions.forEach(q => {
      const qId = q.id || `q-${currentIndex}`;
      const record = userAnswers[qId];
      if (record && record.isCorrect) {
        correctCount++;
      } else {
        wrongs.push(q);
        wrongConceptTags.push(q.blockTitle || topic);
      }
    });

    const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
    setWrongQuestionIds(wrongs);

    if (onRecordSession) {
      onRecordSession({
        topic: topic || 'Quiz Session',
        totalQuestions: totalQ,
        correctCount,
        wrongConcepts: wrongConceptTags
      });
    }

    if (onLogSessionComplete) {
      onLogSessionComplete(accuracy === 100);
    }
  };

  const handleRetryWrong = () => {
    if (wrongQuestionIds.length === 0) return;

    setActiveQuestions([...wrongQuestionIds]);
    setCurrentIndex(0);
    setUserAnswers({});
    setShowExplanation(false);
    setIsFinished(false);
    setWrongQuestionIds([]);
  };

  const handleRestartFull = () => {
    setActiveQuestions([...initialQuestions.current]);
    setCurrentIndex(0);
    setUserAnswers({});
    setShowExplanation(false);
    setIsFinished(false);
    setWrongQuestionIds([]);
  };

  if (!activeQuestions || activeQuestions.length === 0) {
    return (
      <div className="quiz-empty glass-panel">
        <HelpCircle size={48} className="empty-icon" />
        <h3>No Quiz Questions Loaded</h3>
        <p>Use the AI Generator tab to create a study kit from your notes or PDF documents.</p>
      </div>
    );
  }

  // Refined Results Completion Screen
  if (isFinished) {
    const correctCount = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctCount / totalQ) * 100);
    const isPerfect = accuracy === 100;

    return (
      <div className="quiz-results-card glass-panel">
        
        {/* Results Banner Header */}
        <div className="results-header">
          <div className="award-badge-icon">
            <Award size={40} className={isPerfect ? 'perfect-award' : ''} />
          </div>
          <div className="header-text">
            <h2 className="results-title">Quiz Arena Completed!</h2>
            <p className="results-subtitle">Topic: <strong>{topic || 'Study Set'}</strong></p>
          </div>
        </div>

        {/* Score Summary Metrics Grid */}
        <div className="score-summary-grid">
          <div className="score-box highlight-accuracy">
            <span className="score-num">{accuracy}%</span>
            <span className="score-lbl">Accuracy</span>
          </div>
          <div className="score-box">
            <span className="score-num">{correctCount} / {totalQ}</span>
            <span className="score-lbl">Correct Answers</span>
          </div>
          <div className="score-box highlight-xp">
            <span className="score-num">+{isPerfect ? 150 : 50} XP</span>
            <span className="score-lbl">XP Earned</span>
          </div>
        </div>

        {/* Incorrect Questions Review Cards */}
        {wrongQuestionIds.length > 0 ? (
          <div className="wrong-questions-summary">
            <div className="wrong-summary-header">
              <XCircle size={20} className="text-danger" />
              <h3>Questions Needing Review ({wrongQuestionIds.length})</h3>
            </div>

            <div className="wrong-cards-list">
              {wrongQuestionIds.map((item, idx) => (
                <div key={idx} className="wrong-card-item">
                  <div className="wrong-q-header">
                    <span className="q-badge">Question {idx + 1}</span>
                    <h4 className="wrong-q-title">{item.question}</h4>
                  </div>
                  <div className="wrong-ans-row">
                    <span className="ans-tag correct">Correct Answer: {String(item.answer)}</span>
                  </div>
                  <p className="wrong-explanation">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="perfect-score-banner">
            <Sparkles size={24} className="sparkle-gold" />
            <span>Outstanding! You answered 100% of questions correctly!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="results-actions">
          {wrongQuestionIds.length > 0 && (
            <button className="btn btn-warning btn-lg" onClick={handleRetryWrong}>
              <RotateCcw size={18} />
              <span>Retry Only Wrong Answers ({wrongQuestionIds.length})</span>
            </button>
          )}

          <button className="btn btn-primary btn-lg" onClick={handleRestartFull}>
            <RotateCcw size={18} />
            <span>Restart Entire Quiz</span>
          </button>
        </div>

      </div>
    );
  }

  const qId = currentQ.id || `q-${currentIndex}`;
  const currentUserRecord = userAnswers[qId];

  return (
    <div className="quiz-standalone-section glass-panel">
      
      {/* Quiz Section Banner Header */}
      <div className="quiz-section-header">
        <div className="header-meta">
          <span className="section-badge">
            <HelpCircle size={14} />
            <span>QUIZ ARENA</span>
          </span>
          <h2 className="quiz-main-title">{topic || 'Quiz Arena'}</h2>
        </div>

        <div className="header-actions-row">
          {onRevisitAll && totalCompletedCardsCount > 0 && (
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onRevisitAll}
              title="Revisit all questions in your completed library"
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

      {/* Main Quiz Stage + Question Progress Sidebar */}
      <div className="quiz-workspace-stage">
        
        {/* Left Stage: Main Active Question */}
        <div className="quiz-card-stage">
          
          <div className="quiz-toolbar">
            <div className="quiz-progress-badge">
              <span>Question {currentIndex + 1} of {totalQ}</span>
              <span className="q-type-tag">{currentQ.blockType?.toUpperCase()}</span>
            </div>

            {/* Timer Controls */}
            <div className="timer-controls">
              <Clock size={16} />
              <select 
                value={timerSetting} 
                onChange={(e) => setTimerSetting(Number(e.target.value))}
                className="timer-select"
              >
                <option value={10}>10s Timer</option>
                <option value={20}>20s Timer</option>
                <option value={30}>30s Timer</option>
                <option value={0}>Timer Off</option>
              </select>

              {timerSetting > 0 && (
                <span className={`timer-countdown ${timeLeft <= 5 ? 'urgent' : ''}`}>
                  {timeLeft}s
                </span>
              )}
            </div>

            {/* Voice Quiz Toggle */}
            <div className="voice-control">
              {voiceSupported ? (
                <button 
                  className={`voice-btn ${isListening ? 'listening' : ''}`}
                  onClick={isListening ? stopListening : startListening}
                  title={isListening ? "Listening... Speak your answer" : "Click to answer by voice"}
                >
                  {isListening ? <Mic size={16} className="pulse-icon" /> : <MicOff size={16} />}
                  <span>{isListening ? "Listening..." : "Voice Quiz"}</span>
                </button>
              ) : (
                <span className="voice-unsupported" title="Web Speech API not supported in browser">
                  Voice Unavailable
                </span>
              )}
            </div>
          </div>

          {voiceError && <div className="alert-box alert-warning small">{voiceError}</div>}

          {/* Question Text */}
          <div className="quiz-question-box">
            <h3 className="question-text">{currentQ.question}</h3>
          </div>

          {/* Question Type Renderers */}
          <div className="quiz-options-container">
            
            {/* MCQ Options */}
            {currentQ.blockType === 'mcq' && (
              <div className="mcq-grid">
                {(currentQ.options || []).map((opt, idx) => {
                  const selected = currentUserRecord?.answer === opt;
                  return (
                    <button
                      key={idx}
                      className={`option-card ${selected ? 'selected' : ''}`}
                      onClick={() => handleAnswerSubmit(opt)}
                      disabled={showExplanation}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                      <span className="option-text">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* True / False Buttons */}
            {currentQ.blockType === 'true_false' && (
              <div className="tf-grid">
                <button 
                  className="tf-btn true-btn"
                  onClick={() => handleAnswerSubmit(true)}
                  disabled={showExplanation}
                >
                  <CheckCircle size={24} />
                  <span>TRUE</span>
                </button>

                <button 
                  className="tf-btn false-btn"
                  onClick={() => handleAnswerSubmit(false)}
                  disabled={showExplanation}
                >
                  <XCircle size={24} />
                  <span>FALSE</span>
                </button>
              </div>
            )}

            {/* Fill in the Blank Input */}
            {currentQ.blockType === 'fill_blank' && (
              <form 
                className="fill-blank-stylish-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (fillBlankInput.trim()) {
                    handleAnswerSubmit(fillBlankInput.trim());
                  }
                }}
              >
                <div className="fill-input-wrapper">
                  <input 
                    type="text"
                    className="fill-blank-input-field"
                    placeholder="Type your answer for the missing word..."
                    value={fillBlankInput}
                    onChange={(e) => setFillBlankInput(e.target.value)}
                    disabled={showExplanation}
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary fill-submit-btn"
                    disabled={showExplanation || !fillBlankInput.trim()}
                  >
                    <span>Submit Answer</span>
                    <Check size={16} />
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Refined AI Explanation Modal */}
          {showExplanation && (
            <div className="refined-explanation-card">
              <div className="explanation-card-header">
                <XCircle size={22} className="text-danger" />
                <div>
                  <h4>Incorrect Answer</h4>
                  <p className="explanation-subhead">Let's review why this answer was wrong before moving forward.</p>
                </div>
              </div>

              <div className="explanation-badges-row">
                {currentUserRecord && (
                  <div className="answer-badge wrong-badge">
                    <span className="badge-lbl">YOUR ANSWER:</span>
                    <span className="badge-val">{String(currentUserRecord.answer)}</span>
                  </div>
                )}
                <div className="answer-badge correct-badge">
                  <span className="badge-lbl">CORRECT ANSWER:</span>
                  <span className="badge-val">{String(currentQ.answer)}</span>
                </div>
              </div>

              <div className="explanation-detail-body">
                <span className="detail-title">AI Explanation:</span>
                <p className="detail-text">{currentQ.explanation}</p>
              </div>

              <button className="btn btn-primary advance-btn" onClick={advanceToNextQuestion}>
                <span>Continue to Next Question</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Question List Navigator */}
        <div className="quiz-navigator-sidebar">
          <div className="sidebar-header">
            <h3>Question Navigator</h3>
            <span className="count-tag">{totalQ} Qs</span>
          </div>

          <div className="quiz-questions-list">
            {activeQuestions.map((q, idx) => {
              const rec = userAnswers[q.id || `q-${idx}`];
              const isSelected = idx === currentIndex;

              return (
                <button 
                  key={idx}
                  className={`quiz-item-btn ${isSelected ? 'selected' : ''} ${rec ? (rec.isCorrect ? 'correct' : 'wrong') : ''}`}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowExplanation(false);
                  }}
                >
                  <div className="item-num">{idx + 1}</div>
                  <div className="item-content">
                    <span className="item-type">{q.blockType?.toUpperCase()}</span>
                    <span className="item-text">{q.question}</span>
                  </div>
                  {rec?.isCorrect === true && <Check size={14} className="status-icon easy" />}
                  {rec?.isCorrect === false && <XCircle size={14} className="status-icon hard" />}
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
