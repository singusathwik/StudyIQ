"""
Spaced Repetition Engine (SuperMemo SM-2 Algorithm)
Calculates optimal review intervals, ease factors, and card mastery metrics.
"""

from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Tuple


def get_current_utc() -> datetime:
    """Returns current datetime in UTC timezone."""
    return datetime.now(timezone.utc)


def init_card_sm2(card_id: str, front: str, back: str, tag: str = "General") -> Dict[str, Any]:
    """
    Initializes a new flashcard with default SuperMemo SM-2 parameters.
    """
    now_iso = get_current_utc().isoformat()
    return {
        "id": card_id,
        "front": front,
        "back": back,
        "tag": tag,
        "repetition_count": 0,
        "ease_factor": 2.5,
        "interval_days": 1,
        "next_review": now_iso,
        "last_reviewed": None,
        "mastery_score": 0.0,  # 0 to 100%
        "total_reviews": 0,
        "lapse_count": 0
    }


def calculate_sm2(
    quality: int,
    repetition_count: int,
    ease_factor: float,
    interval_days: int
) -> Tuple[int, float, int, float]:
    """
    Core SuperMemo SM-2 calculation.
    
    Parameters:
    - quality: Integer rating from 0 (complete blackout) to 5 (perfect recall).
               1: Again / Failed
               3: Hard
               4: Good
               5: Easy
    - repetition_count: Consecutive successful repetitions.
    - ease_factor: Current ease factor (minimum 1.3).
    - interval_days: Previous review interval in days.

    Returns:
    - new_repetition_count: Updated consecutive successful reviews.
    - new_ease_factor: Updated ease factor.
    - new_interval_days: Next review interval in days.
    - mastery_score: Approximate mastery percentage (0-100%).
    """
    # Clamp quality to [0, 5]
    q = max(0, min(5, quality))
    
    # 1. Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_ef = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_ef = max(1.3, round(new_ef, 2))  # Minimum EF is 1.3
    
    # 2. Update Repetition Count & Interval
    if q < 3:
        # Failed recall -> Reset repetition count and schedule for immediate/next-day review
        new_repetition_count = 0
        new_interval_days = 1
    else:
        # Successful recall
        if repetition_count == 0:
            new_interval_days = 1
        elif repetition_count == 1:
            new_interval_days = 6
        else:
            new_interval_days = max(1, int(round(interval_days * new_ef)))
        new_repetition_count = repetition_count + 1

    # 3. Calculate Mastery Score (0 - 100%)
    # Higher repetition count + higher ease factor yields higher mastery
    mastery = min(100.0, round((new_repetition_count * 15.0) + (new_ef - 1.3) * 20.0, 1))
    if q < 3:
        mastery = max(0.0, mastery - 25.0)

    return new_repetition_count, new_ef, new_interval_days, mastery


def update_card_review(card: Dict[str, Any], rating: str) -> Dict[str, Any]:
    """
    Updates a flashcard state based on user rating string: 'again', 'hard', 'good', 'easy'.
    """
    rating_map = {
        "again": 1,
        "hard": 3,
        "good": 4,
        "easy": 5
    }
    quality = rating_map.get(rating.lower(), 4)
    
    curr_rep = card.get("repetition_count", 0)
    curr_ef = card.get("ease_factor", 2.5)
    curr_int = card.get("interval_days", 1)
    
    new_rep, new_ef, new_int, mastery = calculate_sm2(quality, curr_rep, curr_ef, curr_int)
    
    now = get_current_utc()
    next_review_dt = now + timedelta(days=new_int)
    
    card["repetition_count"] = new_rep
    card["ease_factor"] = new_ef
    card["interval_days"] = new_int
    card["mastery_score"] = mastery
    card["last_reviewed"] = now.isoformat()
    card["next_review"] = next_review_dt.isoformat()
    card["total_reviews"] = card.get("total_reviews", 0) + 1
    if quality < 3:
        card["lapse_count"] = card.get("lapse_count", 0) + 1

    return card


def is_card_due(card: Dict[str, Any]) -> bool:
    """Checks if a card is due for review today or overdue."""
    next_review_str = card.get("next_review")
    if not next_review_str:
        return True
    try:
        next_review_dt = datetime.fromisoformat(next_review_str)
        return get_current_utc() >= next_review_dt
    except Exception:
        return True


def get_deck_analytics(cards: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes summary analytics for a flashcard deck.
    """
    if not cards:
        return {
            "total_cards": 0,
            "due_count": 0,
            "mastered_count": 0,
            "learning_count": 0,
            "avg_mastery": 0.0,
            "avg_ease_factor": 2.5,
            "retention_rate": 100.0
        }
    
    total = len(cards)
    due = sum(1 for c in cards if is_card_due(c))
    mastered = sum(1 for c in cards if c.get("mastery_score", 0) >= 80)
    learning = total - mastered
    avg_mastery = round(sum(c.get("mastery_score", 0) for c in cards) / total, 1)
    avg_ef = round(sum(c.get("ease_factor", 2.5) for c in cards) / total, 2)
    
    total_reviews = sum(c.get("total_reviews", 0) for c in cards)
    total_lapses = sum(c.get("lapse_count", 0) for c in cards)
    retention_rate = round(100.0 * (1.0 - (total_lapses / max(1, total_reviews))), 1) if total_reviews > 0 else 100.0

    return {
        "total_cards": total,
        "due_count": due,
        "mastered_count": mastered,
        "learning_count": learning,
        "avg_mastery": avg_mastery,
        "avg_ease_factor": avg_ef,
        "retention_rate": retention_rate
    }
