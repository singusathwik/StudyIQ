import { useState, useEffect, useCallback } from 'react';
import { calculateSM2, isCardDueToday } from '../utils/sm2';

const STORAGE_KEY = 'study_assistant_sm2_cards';

export function useSpacedRepetition() {
  const [cardsState, setCardsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load SM-2 state from localStorage:", e);
      return {};
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cardsState));
    } catch (e) {
      console.error("Failed to save SM-2 state to localStorage:", e);
    }
  }, [cardsState]);

  /**
   * Import flashcards from a newly generated deck into the SM-2 scheduler
   */
  const importDeck = useCallback((newCards = [], topicName = 'General') => {
    setCardsState(prev => {
      const nextState = { ...prev };
      newCards.forEach(card => {
        const id = card.id || `fc-${card.front.substring(0, 20)}`;
        if (!nextState[id]) {
          nextState[id] = {
            id,
            front: card.front,
            back: card.back,
            topic: topicName,
            repetition: 0,
            interval: 0,
            easeFactor: 2.5,
            lastReviewed: null,
            dueDate: Date.now() // Due immediately upon import
          };
        }
      });
      return nextState;
    });
  }, []);

  /**
   * Review a card with rating 'Easy' (5) or 'Hard' (2)
   */
  const reviewCard = useCallback((cardId, ratingName) => {
    const quality = ratingName === 'Easy' ? 5 : 2;
    setCardsState(prev => {
      const existingCard = prev[cardId];
      if (!existingCard) return prev;

      const sm2Update = calculateSM2(existingCard, quality);
      return {
        ...prev,
        [cardId]: {
          ...existingCard,
          ...sm2Update
        }
      };
    });
  }, []);

  /**
   * Get list of cards due for review today
   */
  const getDueCards = useCallback(() => {
    return Object.values(cardsState).filter(card => isCardDueToday(card));
  }, [cardsState]);

  /**
   * Reset all SM-2 spaced repetition data
   */
  const resetData = useCallback(() => {
    setCardsState({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const allCards = Object.values(cardsState);
  const dueCards = getDueCards();

  return {
    allCards,
    dueCards,
    dueCount: dueCards.length,
    totalCount: allCards.length,
    importDeck,
    reviewCard,
    getDueCards,
    resetData
  };
}
