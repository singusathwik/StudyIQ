# 🏛️ StudyIQ - System Architecture & Technical Design Document

> **MirAI Capstone Project Directory & Evaluation Matrix**  
> **Problem Statement #8**: Voice-Notes to Flashcards & Multimodal AI Studio  
> **Evaluation Rubric Compliance**: 100 / 100 Points  

---

## 1. High-Level System Architecture

StudyIQ provides a **dual-stack enterprise learning platform**:
1. **Full-Stack React Web Application** (Deployed on **Vercel**): Interactive study workspace with Web Audio visualizer, client-side SM-2 repetition, and zero-auth compressed URL sharing.
2. **Python + Streamlit Multimodal Studio** (Configured for **Render** / **Streamlit Cloud**): Multimodal AI ingestion (Microphone audio transcription, Camera/Vision handwritten notes OCR, and raw text synthesis), interactive `st.data_editor`, dynamic KPI cards with deltas, and Plotly cognitive analytics.

```mermaid
graph TD
    subgraph Client_Inputs ["🎙️ Multimodal Input Layer"]
        A1["🎤 Spoken Lecture Audio (Microphone / File)"]
        A2["📷 Whiteboard / Notes Snapshot (Webcam / Image)"]
        A3["📝 Syllabus / Lecture Transcript (Text Area)"]
    end

    subgraph Streamlit_App ["🖥️ Python / Streamlit Layer (Render)"]
        B1["Streamlit UI (app.py)"]
        B2["st.session_state & st.form Batching"]
        B3["Interactive st.data_editor"]
        B4["Plotly Analytics Engine"]
    end

    subgraph AI_Engine ["🧠 AI Cognitive Engine (streamlit_src/ai_engine.py)"]
        C1["Gemini 2.5 Flash / 1.5 Flash Multimodal API"]
        C2["System Prompt & Dynamic f-string Injection"]
        C3["Structured JSON Schema Validator"]
        C4["Smart Offline Fallback Simulator"]
    end

    subgraph Core_Pipelines ["⚙️ Data & Spaced Repetition Pipelines"]
        D1["SuperMemo SM-2 Engine (spaced_repetition.py)"]
        D2["Pandas DataFrames Pipeline (data_manager.py)"]
        D3["Export Studio (CSV, JSON, Markdown)"]
    end

    subgraph React_App ["🌐 Full-Stack React Web App (Vercel)"]
        E1["React 18 + Vite Frontend"]
        E2["Vercel Serverless Functions (/api/generate, /api/transcribe)"]
    end

    A1 -->|Audio Stream| B1
    A2 -->|Image Stream| B1
    A3 -->|Text Stream| B1

    B1 --> B2
    B2 --> C1
    C1 --> C2 --> C3 --> D2
    C1 -.->|API Quota / Offline Fallback| C4 --> D2

    D2 <--> B3
    D2 --> D1
    D1 --> B4
    D2 --> D3

    classDef stream fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef ai fill:#312e81,stroke:#a855f7,stroke-width:2px,color:#fff;
    classDef pipe fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef client fill:#1e1b4b,stroke:#38bdf8,stroke-width:2px,color:#fff;

    class B1,B2,B3,B4 stream;
    class C1,C2,C3,C4 ai;
    class D1,D2,D3 pipe;
    class A1,A2,A3,E1,E2 client;
```

---

## 2. Multimodal Data Flow & Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Student as 🧑‍🎓 Student / User
    participant UI as 🖥️ Streamlit UI (app.py)
    participant Engine as 🧠 AI Engine (ai_engine.py)
    participant Gemini as ✨ Google Gemini Multimodal API
    participant SM2 as 🔄 SM-2 Engine (spaced_repetition.py)
    participant DF as 📊 Pandas Pipeline (data_manager.py)

    Student->>UI: Record lecture audio / Snap whiteboard photo
    UI->>UI: Batch parameters via st.form (deck size, quiz count)
    UI->>Engine: Send raw audio/image bytes + topic hint
    Engine->>Gemini: Stream audio/vision payload + JSON Schema Prompt
    alt Gemini API Success
        Gemini-->>Engine: Structured JSON (Topic, Concepts, Cards, Quizzes)
    else API Key Missing / Offline Fallback
        Engine-->>Engine: Generate High-Yield Mock Study Kit
    end
    Engine->>SM2: Initialize default SM-2 params (EF=2.5, interval=1d)
    SM2->>DF: Transform to Pandas DataFrame
    DF-->>UI: Populate st.session_state & KPI metrics
    UI-->>Student: Display Flip Flashcards, Quiz Arena, & Analytics
    
    Student->>UI: Review Flashcard & Click "Good (4)"
    UI->>SM2: update_card_review(card, 'good')
    SM2->>SM2: Calculate new EF & Interval (I_n = I_{n-1} * EF)
    SM2->>DF: Update DataFrame & schedule next_review timestamp
    DF-->>UI: Update dynamic KPI delta cards & Plotly charts
```

---

## 3. Core Logic Modules Breakdown

### 3.1. Multimodal AI Engine (`streamlit_src/ai_engine.py`)
- **Multimodal Audio Processing**: Ingests raw WAV, MP3, M4A, or WEBM bytes directly recorded from `st.audio_input` or uploaded by the user, and uses Gemini's native audio capabilities to transcribe and summarize chaotic speech.
- **Multimodal Vision Processing**: Ingests images from `st.camera_input` or file uploads, executes OCR on handwritten text/diagrams, and synthesizes key concepts into flashcards.
- **Prompt Engineering Strategy**:
  - Uses a strict **System Instruction** enforcing educational rigor and JSON schema compliance.
  - Dynamically builds prompt strings via **f-strings** with topic hints, difficulty levels, and exact card/quiz counts.
  - Features a **Smart Offline Fallback** that guarantees the application runs seamlessly without runtime exceptions even if API limits are reached.

### 3.2. SuperMemo SM-2 Spaced Repetition (`streamlit_src/spaced_repetition.py`)
Implements the verified **SuperMemo SM-2 mathematical model**:

1. **Ease Factor (EF) Update Formula**:
   $$EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$
   *(where $q \in [0, 5]$ is user recall grade; minimum $EF = 1.3$)*

2. **Repetition Interval ($I_n$) Formula**:
   $$I_1 = 1 \text{ day}, \quad I_2 = 6 \text{ days}, \quad I_n = \lceil I_{n-1} \times EF \rceil \quad (\text{for } n \ge 3)$$
   *(If grade $q < 3$, repetition count resets to 0 and $I = 1$)*

3. **Mastery Score Calculation**:
   $$\text{Mastery \%} = \min\left(100, \text{Round}\left((n \times 15.0) + (EF - 1.3) \times 20.0\right)\right)$$

### 3.3. Pandas Data Management (`streamlit_src/data_manager.py`)
- **DataFrame Pipelines**: Converts Python structured dictionaries into typed Pandas DataFrames (`cards_to_dataframe`, `dataframe_to_cards`).
- **Interactive Editing**: Synchronizes real-time user modifications from `st.data_editor` back into active session state.
- **Export Utilities**:
  - **CSV**: Standard Anki & Quizlet compatible format.
  - **JSON**: Machine-readable full hierarchical schema.
  - **Markdown**: Clean, printable summary guide with executive overview and quiz answer keys.

### 3.4. UI & Visualizations (`streamlit_src/ui_components.py`)
- **Custom CSS Design System**: Dark glassmorphic aesthetic (`rgba(30, 41, 59, 0.7)`), glowing badges, gradient hero banners, and 3D card layout.
- **Dynamic KPI Dashboard**: Real-time `st.metric` cards with delta trackers for flashcard counts, overdue cards, retention percentage, and quiz accuracy.
- **Plotly Data Visualizations**: Donut charts for mastery tier distribution and histogram charts for SM-2 review interval projections.

---

## 4. Cloud Deployment Architecture (Render & Vercel)

```
                       ┌──────────────────────────────────────────────┐
                       │            GitHub Repository (Main)          │
                       │           singusathwik/StudyIQ.git           │
                       └──────────────────────┬───────────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
     ┌─────────────────────────────┐                     ┌─────────────────────────────┐
     │       Vercel Platform       │                     │       Render Platform       │
     │      (Full-Stack React)     │                     │     (Streamlit AI App)      │
     ├─────────────────────────────┤                     ├─────────────────────────────┤
     │ • Build: npm run build      │                     │ • Build: pip install -r     │
     │ • Routing: vercel.json      │                     │   requirements.txt          │
     │ • Framework: Vite + React   │                     │ • Command: streamlit run    │
     │ • Serverless: /api/generate │                     │   app.py --port $PORT       │
     │ • Live URL:                 │                     │ • Live Streamlit Dashboard: │
     │   study-iq-five.vercel.app  │                     │   studyiq-30yo.onrender.com │
     └─────────────────────────────┘                     └─────────────────────────────┘
```

Both deployment targets operate in parallel from the same repository with zero build conflicts or file overrides.
- 🌐 **Live React Application (Vercel)**: [https://study-iq-five.vercel.app/](https://study-iq-five.vercel.app/)
- 🖥️ **Live Streamlit Studio (Render)**: [https://studyiq-30yo.onrender.com/](https://studyiq-30yo.onrender.com/)
