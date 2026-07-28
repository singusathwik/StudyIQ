import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'study_assistant_session_history';

export function useSessionHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load session history from localStorage:", e);
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save session history to localStorage:", e);
    }
  }, [history]);

  /**
   * Record a completed quiz / study session
   */
  const recordSession = useCallback(({ topic, totalQuestions, correctCount, wrongConcepts = [] }) => {
    if (totalQuestions <= 0) return;

    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const newEntry = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      topic: topic || 'Study Material',
      totalQuestions,
      correctCount,
      accuracy,
      wrongConcepts: Array.isArray(wrongConcepts) ? wrongConcepts : []
    };

    setHistory(prev => [newEntry, ...prev]);
  }, []);

  /**
   * Compute rolling average accuracy across all sessions
   */
  const rollingAverageAccuracy = useMemo(() => {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, sess) => acc + sess.accuracy, 0);
    return Math.round(sum / history.length);
  }, [history]);

  /**
   * Aggregate wrong answers per concept/tag to identify weak topics
   */
  const topicsNeedingImprovement = useMemo(() => {
    const conceptErrorCounts = {};

    history.forEach(session => {
      // If specific wrong concepts were logged
      if (session.wrongConcepts && session.wrongConcepts.length > 0) {
        session.wrongConcepts.forEach(concept => {
          conceptErrorCounts[concept] = (conceptErrorCounts[concept] || 0) + 1;
        });
      } else if (session.accuracy < 100) {
        // Fall back to session topic if concept tags absent
        const topicName = session.topic;
        const errors = session.totalQuestions - session.correctCount;
        conceptErrorCounts[topicName] = (conceptErrorCounts[topicName] || 0) + errors;
      }
    });

    return Object.entries(conceptErrorCounts)
      .map(([concept, wrongCount]) => ({ concept, wrongCount }))
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, 6);
  }, [history]);

  /**
   * Format chronological data points for Recharts line chart
   */
  const accuracyOverTime = useMemo(() => {
    return [...history]
      .reverse()
      .slice(-10) // Show last 10 sessions
      .map(session => ({
        date: session.displayDate,
        accuracy: session.accuracy,
        topic: session.topic
      }));
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    rollingAverageAccuracy,
    topicsNeedingImprovement,
    accuracyOverTime,
    recordSession,
    clearHistory
  };
}
