import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'study_assistant_saved_kits_v1';

export function useSavedKits() {
  const [savedKits, setSavedKits] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Failed to parse saved kits from localStorage", err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedKits));
    } catch (err) {
      console.error("Failed to save kits to localStorage", err);
    }
  }, [savedKits]);

  // Save or update a kit
  const saveKit = useCallback((studySet) => {
    if (!studySet || !studySet.topic) return;

    setSavedKits(prev => {
      const existingIdx = prev.findIndex(k => k.topic.toLowerCase() === studySet.topic.toLowerCase());
      const flashcardCount = studySet.blocks?.find(b => b.type === 'flashcard_deck')?.items?.length || 0;
      const quizCount = (studySet.blocks || [])
        .filter(b => ['mcq', 'true_false', 'fill_blank'].includes(b.type))
        .reduce((acc, b) => acc + (b.items?.length || 0), 0);

      const kitObj = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `kit-${Date.now()}`,
        topic: studySet.topic,
        concepts: studySet.concepts || [],
        createdAt: existingIdx >= 0 ? prev[existingIdx].createdAt : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        flashcardCount,
        quizCount,
        cardsReviewed: existingIdx >= 0 ? prev[existingIdx].cardsReviewed : 0,
        quizAccuracy: existingIdx >= 0 ? prev[existingIdx].quizAccuracy : 0,
        completedPercent: existingIdx >= 0 ? prev[existingIdx].completedPercent : 10,
        studySet
      };

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = kitObj;
        return updated;
      } else {
        return [kitObj, ...prev];
      }
    });
  }, []);

  // Update progress for a topic
  const updateKitProgress = useCallback((topicName, { cardsReviewedDelta, quizAccuracyVal }) => {
    if (!topicName) return;

    setSavedKits(prev => {
      return prev.map(kit => {
        if (kit.topic.toLowerCase() === topicName.toLowerCase()) {
          const newCardsReviewed = Math.min(kit.flashcardCount, (kit.cardsReviewed || 0) + (cardsReviewedDelta || 0));
          const newQuizAcc = quizAccuracyVal !== undefined ? quizAccuracyVal : kit.quizAccuracy;
          
          const cardRatio = kit.flashcardCount > 0 ? (newCardsReviewed / kit.flashcardCount) * 50 : 0;
          const quizRatio = (newQuizAcc / 100) * 50;
          const completedPercent = Math.min(100, Math.round(cardRatio + quizRatio));

          return {
            ...kit,
            cardsReviewed: newCardsReviewed,
            quizAccuracy: newQuizAcc,
            completedPercent
          };
        }
        return kit;
      });
    });
  }, []);

  const deleteKit = useCallback((id) => {
    setSavedKits(prev => prev.filter(k => k.id !== id));
  }, []);

  return {
    savedKits,
    saveKit,
    updateKitProgress,
    deleteKit
  };
}
