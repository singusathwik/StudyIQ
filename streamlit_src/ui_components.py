"""
StudyIQ UI Components & Design System
Faithfully reproduces the sleek, modern, and uncluttered React StudyIQ interface for Streamlit.
"""

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from typing import Dict, Any, List
from datetime import datetime


def inject_custom_css():
    """
    Injects high-fidelity custom CSS matching the React StudyIQ interface.
    """
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    
    /* Global Reset & Streamlit Chrome Removal */
    #MainMenu { visibility: hidden; }
    footer { visibility: hidden; }
    header[data-testid="stHeader"] { display: none; }
    div[data-testid="stDecoration"] { display: none; }
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #f8fafc;
    }

    /* Main App Layout & Padding */
    .block-container {
        padding-top: 1.2rem !important;
        padding-bottom: 3rem !important;
        max-width: 1040px !important;
        margin: 0 auto;
    }

    /* Top Sleek Navigation & Stats Bar */
    .react-top-navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        padding: 10px 20px;
        margin-bottom: 24px;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
    }

    .brand-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .brand-icon-box {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 1rem;
        font-weight: 800;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .brand-text {
        font-size: 1.25rem;
        font-weight: 800;
        background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.02em;
    }

    .brand-sub-badge {
        background: rgba(99, 102, 241, 0.18);
        color: #a5b4fc;
        border: 1px solid rgba(99, 102, 241, 0.35);
        padding: 2px 7px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 700;
    }

    .stats-dock-pills {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .stat-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #f1f5f9;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .stat-pill.streak { color: #ff6b6b; border-color: rgba(255, 107, 107, 0.25); }
    .stat-pill.xp { color: #fbbf24; border-color: rgba(251, 191, 36, 0.25); }
    .stat-pill.due { color: #34d399; border-color: rgba(52, 211, 153, 0.25); }
    .stat-pill.due-alert { color: #f59e0b; border-color: rgba(245, 158, 11, 0.4); animation: pulse 2s infinite; }

    /* Clean Hero Section */
    .claude-hero-wrapper {
        text-align: center;
        padding: 24px 10px 18px 10px;
    }

    .claude-hero-title {
        font-size: 2.2rem;
        font-weight: 800;
        color: #f8fafc;
        letter-spacing: -0.03em;
        margin-bottom: 6px;
    }

    .claude-hero-subtitle {
        color: #94a3b8;
        font-size: 1.05rem;
        margin-bottom: 20px;
    }

    /* Floating Claude Prompt Card Box */
    .claude-prompt-card {
        background: rgba(30, 41, 59, 0.65);
        border: 1.5px solid rgba(99, 102, 241, 0.25);
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(12px);
        margin-bottom: 20px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .claude-prompt-card:focus-within {
        border-color: rgba(99, 102, 241, 0.6);
        box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.25);
    }

    /* React-style Custom Tabs */
    .stTabs [data-baseweb="tab-list"] {
        display: flex;
        justify-content: center;
        gap: 8px;
        background: rgba(15, 23, 42, 0.5);
        padding: 6px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        margin-bottom: 24px;
    }

    .stTabs [data-baseweb="tab"] {
        border-radius: 12px;
        padding: 8px 18px;
        font-size: 0.9rem;
        font-weight: 700;
        color: #94a3b8;
        border: none !important;
        background: transparent;
        transition: all 0.2s ease;
    }

    .stTabs [data-baseweb="tab"][aria-selected="true"] {
        background: rgba(99, 102, 241, 0.2) !important;
        color: #818cf8 !important;
        border: 1px solid rgba(99, 102, 241, 0.35) !important;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    }

    /* Custom Streamlit Text Area */
    div[data-testid="stTextArea"] textarea {
        background: rgba(15, 23, 42, 0.6) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 14px !important;
        color: #f8fafc !important;
        font-size: 1.05rem !important;
        padding: 14px 16px !important;
        line-height: 1.6 !important;
    }

    div[data-testid="stTextArea"] textarea:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
    }

    /* Primary Gradient Button */
    div.stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
        border: none !important;
        border-radius: 14px !important;
        padding: 10px 24px !important;
        font-size: 1rem !important;
        font-weight: 700 !important;
        color: #fff !important;
        box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.4) !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    div.stButton > button[kind="primary"]:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 12px 28px -4px rgba(99, 102, 241, 0.6) !important;
    }

    div.stButton > button[kind="secondary"] {
        background: rgba(30, 41, 59, 0.6) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 14px !important;
        color: #cbd5e1 !important;
        font-weight: 600 !important;
        transition: all 0.2s ease !important;
    }

    div.stButton > button[kind="secondary"]:hover {
        border-color: #818cf8 !important;
        color: #fff !important;
        transform: translateY(-1px) !important;
    }

    /* Flashcard Stage (React 3D Look) */
    .flashcard-stage {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 20px 0 24px 0;
    }

    /* Topic History Cards */
    .history-card {
        background: rgba(30, 41, 59, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        padding: 18px 22px;
        margin-bottom: 14px;
        backdrop-filter: blur(12px);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .history-card:hover {
        border-color: rgba(99, 102, 241, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 10px 24px -6px rgba(0, 0, 0, 0.35);
    }

    .history-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .history-topic-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: #f8fafc;
        margin: 0;
    }

    .history-meta-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 6px;
    }

    .history-meta-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.06);
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        color: #94a3b8;
    }

    .mixed-review-banner {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
        border: 1.5px solid rgba(99, 102, 241, 0.35);
        border-radius: 18px;
        padding: 20px 24px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        backdrop-filter: blur(12px);
    }

    .react-flashcard-card {
        width: 100%;
        max-width: 650px;
        min-height: 290px;
        background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
        border: 1.5px solid rgba(99, 102, 241, 0.35);
        border-radius: 24px;
        padding: 36px 32px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .react-flashcard-card:hover {
        border-color: rgba(99, 102, 241, 0.65);
        transform: translateY(-3px);
        box-shadow: 0 24px 48px -10px rgba(99, 102, 241, 0.2);
    }

    .card-top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .card-tag-pill {
        background: rgba(99, 102, 241, 0.15);
        color: #a5b4fc;
        border: 1px solid rgba(99, 102, 241, 0.3);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .card-status-label {
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    .card-body-text {
        font-size: 1.45rem;
        font-weight: 600;
        line-height: 1.6;
        color: #f8fafc;
        text-align: center;
        padding: 28px 12px;
    }

    .card-footer-caption {
        text-align: center;
        font-size: 0.82rem;
        color: #64748b;
        font-weight: 500;
    }

    /* Badges & Gamification */
    .badges-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-top: 14px;
    }

    .badge-item {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 16px;
        text-align: center;
        transition: all 0.2s ease;
    }

    .badge-item.active {
        border-color: rgba(99, 102, 241, 0.4);
        background: rgba(99, 102, 241, 0.08);
    }

    .badge-icon { font-size: 2.2rem; margin-bottom: 6px; }
    .badge-title { font-weight: 700; font-size: 0.9rem; color: #f8fafc; }
    .badge-desc { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; }
    </style>
    """, unsafe_allow_html=True)


def get_greeting() -> str:
    """Returns dynamic time-of-day greeting identical to React StudyIQ."""
    hour = datetime.now().hour
    if hour >= 22 or hour < 4:
        return "It’s a late-night study session."
    elif hour >= 4 and hour < 12:
        return "Good morning. What are we mastering today?"
    elif hour >= 12 and hour < 18:
        return "Good afternoon. Ready to study?"
    else:
        return "It’s an evening study session."


def render_top_navbar(streak: int = 3, xp: int = 180, level: int = 2, due_count: int = 0):
    """
    Renders the clean floating navbar at the top.
    """
    due_badge = f'<div class="stat-pill due-alert">🔄 {due_count} Due</div>' if due_count > 0 else '<div class="stat-pill due">✨ 0 Due</div>'
    
    st.markdown(f"""
    <div class="react-top-navbar">
        <div class="brand-group">
            <div class="brand-icon-box">⚡</div>
            <span class="brand-text">StudyIQ</span>
            <span class="brand-sub-badge">AI STUDIO</span>
        </div>
        <div class="stats-dock-pills">
            <div class="stat-pill streak">🔥 {streak}d Streak</div>
            <div class="stat-pill xp">⚡ Lvl {level} ({xp} XP)</div>
            {due_badge}
        </div>
    </div>
    """, unsafe_allow_html=True)


def render_react_flashcard(card: Dict[str, Any], is_flipped: bool = False):
    """
    Renders an index card identical to React FlashcardDeck.
    """
    tag = card.get("tag", "Concept")
    front = card.get("front", "Question")
    back = card.get("back", "Answer")
    
    side_label = '<span style="color: #34d399;">💡 ANSWER</span>' if is_flipped else '<span style="color: #818cf8;">❓ PROMPT</span>'
    content = back if is_flipped else front
    hint = "Rate your recall quality below to schedule next SM-2 interval" if is_flipped else "Click 'Flip Card' below or press Space to reveal answer"

    st.markdown(f"""
    <div class="flashcard-stage">
        <div class="react-flashcard-card">
            <div class="card-top-row">
                <span class="card-tag-pill">{tag}</span>
                <span class="card-status-label">{side_label}</span>
            </div>
            <div class="card-body-text">
                {content}
            </div>
            <div class="card-footer-caption">
                {hint}
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


def render_achievement_badges():
    """
    Renders gamification badges.
    """
    badges = [
        {"icon": "🌱", "title": "First Step", "desc": "Created first AI study kit", "active": True},
        {"icon": "🔥", "title": "3-Day Streak", "desc": "Studied 3 days in a row", "active": True},
        {"icon": "🏆", "title": "Quiz Master", "desc": "100% score on diagnostic quiz", "active": True},
        {"icon": "⚡", "title": "Active Recall", "desc": "Mastered SM-2 flashcard deck", "active": True},
        {"icon": "🎙️", "title": "Voice Scholar", "desc": "Transcribed voice lecture", "active": True}
    ]

    html = ['<div class="badges-container">']
    for b in badges:
        html.append(f"""
        <div class="badge-item {'active' if b['active'] else ''}">
            <div class="badge-icon">{b['icon']}</div>
            <div class="badge-title">{b['title']}</div>
            <div class="badge-desc">{b['desc']}</div>
        </div>
        """)
    html.append('</div>')
    st.markdown("".join(html), unsafe_allow_html=True)


def render_history_topic_card(topic: str, created_at: str, summary: str, card_count: int, quiz_count: int, due_count: int, is_current: bool = False):
    """
    Renders a clean topic card for Topic History without any markdown code block escaping issues.
    """
    active_badge = '<span class="brand-sub-badge" style="background:#10b98125; color:#34d399; border-color:#10b98150; margin-left:8px;">ACTIVE</span>' if is_current else ''
    due_badge = f'<span class="history-meta-pill" style="color: #fbbf24;">🔄 {due_count} Due Today</span>' if due_count > 0 else '<span class="history-meta-pill" style="color: #34d399;">✨ Mastered</span>'
    short_sum = (summary or "Comprehensive active recall study kit.")[:120]
    border_style = 'border-color: rgba(99, 102, 241, 0.6);' if is_current else ''

    html = f"""<div class="history-card" style="{border_style}">
<div class="history-card-header">
<div><span class="history-topic-title">{topic}</span>{active_badge}</div>
<span style="font-size: 0.75rem; color: #94a3b8;">📅 {created_at}</span>
</div>
<div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 8px;">{short_sum}...</div>
<div class="history-meta-row">
<span class="history-meta-pill">🗂️ {card_count} Flashcards</span>
<span class="history-meta-pill">🎯 {quiz_count} Quizzes</span>
{due_badge}
</div>
</div>"""
    st.markdown(html, unsafe_allow_html=True)


def plot_accuracy_line_chart(history: List[Dict[str, Any]]) -> go.Figure:
    """
    Plotly line chart for session accuracy over time.
    """
    if not history:
        dates = ["Session 1", "Session 2", "Session 3", "Session 4"]
        accuracies = [70, 80, 85, 92]
    else:
        dates = [f"Session {i+1}" for i in range(len(history))]
        accuracies = [h.get("accuracy", 75) for h in history]

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=dates,
        y=accuracies,
        mode="lines+markers",
        name="Accuracy %",
        line=dict(color="#818cf8", width=3, shape="spline"),
        marker=dict(size=8, color="#c084fc", line=dict(color="#0f172a", width=2))
    ))

    fig.update_layout(
        title=dict(text="<b>Accuracy Over Time</b>", font=dict(size=14, color="#f8fafc")),
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(t=35, b=20, l=30, r=20),
        yaxis=dict(range=[0, 105], gridcolor="rgba(255,255,255,0.06)"),
        xaxis=dict(gridcolor="rgba(255,255,255,0.06)"),
        height=240
    )
    return fig


def plot_mastery_donut_chart(cards: List[Dict[str, Any]]) -> go.Figure:
    """
    Plotly donut chart for deck mastery distribution.
    """
    if not cards:
        cards = [{"mastery_score": 85}, {"mastery_score": 50}, {"mastery_score": 20}]

    mastered = sum(1 for c in cards if c.get("mastery_score", 0) >= 80)
    in_prog = sum(1 for c in cards if 30 <= c.get("mastery_score", 0) < 80)
    learning = sum(1 for c in cards if c.get("mastery_score", 0) < 30)

    fig = go.Figure(data=[go.Pie(
        labels=["Mastered (≥80%)", "In Progress", "Learning (<30%)"],
        values=[mastered, in_prog, learning],
        hole=0.62,
        marker=dict(colors=["#10b981", "#6366f1", "#f59e0b"], line=dict(color="#0f172a", width=2)),
        textinfo="percent",
        hoverinfo="label+value"
    )])

    fig.update_layout(
        title=dict(text="<b>Deck Mastery Breakdown</b>", font=dict(size=14, color="#f8fafc")),
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(t=35, b=20, l=20, r=20),
        height=240,
        showlegend=True,
        legend=dict(orientation="h", yanchor="bottom", y=-0.25, xanchor="center", x=0.5)
    )
    return fig
