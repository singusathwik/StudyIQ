"""
StudyIQ AI Cognitive Engine
Gemini Multimodal Integration (Audio, Vision, Text) & Structured Study Kit Generation.
"""

import os
import json
import re
import base64
from typing import Dict, Any, List, Optional
from PIL import Image
import io
from dotenv import load_dotenv

load_dotenv()

# System Prompt defining the AI Persona and Strict Educational Schema
SYSTEM_PROMPT = """
You are StudyIQ Cognitive Engine, an elite AI educational tutor and cognitive science architect.
Your mission is to transform raw, chaotic, or complex inputs (audio lecture transcripts, handwritten notes photos, slides, or study text) into an exceptionally structured, high-yield active-recall study kit.

Your output must be strictly valid JSON matching the specified schema.
Every flashcard and quiz question must test conceptual understanding, critical thinking, or factual recall—never generate superficial or trivial questions.
"""


def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """
    Cleans markdown code fences and parses JSON payload safely.
    """
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = re.sub(r"^```json\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    elif cleaned.startswith("```"):
        cleaned = re.sub(r"^```\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    
    # Try finding first { and last }
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1:
        cleaned = cleaned[first_brace:last_brace + 1]

    return json.loads(cleaned)


def get_mock_study_kit(topic_or_text: str, num_cards: int = 6, num_quizzes: int = 5) -> Dict[str, Any]:
    """
    High-fidelity offline fallback study kit generator.
    Ensures zero terminal crashes even without an active API key.
    """
    topic_clean = topic_or_text.strip()
    if not topic_clean:
        topic_title = "Applied Cognitive Learning & Memory Systems"
    else:
        topic_title = topic_clean.split("\n")[0][:45].strip().title()
        topic_title = re.sub(r"[^\w\s-]", "", topic_title) or "Active Learning & Memory"

    pool_cards = [
        {
            "front": f"What is the primary cognitive mechanism behind active recall in {topic_title}?",
            "back": "Active recall forces the brain to retrieve information from memory rather than passively reviewing notes, creating stronger neural synaptic connections.",
            "tag": "Core Theory"
        },
        {
            "front": "How does the SuperMemo SM-2 algorithm prevent the 'forgetting curve'?",
            "back": "SM-2 dynamically computes exponentially increasing review intervals (1, 6, 15+ days) and updates an Ease Factor (EF) based on response accuracy.",
            "tag": "Spaced Repetition"
        },
        {
            "front": f"What role does multimodal input play in mastering {topic_title}?",
            "back": "Combining visual diagrams, auditory lectures, and structured self-quizzing triggers dual-coding theory, significantly boosting conceptual retention.",
            "tag": "Multimodality"
        },
        {
            "front": "What distinguishes formative assessment from summative assessment?",
            "back": "Formative assessment provides real-time diagnostic feedback during learning to correct misconceptions immediately, whereas summative evaluates final competence.",
            "tag": "Assessment"
        },
        {
            "front": f"What is the most common pitfall when studying {topic_title}?",
            "back": "The 'illusion of competence'—where recognizing information during passive re-reading is mistaken for true understanding and recall capability.",
            "tag": "Study Strategy"
        },
        {
            "front": "Why are distractor explanations critical in multiple choice self-quizzing?",
            "back": "Understanding why incorrect options are plausible but wrong eliminates cognitive cognitive blind spots and solidifies edge-case mastery.",
            "tag": "Metacognition"
        },
        {
            "front": f"How do interleaved practice schedules enhance problem solving in {topic_title}?",
            "back": "Interleaving alternates between different related topics or problem types, training the brain to categorize problems and select the correct solution strategy.",
            "tag": "Advanced Strategy"
        }
    ]

    selected_cards = []
    for i in range(num_cards):
        c = pool_cards[i % len(pool_cards)]
        selected_cards.append({
            "id": f"fc-{i + 1}",
            "front": c["front"],
            "back": c["back"],
            "tag": c["tag"]
        })

    pool_quizzes = [
        {
            "id": "quiz-1",
            "type": "mcq",
            "question": f"Which strategy delivers the highest long-term retention when mastering {topic_title}?",
            "options": [
                "Testing oneself with spaced retrieval flashcards & practice questions",
                "Re-reading high-yield textbook chapters 4 times",
                "Highlighting key phrases in multiple fluorescent colors",
                "Listening to 2x speed lecture recordings without notes"
            ],
            "answer": "Testing oneself with spaced retrieval flashcards & practice questions",
            "explanation": "Extensive cognitive research confirms active retrieval practice with spaced intervals drastically outperforms passive re-reading."
        },
        {
            "id": "quiz-2",
            "type": "mcq",
            "question": "In the SuperMemo SM-2 spaced repetition algorithm, what is the default Ease Factor (EF)?",
            "options": ["2.5", "1.3", "3.0", "1.8"],
            "answer": "2.5",
            "explanation": "The SM-2 algorithm initializes each item with an Ease Factor of 2.5, which is subsequently adjusted up or down based on review grades."
        },
        {
            "id": "quiz-3",
            "type": "true_false",
            "question": "Rating a flashcard as 'Hard' or 'Again' should immediately shorten or reset the review interval to reinforce memory.",
            "options": ["True", "False"],
            "answer": "True",
            "explanation": "True! When memory recall fails or is strenuous, the algorithm shortens the interval to ensure timely re-exposure before total memory loss."
        },
        {
            "id": "quiz-4",
            "type": "true_false",
            "question": "Passive re-reading is proven to be equally effective as active recall for complex engineering subjects.",
            "options": ["True", "False"],
            "answer": "False",
            "explanation": "False! Passive re-reading generates an illusion of mastery without training retrieval pathways required for exams and technical problem solving."
        },
        {
            "id": "quiz-5",
            "type": "fill_blank",
            "question": "The cognitive phenomenon where review intervals are progressively lengthened is called ____ repetition.",
            "options": ["spaced", "blocked", "crammed", "massed"],
            "answer": "spaced",
            "explanation": "Spaced repetition optimizes memory consolidation by timing reviews right before the exponential forgetting threshold."
        }
    ]

    selected_quizzes = pool_quizzes[:num_quizzes]

    return {
        "topic": topic_title,
        "executive_summary": f"A comprehensive, high-yield study blueprint for **{topic_title}**. This kit is structured around active retrieval, conceptual breakdown, and spaced review protocols to maximize long-term cognitive retention.",
        "key_concepts": [
            f"Foundations of {topic_title}",
            "Active Retrieval & Cognitive Load Management",
            "Spaced Repetition & Spacing Interval Calculation",
            "Diagnostic Self-Assessment & Misconception Elimination"
        ],
        "flashcards": selected_cards,
        "quizzes": selected_quizzes,
        "source_type": "offline-fallback"
    }


def generate_study_kit_from_text(
    text: str,
    topic_hint: str = "",
    num_cards: int = 6,
    num_quizzes: int = 5,
    difficulty: str = "Intermediate",
    api_key: Optional[str] = None,
    model_name: str = "gemini-2.5-flash"
) -> Dict[str, Any]:
    """
    Generates a structured study kit from text/notes using Gemini 2.5/1.5 Flash.
    """
    active_key = api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not active_key or "your_" in active_key:
        return get_mock_study_kit(topic_hint or text, num_cards, num_quizzes)

    try:
        import google.generativeai as genai
        genai.configure(api_key=active_key)
        
        prompt = f"""
Generate an exhaustive, highly structured educational Study Kit based on the provided material.
Difficulty Level: {difficulty}
Target Deck Size: EXACTLY {num_cards} flashcards
Target Quiz Count: EXACTLY {num_quizzes} quiz questions

Topic Hint: {topic_hint or 'Derive from content'}

Study Notes / Source Content:
\"\"\"
{text[:12000]}
\"\"\"

RESPONSE JSON FORMAT:
{{
  "topic": "Concise, Professional Title",
  "executive_summary": "2-3 sentence high-level executive summary of the core principles.",
  "key_concepts": ["Core Concept 1", "Core Concept 2", "Core Concept 3", "Core Concept 4"],
  "flashcards": [
    {{
      "id": "fc-1",
      "front": "Clear, specific question, definition trigger, or conceptual challenge",
      "back": "Concise, high-yield explanation or answer",
      "tag": "Concept Category"
    }}
  ],
  "quizzes": [
    {{
      "id": "quiz-1",
      "type": "mcq",
      "question": "Detailed multiple-choice question testing understanding?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A (Must exactly match one option)",
      "explanation": "In-depth rationale of why this option is correct and why other options are distractors."
    }},
    {{
      "id": "quiz-2",
      "type": "true_false",
      "question": "Factual statement regarding the topic?",
      "options": ["True", "False"],
      "answer": "True",
      "explanation": "Why this statement is true or false."
    }},
    {{
      "id": "quiz-3",
      "type": "fill_blank",
      "question": "Sentence with a single ____ blank.",
      "options": ["correct_word", "distractor1", "distractor2", "distractor3"],
      "answer": "correct_word",
      "explanation": "Detailed explanation."
    }}
  ]
}}

CRITICAL INSTRUCTIONS:
1. Output valid JSON ONLY. No preamble or markdown commentary outside the JSON.
2. Produce EXACTLY {num_cards} flashcards and {num_quizzes} total quiz questions.
3. Keep questions rigorous, professional, and directly derived from the source.
"""
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=SYSTEM_PROMPT,
            generation_config={"response_mime_type": "application/json"}
        )
        
        response = model.generate_content(prompt)
        parsed = clean_json_response(response.text)
        parsed["source_type"] = f"gemini-{model_name}"
        return parsed

    except Exception as e:
        print(f"Gemini API generation error: {e}. Using fallback generator.")
        return get_mock_study_kit(topic_hint or text, num_cards, num_quizzes)


def generate_study_kit_from_image(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    topic_hint: str = "",
    num_cards: int = 6,
    num_quizzes: int = 5,
    api_key: Optional[str] = None,
    model_name: str = "gemini-2.5-flash"
) -> Dict[str, Any]:
    """
    Analyzes an image (photo of whiteboard, handwritten lecture notes, diagram) with Gemini Vision
    and generates a structured study kit.
    """
    active_key = api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not active_key or "your_" in active_key:
        return get_mock_study_kit(topic_hint or "Vision Lecture Notes", num_cards, num_quizzes)

    try:
        import google.generativeai as genai
        genai.configure(api_key=active_key)
        
        image = Image.open(io.BytesIO(image_bytes))
        
        prompt = f"""
You are looking at an image containing educational lecture notes, whiteboard diagrams, slides, or textbook excerpts.
1. Perform OCR and extract all text, formulas, key diagrams, and structural concepts.
2. Synthesize these notes and generate a structured study kit with EXACTLY {num_cards} flashcards and {num_quizzes} quiz questions.

Topic Hint: {topic_hint or 'Infer from image content'}

RESPONSE JSON FORMAT:
{{
  "topic": "Topic Title Derived From Image",
  "executive_summary": "Executive summary of the visual notes, diagrams, and formulas present.",
  "key_concepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
  "flashcards": [
    {{
      "id": "fc-1",
      "front": "Front question/concept",
      "back": "Detailed answer/explanation",
      "tag": "Vision/Diagram"
    }}
  ],
  "quizzes": [
    {{
      "id": "quiz-1",
      "type": "mcq",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "explanation": "Explanation"
    }}
  ]
}}
Return ONLY valid JSON.
"""
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=SYSTEM_PROMPT,
            generation_config={"response_mime_type": "application/json"}
        )
        
        response = model.generate_content([prompt, image])
        parsed = clean_json_response(response.text)
        parsed["source_type"] = "gemini-vision"
        return parsed

    except Exception as e:
        print(f"Gemini Vision API error: {e}. Using fallback generator.")
        return get_mock_study_kit(topic_hint or "Vision Extracted Lecture", num_cards, num_quizzes)


def transcribe_and_generate_from_audio(
    audio_bytes: bytes,
    mime_type: str = "audio/wav",
    topic_hint: str = "",
    num_cards: int = 6,
    num_quizzes: int = 5,
    api_key: Optional[str] = None,
    model_name: str = "gemini-2.5-flash"
) -> Dict[str, Any]:
    """
    Transcribes audio lecture recordings with Gemini Multimodal Audio and generates study kit.
    """
    active_key = api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not active_key or "your_" in active_key:
        return get_mock_study_kit(topic_hint or "Voice Lecture Notes", num_cards, num_quizzes)

    try:
        import google.generativeai as genai
        genai.configure(api_key=active_key)
        
        audio_part = {
            "mime_type": mime_type,
            "data": audio_bytes
        }
        
        prompt = f"""
Transcribe this spoken lecture recording verbatim and transform the rambling lecture thoughts into an organized, high-yield Study Kit.
Create EXACTLY {num_cards} flashcards and {num_quizzes} quiz questions.

Topic Hint: {topic_hint or 'Detect from voice lecture'}

RESPONSE JSON FORMAT:
{{
  "topic": "Detected Lecture Topic",
  "transcription": "Verbatim transcript of the voice lecture.",
  "executive_summary": "Synthesized summary of the speaker's key lecture points.",
  "key_concepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
  "flashcards": [
    {{
      "id": "fc-1",
      "front": "Front question/concept",
      "back": "Detailed answer",
      "tag": "Voice Note"
    }}
  ],
  "quizzes": [
    {{
      "id": "quiz-1",
      "type": "mcq",
      "question": "Question?",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "Why A is correct"
    }}
  ]
}}
Return ONLY valid JSON.
"""
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=SYSTEM_PROMPT,
            generation_config={"response_mime_type": "application/json"}
        )
        
        response = model.generate_content([prompt, audio_part])
        parsed = clean_json_response(response.text)
        parsed["source_type"] = "gemini-audio"
        return parsed

    except Exception as e:
        print(f"Gemini Audio API error: {e}. Using fallback generator.")
        return get_mock_study_kit(topic_hint or "Spoken Lecture", num_cards, num_quizzes)
