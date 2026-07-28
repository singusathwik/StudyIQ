import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'study_assistant_gamification';

const BADGE_DEFINITIONS = [
  { id: 'first_step', name: 'First Step', desc: 'Completed your 1st study session', icon: '🚀' },
  { id: 'perfect_quiz', name: 'Perfect Score', desc: 'Scored 100% on a quiz', icon: '🎯' },
  { id: 'streak_3', name: '3-Day Streak', desc: 'Studied 3 days in a row', icon: '🔥' },
  { id: 'streak_7', name: '7-Day Streak', desc: 'Studied 7 days in a row', icon: '⚡' },
  { id: 'cards_50', name: 'Flashcard Scholar', desc: 'Reviewed 50 flashcards', icon: '🃏' },
  { id: 'cards_100', name: 'Master Scholar', desc: 'Reviewed 100 flashcards', icon: '🏆' },
  { id: 'level_5', name: 'Brain Power V', desc: 'Reached Level 5', icon: '🧠' }
];

export function useGamification() {
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load gamification data:", e);
    }
    return {
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      cardsReviewedTotal: 0,
      unlockedBadges: [],
      sessionsCompleted: 0
    };
  });

  const [recentBadgeToast, setRecentBadgeToast] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error("Failed to save gamification data:", e);
    }
  }, [stats]);

  // Compute Level details
  const level = Math.floor(Math.sqrt(stats.xp / 50)) + 1;
  const currentLevelBaseXP = 50 * Math.pow(level - 1, 2);
  const nextLevelXP = 50 * Math.pow(level, 2);
  const xpInCurrentLevel = stats.xp - currentLevelBaseXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelBaseXP;
  const progressToNextLevel = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)));

  /**
   * Helper to trigger confetti celebration
   */
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignored if confetti unavailable
    }
  };

  /**
   * Internal checker to unlock eligible badges
   */
  const checkBadges = useCallback((currentStats, currentLevel) => {
    const newlyUnlocked = [];
    const unlockedSet = new Set(currentStats.unlockedBadges);

    if (!unlockedSet.has('first_step') && currentStats.sessionsCompleted >= 1) {
      newlyUnlocked.push('first_step');
    }
    if (!unlockedSet.has('streak_3') && currentStats.currentStreak >= 3) {
      newlyUnlocked.push('streak_3');
    }
    if (!unlockedSet.has('streak_7') && currentStats.currentStreak >= 7) {
      newlyUnlocked.push('streak_7');
    }
    if (!unlockedSet.has('cards_50') && currentStats.cardsReviewedTotal >= 50) {
      newlyUnlocked.push('cards_50');
    }
    if (!unlockedSet.has('cards_100') && currentStats.cardsReviewedTotal >= 100) {
      newlyUnlocked.push('cards_100');
    }
    if (!unlockedSet.has('level_5') && currentLevel >= 5) {
      newlyUnlocked.push('level_5');
    }

    if (newlyUnlocked.length > 0) {
      triggerCelebration();
      const firstBadgeDef = BADGE_DEFINITIONS.find(b => b.id === newlyUnlocked[0]);
      if (firstBadgeDef) {
        setRecentBadgeToast(firstBadgeDef);
        setTimeout(() => setRecentBadgeToast(null), 4000);
      }

      return [...currentStats.unlockedBadges, ...newlyUnlocked];
    }
    return currentStats.unlockedBadges;
  }, []);

  /**
   * Record a daily study check-in and update streaks
   */
  const recordDailyCheckIn = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    
    setStats(prev => {
      if (prev.lastStudyDate === today) return prev; // Already recorded today

      let newStreak = 1;
      if (prev.lastStudyDate) {
        const lastDate = new Date(prev.lastStudyDate);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak = prev.currentStreak + 1; // Consecutive day
        } else if (diffDays === 0) {
          newStreak = prev.currentStreak;
        }
      }

      const updatedStreak = newStreak;
      const updatedLongest = Math.max(prev.longestStreak, updatedStreak);
      const streakBonusXP = updatedStreak > prev.currentStreak ? 30 : 0;

      const updatedStats = {
        ...prev,
        currentStreak: updatedStreak,
        longestStreak: updatedLongest,
        lastStudyDate: today,
        xp: prev.xp + streakBonusXP
      };

      const newLevel = Math.floor(Math.sqrt(updatedStats.xp / 50)) + 1;
      updatedStats.unlockedBadges = checkBadges(updatedStats, newLevel);

      return updatedStats;
    });
  }, [checkBadges]);

  /**
   * Award XP and update session activity
   */
  const awardXP = useCallback((amount, reason = '') => {
    recordDailyCheckIn();

    setStats(prev => {
      const nextXP = prev.xp + amount;
      const newLevel = Math.floor(Math.sqrt(nextXP / 50)) + 1;

      const updatedStats = { ...prev, xp: nextXP };
      updatedStats.unlockedBadges = checkBadges(updatedStats, newLevel);

      return updatedStats;
    });
  }, [recordDailyCheckIn, checkBadges]);

  /**
   * Log card review completion
   */
  const logCardReviewed = useCallback(() => {
    awardXP(5, 'Flashcard Reviewed');
    setStats(prev => ({
      ...prev,
      cardsReviewedTotal: prev.cardsReviewedTotal + 1
    }));
  }, [awardXP]);

  /**
   * Log full session completion
   */
  const logSessionComplete = useCallback((isPerfectQuiz = false) => {
    awardXP(50, 'Session Completed');
    if (isPerfectQuiz) {
      awardXP(100, 'Perfect Quiz Bonus');
    }

    setStats(prev => {
      const updated = {
        ...prev,
        sessionsCompleted: prev.sessionsCompleted + 1,
        unlockedBadges: isPerfectQuiz && !prev.unlockedBadges.includes('perfect_quiz')
          ? [...prev.unlockedBadges, 'perfect_quiz']
          : prev.unlockedBadges
      };
      if (isPerfectQuiz && !prev.unlockedBadges.includes('perfect_quiz')) {
        triggerCelebration();
        setRecentBadgeToast(BADGE_DEFINITIONS.find(b => b.id === 'perfect_quiz'));
        setTimeout(() => setRecentBadgeToast(null), 4000);
      }
      return updated;
    });
  }, [awardXP]);

  return {
    xp: stats.xp,
    level,
    progressToNextLevel,
    xpNeededForNextLevel,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    cardsReviewedTotal: stats.cardsReviewedTotal,
    sessionsCompleted: stats.sessionsCompleted,
    unlockedBadges: stats.unlockedBadges,
    badgeDefinitions: BADGE_DEFINITIONS,
    recentBadgeToast,
    awardXP,
    logCardReviewed,
    logSessionComplete
  };
}
