"""
StudyIQ - Multimodal AI Study Assistant (Streamlit Edition)
Engineered to replicate the sleek, spacious, and modern aesthetic of the StudyIQ React Workspace.
Includes full Topic History, Subject Revision Archive, and Spaced Repetition tracking.
"""

import os
import streamlit as st
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
import importlib

# Dynamic Module Reloading
import streamlit_src.ui_components
import streamlit_src.ai_engine
import streamlit_src.spaced_repetition
import streamlit_src.data_manager

importlib.reload(streamlit_src.ui_components)
importlib.reload(streamlit_src.ai_engine)
importlib.reload(streamlit_src.spaced_repetition)
importlib.reload(streamlit_src.data_manager)

from streamlit_src.ai_engine import (
    generate_study_kit_from_text,
    generate_study_kit_from_image,
    transcribe_and_generate_from_audio,
    get_mock_study_kit
)
from streamlit_src.spaced_repetition import (
    init_card_sm2,
    update_card_review,
    get_deck_analytics,
    is_card_due
)
from streamlit_src.data_manager import (
    cards_to_dataframe,
    dataframe_to_cards,
    export_study_kit_to_json,
    export_flashcards_to_csv,
    export_study_guide_markdown
)
from streamlit_src.ui_components import (
    inject_custom_css,
    get_greeting,
    render_top_navbar,
    render_react_flashcard,
    render_history_topic_card,
    render_achievement_badges,
    plot_accuracy_line_chart,
    plot_mastery_donut_chart
)

# Load environment
load_dotenv()

# Streamlit Page Setup
st.set_page_config(
    page_title="StudyIQ - AI Study Assistant",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Inject Custom High-End Styling
inject_custom_css()

# ---------------------------------------------------------
# State Initialization
# ---------------------------------------------------------
if "study_kit" not in st.session_state:
    default_kit = get_mock_study_kit("Neuroscience & Spaced Repetition", num_cards=6, num_quizzes=5)
    default_kit["flashcards"] = [
        init_card_sm2(c["id"], c["front"], c["back"], c.get("tag", "Cognitive Theory"))
        for c in default_kit.get("flashcards", [])
    ]
    st.session_state.study_kit = default_kit

if "active_card_idx" not in st.session_state:
    st.session_state.active_card_idx = 0

if "card_flipped" not in st.session_state:
    st.session_state.card_flipped = False

if "quiz_answers" not in st.session_state:
    st.session_state.quiz_answers = {}

if "quiz_submitted" not in st.session_state:
    st.session_state.quiz_submitted = False

if "quiz_stats" not in st.session_state:
    st.session_state.quiz_stats = {"total_attempts": 0, "correct": 0, "accuracy": 0.0}

if "xp" not in st.session_state:
    st.session_state.xp = 180

if "level" not in st.session_state:
    st.session_state.level = 2

if "streak" not in st.session_state:
    st.session_state.streak = 3

if "saved_kits" not in st.session_state:
    st.session_state.saved_kits = [
        {
            "topic": "Neuroscience & Spaced Repetition",
            "created_at": "Today, 10:30 AM",
            "card_count": 6,
            "quiz_count": 5,
            "kit": st.session_state.study_kit
        },
        {
            "topic": "Quantum Computing & Superposition",
            "created_at": "Yesterday",
            "card_count": 6,
            "quiz_count": 5,
            "kit": get_mock_study_kit("Quantum Computing & Superposition", num_cards=6, num_quizzes=5)
        }
    ]

if "quiz_history" not in st.session_state:
    st.session_state.quiz_history = [
        {"accuracy": 75}, {"accuracy": 85}, {"accuracy": 90}
    ]

if "prompt_input_text" not in st.session_state:
    st.session_state.prompt_input_text = ""

# ---------------------------------------------------------
# Sidebar: Clean ChatGPT-Style Navigation & History Rail
# ---------------------------------------------------------
with st.sidebar:
    st.markdown("""
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
        <span style="font-size: 1.3rem;">⚡</span>
        <span style="font-size: 1.2rem; font-weight: 800; color: #f8fafc; letter-spacing: -0.02em;">StudyIQ</span>
        <span style="background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); padding: 2px 7px; border-radius: 12px; font-size: 0.7rem; font-weight: 700;">PRO</span>
    </div>
    """, unsafe_allow_html=True)

    # Primary New Kit Button
    if st.button("➕  New Study Kit", type="primary", use_container_width=True):
        st.session_state.prompt_input_text = ""
        st.session_state.active_card_idx = 0
        st.session_state.card_flipped = False
        st.session_state.quiz_submitted = False
        st.session_state.quiz_answers = {}
        st.rerun()

    st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

    # Saved Kits / History Section
    st.markdown("#### 🕒 Topic History")
    search_query = st.text_input("Search topics...", placeholder="🔍 Search past topics...", label_visibility="collapsed")
    
    filtered_kits = [
        k for k in st.session_state.saved_kits 
        if not search_query or search_query.lower() in k["topic"].lower()
    ]

    if not filtered_kits:
        st.caption("No matching topics in history.")
    else:
        for idx, item in enumerate(filtered_kits):
            is_active = (st.session_state.study_kit.get("topic") == item["topic"])
            col_k1, col_k2 = st.columns([4, 1])
            with col_k1:
                btn_label = f"{'👉 ' if is_active else '📄 '}{item['topic'][:18]}..."
                if st.button(btn_label, key=f"side_load_{idx}", use_container_width=True):
                    st.session_state.study_kit = item["kit"]
                    st.session_state.active_card_idx = 0
                    st.session_state.card_flipped = False
                    st.session_state.quiz_submitted = False
                    st.session_state.quiz_answers = {}
                    st.rerun()
            with col_k2:
                if st.button("🗑️", key=f"side_del_{idx}", help="Delete from history"):
                    st.session_state.saved_kits = [k for k in st.session_state.saved_kits if k["topic"] != item["topic"]]
                    st.rerun()

    if len(st.session_state.saved_kits) > 1:
        if st.button("🧹 Clear History", use_container_width=True):
            st.session_state.saved_kits = []
            st.rerun()

    st.markdown("---")

    # API Configuration (Never exposed)
    env_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or ""
    has_env_key = bool(env_api_key and not env_api_key.startswith("your_"))

    with st.expander("⚙️ Model Settings", expanded=False):
        if has_env_key:
            st.success("🔒 API Key: Active (.env / Cloud)", icon="🛡️")
            override_key = st.text_input("Override Key", value="", type="password", placeholder="Leave blank to use default")
            active_api_key = override_key.strip() if override_key.strip() else env_api_key
        else:
            active_api_key = st.text_input("Gemini API Key", value="", type="password", placeholder="Paste Gemini key (Optional)")
            if not active_api_key:
                st.caption("💡 Running in offline simulation mode.")

        selected_model = st.selectbox("Model", ["gemini-2.5-flash", "gemini-1.5-flash"], index=0)

    st.markdown("---")
    st.markdown("""
    <div style="font-size: 0.8rem; color: #94a3b8; line-height: 1.6;">
        🌐 <b>Live React App (Vercel)</b><br>
        <a href="https://study-iq-five.vercel.app/" target="_blank" style="color: #818cf8; text-decoration: none; font-weight: 600;">study-iq-five.vercel.app ↗</a><br>
        🖥️ <b>Live Streamlit App (Render)</b><br>
        <a href="https://studyiq-30yo.onrender.com/" target="_blank" style="color: #34d399; text-decoration: none; font-weight: 600;">studyiq-30yo.onrender.com ↗</a>
    </div>
    """, unsafe_allow_html=True)

# ---------------------------------------------------------
# Top Floating Navigation Bar
# ---------------------------------------------------------
current_kit = st.session_state.study_kit
cards_list = current_kit.get("flashcards", [])
analytics = get_deck_analytics(cards_list)

render_top_navbar(
    streak=st.session_state.streak,
    xp=st.session_state.xp,
    level=st.session_state.level,
    due_count=analytics.get("due_count", 0)
)

# ---------------------------------------------------------
# Main Workspace Navigation Tabs
# ---------------------------------------------------------
tab_create, tab_flashcards, tab_quiz, tab_history, tab_dashboard, tab_export = st.tabs([
    "✨ Create Studio",
    "🗂️ Flashcards",
    "🎯 Quiz Arena",
    "📚 Topic History",
    "📊 Progress Dashboard",
    "📤 Export & Share"
])

# =========================================================
# TAB 1: Create Studio (React Ingest Experience)
# =========================================================
with tab_create:
    greeting = get_greeting()
    
    st.markdown(f"""
    <div class="claude-hero-wrapper">
        <h1 class="claude-hero-title">{greeting}</h1>
        <p class="claude-hero-subtitle">Transform audio lectures, notes, or prompts into active-recall study sets.</p>
    </div>
    """, unsafe_allow_html=True)

    # Clean Modality Pills
    input_mode = st.radio(
        "Modality",
        ["📝 Text & Topic", "🎙️ Spoken Voice Lecture", "📷 Whiteboard & Notes Photo"],
        horizontal=True,
        label_visibility="collapsed"
    )

    if "Text & Topic" in input_mode:
        with st.form("create_text_form_clean"):
            prompt_val = st.text_area(
                "Prompt Input",
                value=st.session_state.prompt_input_text,
                height=130,
                placeholder="Enter a topic, question, or paste messy lecture notes...",
                label_visibility="collapsed"
            )

            with st.expander("⚙️ Quantity Settings (Cards & Quizzes)", expanded=False):
                cfg1, cfg2, cfg3 = st.columns(3)
                with cfg1:
                    t_hint = st.text_input("Topic Title (Optional)", placeholder="e.g. Distributed Systems")
                with cfg2:
                    n_cards = st.slider("Flashcards", min_value=3, max_value=15, value=6)
                with cfg3:
                    n_quizzes = st.slider("Quiz Questions", min_value=3, max_value=10, value=5)

            st.markdown("<div style='height: 6px;'></div>", unsafe_allow_html=True)
            submit_create = st.form_submit_button("✨ Generate Study Kit", type="primary", use_container_width=True)

        if submit_create:
            if not prompt_val.strip():
                st.warning("Please enter a topic or notes.")
            else:
                with st.spinner("⚡ Synthesizing with Gemini AI..."):
                    new_kit = generate_study_kit_from_text(
                        text=prompt_val,
                        topic_hint=t_hint,
                        num_cards=n_cards,
                        num_quizzes=n_quizzes,
                        api_key=active_api_key,
                        model_name=selected_model
                    )
                    cards = [init_card_sm2(c["id"], c["front"], c["back"], c.get("tag", "Core Concept")) for c in new_kit.get("flashcards", [])]
                    new_kit["flashcards"] = cards
                    st.session_state.study_kit = new_kit
                    st.session_state.active_card_idx = 0
                    st.session_state.card_flipped = False
                    st.session_state.quiz_submitted = False
                    st.session_state.quiz_answers = {}
                    st.session_state.xp += 25
                    
                    # Add to history
                    new_hist_entry = {
                        "topic": new_kit["topic"],
                        "created_at": datetime.now().strftime("%b %d, %I:%M %p"),
                        "card_count": len(cards),
                        "quiz_count": len(new_kit.get("quizzes", [])),
                        "kit": new_kit
                    }
                    st.session_state.saved_kits = [k for k in st.session_state.saved_kits if k["topic"] != new_kit["topic"]]
                    st.session_state.saved_kits.insert(0, new_hist_entry)

                    st.success(f"🎉 Generated '{new_kit.get('topic')}' (+25 XP)")
                    st.rerun()

    elif "Spoken Voice" in input_mode:
        st.markdown("#### 🎙️ Voice Lecture Transcription Studio")
        st.caption("Speak into your microphone or upload an audio lecture.")
        
        aud1, aud2 = st.columns(2)
        with aud1:
            rec_audio = st.audio_input("Record lecture note:")
        with aud2:
            up_audio = st.file_uploader("Upload audio file:", type=["wav", "mp3", "m4a", "webm"])

        target_audio = rec_audio or up_audio

        with st.form("create_voice_form_clean"):
            v_hint = st.text_input("Topic Hint (Optional)", placeholder="e.g. Distributed Consensus")
            v_cards = st.slider("Flashcards Count", min_value=3, max_value=15, value=6, key="vc_c")
            v_quizzes = st.slider("Quiz Count", min_value=3, max_value=10, value=5, key="vc_q")
            submit_voice = st.form_submit_button("🎙️ Transcribe & Generate Kit", type="primary", use_container_width=True)

        if submit_voice:
            if not target_audio:
                st.warning("Please record audio or upload a file first.")
            else:
                with st.spinner("🧠 Transcribing audio lecture with Gemini..."):
                    audio_bytes = target_audio.read()
                    mime = getattr(target_audio, "type", "audio/wav") or "audio/wav"
                    new_kit = transcribe_and_generate_from_audio(
                        audio_bytes=audio_bytes,
                        mime_type=mime,
                        topic_hint=v_hint,
                        num_cards=v_cards,
                        num_quizzes=v_quizzes,
                        api_key=active_api_key,
                        model_name=selected_model
                    )
                    cards = [init_card_sm2(c["id"], c["front"], c["back"], c.get("tag", "Voice Note")) for c in new_kit.get("flashcards", [])]
                    new_kit["flashcards"] = cards
                    st.session_state.study_kit = new_kit
                    st.session_state.active_card_idx = 0
                    st.session_state.card_flipped = False
                    st.session_state.quiz_submitted = False
                    st.session_state.quiz_answers = {}
                    st.session_state.xp += 30
                    
                    new_hist_entry = {
                        "topic": new_kit["topic"],
                        "created_at": datetime.now().strftime("%b %d, %I:%M %p"),
                        "card_count": len(cards),
                        "quiz_count": len(new_kit.get("quizzes", [])),
                        "kit": new_kit
                    }
                    st.session_state.saved_kits = [k for k in st.session_state.saved_kits if k["topic"] != new_kit["topic"]]
                    st.session_state.saved_kits.insert(0, new_hist_entry)

                    st.success(f"🎉 Generated Voice Study Kit: '{new_kit.get('topic')}' (+30 XP)")
                    st.rerun()

    else:
        st.markdown("#### 📷 Whiteboard & Notes Vision Studio")
        st.caption("Capture a photo of handwritten notes or whiteboard diagrams.")
        
        vis1, vis2 = st.columns(2)
        with vis1:
            cam_pic = st.camera_input("Take photo via webcam:")
        with vis2:
            up_pic = st.file_uploader("Upload image of notes:", type=["png", "jpg", "jpeg", "webp"])

        target_img = cam_pic or up_pic

        with st.form("create_vision_form_clean"):
            vi_hint = st.text_input("Topic Hint (Optional)", placeholder="e.g. Graph Algorithms")
            vi_cards = st.slider("Flashcards Count", min_value=3, max_value=15, value=6, key="vi_c")
            vi_quizzes = st.slider("Quiz Count", min_value=3, max_value=10, value=5, key="vi_q")
            submit_vision = st.form_submit_button("📷 Analyze Image & Generate Kit", type="primary", use_container_width=True)

        if submit_vision:
            if not target_img:
                st.warning("Please snap a photo or upload an image first.")
            else:
                with st.spinner("👁️ Analyzing visual lecture notes with Gemini Vision..."):
                    img_bytes = target_img.read()
                    mime = getattr(target_img, "type", "image/jpeg") or "image/jpeg"
                    new_kit = generate_study_kit_from_image(
                        image_bytes=img_bytes,
                        mime_type=mime,
                        topic_hint=vi_hint,
                        num_cards=vi_cards,
                        num_quizzes=vi_quizzes,
                        api_key=active_api_key,
                        model_name=selected_model
                    )
                    cards = [init_card_sm2(c["id"], c["front"], c["back"], c.get("tag", "Vision")) for c in new_kit.get("flashcards", [])]
                    new_kit["flashcards"] = cards
                    st.session_state.study_kit = new_kit
                    st.session_state.active_card_idx = 0
                    st.session_state.card_flipped = False
                    st.session_state.quiz_submitted = False
                    st.session_state.quiz_answers = {}
                    st.session_state.xp += 30

                    new_hist_entry = {
                        "topic": new_kit["topic"],
                        "created_at": datetime.now().strftime("%b %d, %I:%M %p"),
                        "card_count": len(cards),
                        "quiz_count": len(new_kit.get("quizzes", [])),
                        "kit": new_kit
                    }
                    st.session_state.saved_kits = [k for k in st.session_state.saved_kits if k["topic"] != new_kit["topic"]]
                    st.session_state.saved_kits.insert(0, new_hist_entry)

                    st.success(f"🎉 Visual Study Kit Generated: '{new_kit.get('topic')}' (+30 XP)")
                    st.rerun()

    # Example Prompt Chips
    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)
    st.markdown("<div style='text-align: center; font-size: 0.85rem; color: #94a3b8; margin-bottom: 8px;'>💡 Or try an example topic:</div>", unsafe_allow_html=True)
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        if st.button("🧠 Neuroscience & Memory", use_container_width=True):
            st.session_state.prompt_input_text = "Spaced repetition and active recall in cognitive neuroscience, explaining the forgetting curve."
            st.rerun()
    with c2:
        if c2.button("⚛️ Quantum Superposition", use_container_width=True):
            st.session_state.prompt_input_text = "Quantum computing fundamentals: qubits, superposition, entanglement, and quantum logic gates."
            st.rerun()
    with c3:
        if c3.button("🌿 Photosynthesis & ATP", use_container_width=True):
            st.session_state.prompt_input_text = "Plant biology: light reactions, Calvin cycle, ATP synthesis, and chlorophyll mechanics."
            st.rerun()
    with c4:
        if c4.button("🌲 Binary Search Trees", use_container_width=True):
            st.session_state.prompt_input_text = "Computer Science: Binary search trees, balanced rotations, and search time complexity."
            st.rerun()

# =========================================================
# TAB 2: Flashcards (React FlashcardDeck Experience)
# =========================================================
with tab_flashcards:
    cards = current_kit.get("flashcards", [])
    
    if not cards:
        st.info("No flashcards found. Generate a study kit in Tab 1 or load one from Tab 4 (Topic History).")
    else:
        total_cards = len(cards)
        curr_idx = min(st.session_state.active_card_idx, total_cards - 1)
        active_card = cards[curr_idx]

        # Top Header Row
        h1, h2 = st.columns([3, 1])
        with h1:
            st.markdown(f"<h3 style='margin:0; color:#f8fafc; font-weight:800;'>{current_kit.get('topic')}</h3>", unsafe_allow_html=True)
            st.caption(f"Card {curr_idx + 1} of {total_cards} • SuperMemo SM-2 Active Recall")
        with h2:
            st.markdown(f"<div style='text-align:right;'><span class='brand-sub-badge'>{total_cards} Cards</span></div>", unsafe_allow_html=True)

        st.progress((curr_idx + 1) / total_cards)

        # Centered Spacious Flashcard (React 3D Look)
        render_react_flashcard(active_card, is_flipped=st.session_state.card_flipped)

        # Action Buttons
        b1, b2, b3 = st.columns([1, 2, 1])
        with b1:
            if st.button("⬅️ Previous", disabled=(curr_idx == 0), use_container_width=True):
                st.session_state.active_card_idx = max(0, curr_idx - 1)
                st.session_state.card_flipped = False
                st.rerun()

        with b2:
            if not st.session_state.card_flipped:
                if st.button("🔄 Flip Card", type="primary", use_container_width=True):
                    st.session_state.card_flipped = True
                    st.rerun()
            else:
                rb1, rb2, rb3 = st.columns(3)
                with rb1:
                    if st.button("❌ Hard (1d)", help="Forgot completely (Interval resets to 1 day)", use_container_width=True):
                        cards[curr_idx] = update_card_review(active_card, "hard")
                        st.session_state.study_kit["flashcards"] = cards
                        st.session_state.card_flipped = False
                        st.session_state.xp += 5
                        if curr_idx < total_cards - 1:
                            st.session_state.active_card_idx += 1
                        st.rerun()
                with rb2:
                    if st.button("⚠️ Good (+1d)", type="primary", help="Standard recall update", use_container_width=True):
                        cards[curr_idx] = update_card_review(active_card, "good")
                        st.session_state.study_kit["flashcards"] = cards
                        st.session_state.card_flipped = False
                        st.session_state.xp += 10
                        if curr_idx < total_cards - 1:
                            st.session_state.active_card_idx += 1
                        st.rerun()
                with rb3:
                    if st.button("🌟 Easy (+6d)", help="Effortless recall bonus", use_container_width=True):
                        cards[curr_idx] = update_card_review(active_card, "easy")
                        st.session_state.study_kit["flashcards"] = cards
                        st.session_state.card_flipped = False
                        st.session_state.xp += 15
                        if curr_idx < total_cards - 1:
                            st.session_state.active_card_idx += 1
                        st.rerun()

        with b3:
            if st.button("Next ➡️", disabled=(curr_idx == total_cards - 1), use_container_width=True):
                st.session_state.active_card_idx = min(total_cards - 1, curr_idx + 1)
                st.session_state.card_flipped = False
                st.rerun()

        st.markdown("<div style='height: 18px;'></div>", unsafe_allow_html=True)
        with st.expander("🛠️ View & Edit Deck Table (st.data_editor)", expanded=False):
            df_cards = cards_to_dataframe(cards)
            edited_df = st.data_editor(
                df_cards[["id", "front", "back", "tag", "mastery_score"]],
                num_rows="dynamic",
                use_container_width=True
            )
            if st.button("💾 Save Table Edits"):
                st.session_state.study_kit["flashcards"] = dataframe_to_cards(edited_df)
                st.success("Deck saved successfully!")
                st.rerun()

# =========================================================
# TAB 3: Quiz Arena (React QuizEngine Experience)
# =========================================================
with tab_quiz:
    quizzes = current_kit.get("quizzes", [])
    
    if not quizzes:
        st.info("No quiz questions available. Generate a kit in Tab 1 or load one from Tab 4.")
    else:
        st.markdown(f"<h3 style='margin:0; color:#f8fafc; font-weight:800;'>🎯 {current_kit.get('topic')} Quiz Arena</h3>", unsafe_allow_html=True)
        st.caption("Test your active recall and earn XP.")
        st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

        with st.form("clean_quiz_form"):
            user_selections = {}
            for i, q in enumerate(quizzes, 1):
                st.markdown(f"**Q{i}: {q.get('question')}**")
                options = q.get("options", ["True", "False"])
                q_id = q.get("id", f"q-{i}")
                
                prev_val = st.session_state.quiz_answers.get(q_id, None)
                idx_default = options.index(prev_val) if prev_val in options else None

                user_selections[q_id] = st.radio(
                    f"Options for Q{i}:",
                    options=options,
                    index=idx_default,
                    key=f"clean_radio_{q_id}",
                    label_visibility="collapsed"
                )
                st.markdown("<div style='height: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 12px;'></div>", unsafe_allow_html=True)

            submit_quiz = st.form_submit_button("🏁 Submit Quiz for Grading", type="primary", use_container_width=True)

        if submit_quiz:
            st.session_state.quiz_submitted = True
            st.session_state.quiz_answers = user_selections
            
            correct_count = 0
            for q in quizzes:
                q_id = q.get("id")
                chosen = user_selections.get(q_id)
                expected = str(q.get("answer", "")).strip().lower()
                if chosen and str(chosen).strip().lower() == expected:
                    correct_count += 1
            
            total_q = len(quizzes)
            accuracy = round((correct_count / total_q) * 100, 1)
            st.session_state.quiz_stats = {
                "total_attempts": total_q,
                "correct": correct_count,
                "accuracy": accuracy
            }
            st.session_state.xp += (correct_count * 15)
            st.session_state.quiz_history.append({"accuracy": accuracy})
            st.rerun()

        if st.session_state.quiz_submitted:
            stats = st.session_state.quiz_stats
            st.markdown("<div style='height: 14px;'></div>", unsafe_allow_html=True)
            
            res1, res2 = st.columns([1, 2])
            with res1:
                st.markdown(f"""
                <div style="background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 20px; text-align: center;">
                    <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 700;">QUIZ ACCURACY</div>
                    <div style="font-size: 2.6rem; font-weight: 800; color: {'#34d399' if stats['accuracy'] >= 70 else '#fbbf24'}; margin: 4px 0;">
                        {stats['accuracy']}%
                    </div>
                    <div style="font-weight: 600; color: #cbd5e1; font-size: 0.9rem;">{stats['correct']} of {stats['total_attempts']} Correct</div>
                </div>
                """, unsafe_allow_html=True)
            with res2:
                if stats["accuracy"] >= 80:
                    st.balloons()
                    st.success(f"🎉 **Mastery Achieved!** +{stats['correct'] * 15} XP added to your profile.")
                else:
                    st.info(f"👍 Good effort! +{stats['correct'] * 15} XP earned. Review the explanations below.")

            st.markdown("#### 📋 Diagnostic Explanations")
            for i, q in enumerate(quizzes, 1):
                q_id = q.get("id")
                chosen = st.session_state.quiz_answers.get(q_id, "No answer")
                expected = q.get("answer")
                is_correct = str(chosen).strip().lower() == str(expected).strip().lower()

                with st.expander(f"Q{i}: {'✅ Correct' if is_correct else '❌ Incorrect'} - {q.get('question')[:65]}...", expanded=not is_correct):
                    st.markdown(f"**Your Choice:** `{chosen}`")
                    st.markdown(f"**Correct Answer:** `{expected}`")
                    st.markdown(f"**Explanation:** *{q.get('explanation', 'No explanation.')}*")

# =========================================================
# TAB 4: Topic History & Visited Subjects Archive
# =========================================================
with tab_history:
    st.markdown("<h3 style='margin:0; color:#f8fafc; font-weight:800;'>📚 Topic History & Archive</h3>", unsafe_allow_html=True)
    st.caption("Browse, revisit, and practice flashcards from all previously explored study topics.")
    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)

    # Mixed Subject Revision Quick Banner (React Feature)
    if len(st.session_state.saved_kits) > 1:
        st.markdown(f"""
        <div class="mixed-review-banner">
            <div>
                <div style="font-weight: 800; font-size: 1.1rem; color: #f8fafc; margin-bottom: 2px;">
                    ✨ All Subjects Mixed Revision
                </div>
                <div style="font-size: 0.85rem; color: #cbd5e1;">
                    Combine flashcards from all {len(st.session_state.saved_kits)} visited topics into one active recall session.
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("🔥 Start Mixed Revision Deck", type="primary", use_container_width=True):
            # Combine all flashcards
            combined_cards = []
            for k in st.session_state.saved_kits:
                kit_cards = k["kit"].get("flashcards", [])
                combined_cards.extend(kit_cards)
            
            mixed_kit = {
                "topic": "Mixed Subjects Comprehensive Review",
                "executive_summary": f"Combined active-recall study session across {len(st.session_state.saved_kits)} explored subjects.",
                "key_concepts": [k["topic"] for k in st.session_state.saved_kits[:4]],
                "flashcards": combined_cards,
                "quizzes": st.session_state.study_kit.get("quizzes", [])
            }
            st.session_state.study_kit = mixed_kit
            st.session_state.active_card_idx = 0
            st.session_state.card_flipped = False
            st.success("Loaded Mixed Review Deck! Head to the Flashcards tab to practice.")
            st.rerun()

        st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)

    # Search and Filter Row
    h_col1, h_col2 = st.columns([3, 1])
    with h_col1:
        hist_search = st.text_input("Filter History", placeholder="🔍 Filter topics by keyword...", label_visibility="collapsed")
    with h_col2:
        st.markdown(f"<div style='text-align:right; font-size:0.9rem; font-weight:700; color:#818cf8; padding-top:6px;'>{len(st.session_state.saved_kits)} Topics Saved</div>", unsafe_allow_html=True)

    hist_items = [
        item for item in st.session_state.saved_kits 
        if not hist_search or hist_search.lower() in item["topic"].lower()
    ]

    if not hist_items:
        st.info("No study topics found in history. Generate a new kit in Tab 1!")
    else:
        for idx, item in enumerate(hist_items):
            is_current = (st.session_state.study_kit.get("topic") == item["topic"])
            k_cards = item["kit"].get("flashcards", [])
            due_in_topic = sum(1 for c in k_cards if is_card_due(c))

            render_history_topic_card(
                topic=item["topic"],
                created_at=item.get("created_at", "Saved"),
                summary=item["kit"].get("executive_summary", ""),
                card_count=item.get("card_count", len(k_cards)),
                quiz_count=item.get("quiz_count", len(item["kit"].get("quizzes", []))),
                due_count=due_in_topic,
                is_current=is_current
            )

            # Action Buttons Row
            act_col1, act_col2, act_col3, act_col4 = st.columns([2, 2, 2, 1])
            with act_col1:
                if st.button("🗂️ Study Flashcards", key=f"hist_fc_{idx}", use_container_width=True):
                    st.session_state.study_kit = item["kit"]
                    st.session_state.active_card_idx = 0
                    st.session_state.card_flipped = False
                    st.rerun()
            with act_col2:
                if st.button("🎯 Take Quiz", key=f"hist_qz_{idx}", use_container_width=True):
                    st.session_state.study_kit = item["kit"]
                    st.session_state.quiz_submitted = False
                    st.session_state.quiz_answers = {}
                    st.rerun()
            with act_col3:
                csv_content = export_flashcards_to_csv(item["kit"].get("flashcards", []))
                st.download_button(
                    "📥 Export CSV",
                    data=csv_content,
                    file_name=f"{item['topic']}_cards.csv",
                    mime="text/csv",
                    key=f"hist_dl_{idx}",
                    use_container_width=True
                )
            with act_col4:
                if st.button("🗑️", key=f"hist_rm_{idx}", help="Remove from history", use_container_width=True):
                    st.session_state.saved_kits = [k for k in st.session_state.saved_kits if k["topic"] != item["topic"]]
                    st.rerun()

            st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

# =========================================================
# TAB 5: Progress Dashboard (React ProgressDashboard Experience)
# =========================================================
with tab_dashboard:
    st.markdown("<h3 style='margin:0; color:#f8fafc; font-weight:800;'>📊 Learning Analytics & Progress</h3>", unsafe_allow_html=True)
    st.caption("Track retention curves, session accuracy, and unlock achievement badges.")
    st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

    # 4 KPI Stat Cards
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.metric("🔥 Study Streak", f"{st.session_state.streak} Days", delta="+1 day")
    with k2:
        st.metric("⚡ XP & Level", f"Lvl {st.session_state.level}", delta=f"{st.session_state.xp} Total XP")
    with k3:
        st.metric("🧠 Retention Rate", f"{analytics.get('retention_rate', 100)}%", delta=f"EF {analytics.get('avg_ease_factor', 2.5):.2f}")
    with k4:
        st.metric("🎯 Quiz Accuracy", f"{st.session_state.quiz_stats.get('accuracy', 85)}%", delta="Recent Session")

    st.markdown("<div style='height: 14px;'></div>", unsafe_allow_html=True)

    # Plotly Charts Side by Side
    ch1, ch2 = st.columns(2)
    with ch1:
        st.plotly_chart(plot_accuracy_line_chart(st.session_state.quiz_history), use_container_width=True)
    with ch2:
        st.plotly_chart(plot_mastery_donut_chart(cards_list), use_container_width=True)

    st.markdown("---")
    st.markdown("#### 🏆 Achievement Badges")
    render_achievement_badges()

# =========================================================
# TAB 6: Export & Share
# =========================================================
with tab_export:
    st.markdown("<h3 style='margin:0; color:#f8fafc; font-weight:800;'>📤 Export & Share Study Kit</h3>", unsafe_allow_html=True)
    st.caption("Download flashcard decks and study guides for offline review.")
    st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

    e1, e2, e3 = st.columns(3)
    with e1:
        csv_data = export_flashcards_to_csv(current_kit.get("flashcards", []))
        st.download_button(
            "📥 Download Anki CSV",
            data=csv_data,
            file_name=f"{current_kit.get('topic', 'studyiq')}_anki.csv",
            mime="text/csv",
            use_container_width=True
        )
        st.caption("Compatible with Anki & Quizlet.")
    with e2:
        json_data = export_study_kit_to_json(current_kit)
        st.download_button(
            "📥 Download JSON Kit",
            data=json_data,
            file_name=f"{current_kit.get('topic', 'studyiq')}_kit.json",
            mime="application/json",
            use_container_width=True
        )
        st.caption("Machine-readable full schema.")
    with e3:
        md_data = export_study_guide_markdown(current_kit)
        st.download_button(
            "📥 Download Study Guide (.md)",
            data=md_data,
            file_name=f"{current_kit.get('topic', 'studyiq')}_guide.md",
            mime="text/markdown",
            use_container_width=True
        )
        st.caption("Printable study sheet.")

    st.markdown("---")
    st.markdown("### 📑 Study Guide Preview")
    st.markdown(export_study_guide_markdown(current_kit))

# ---------------------------------------------------------
# Footer
# ---------------------------------------------------------
st.markdown("""
<div style="text-align: center; color: #64748b; font-size: 0.8rem; padding: 24px 0 10px 0;">
    StudyIQ Multimodal AI Studio • SuperMemo SM-2 Spaced Repetition • Render & Vercel
</div>
""", unsafe_allow_html=True)
