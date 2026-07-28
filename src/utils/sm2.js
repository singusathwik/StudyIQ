/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * 
 * Quality Ratings:
 * 5 - Easy (Perfect response with zero hesitation)
 * 2 - Hard (Correct with difficulty or incorrect recall)
 */

export function calculateSM2(currentCardState = {}, qualityRating) {
  const {
    repetition = 0,
    interval = 0,
    easeFactor = 2.5
  } = currentCardState;

  const q = Math.max(0, Math.min(5, qualityRating));

  let nextRepetition = repetition;
  let nextInterval = interval;
  let nextEaseFactor = easeFactor;

  if (q >= 3) {
    if (repetition === 0) {
      nextInterval = 1;
    } else if (repetition === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetition = repetition + 1;
  } else {
    // Hard / Failed recall resets repetitions
    nextRepetition = 0;
    nextInterval = 1;
  }

  // Calculate new Ease Factor (EF)
  nextEaseFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (nextEaseFactor < 1.3) {
    nextEaseFactor = 1.3;
  }

  const now = Date.now();
  const nextDueDate = now + nextInterval * 24 * 60 * 60 * 1000;

  return {
    repetition: nextRepetition,
    interval: nextInterval,
    easeFactor: parseFloat(nextEaseFactor.toFixed(2)),
    lastReviewed: now,
    dueDate: nextDueDate
  };
}

export function isCardDueToday(card) {
  if (!card || !card.dueDate) return true; // New cards are due immediately
  const todayEnd = new Date().setHours(23, 59, 59, 999);
  return card.dueDate <= todayEnd;
}

export function formatInterval(intervalDays) {
  if (!intervalDays || intervalDays <= 1) return '1 day';
  if (intervalDays < 30) return `${intervalDays} days`;
  const months = Math.round(intervalDays / 30);
  return `${months} mo${months > 1 ? 's' : ''}`;
}
