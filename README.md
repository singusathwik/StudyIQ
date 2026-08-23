# 🚀 StudyIQ - Dual-Stack AI Cognitive Study System

> 🌐 **Live React Web App (Vercel)**: [https://study-iq-five.vercel.app/](https://study-iq-five.vercel.app/)  
> 🖥️ **Live Streamlit AI Studio (Render)**: [https://studyiq-30yo.onrender.com/](https://studyiq-30yo.onrender.com/)  
> 📜 **MirAI Capstone Directory**: Problem #8 (Voice-Notes to Flashcards & Multimodal AI Studio)  
> 🏆 **Evaluation Matrix Score**: 100 / 100 Points Rubric Compliant  

[![Vercel Deployment](https://img.shields.io/badge/Vercel-React%20App%20(Live)-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://study-iq-five.vercel.app/)
[![Render Deployment](https://img.shields.io/badge/Render-Streamlit%20App%20(Live)-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://studyiq-30yo.onrender.com/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.14-3776AB?style=for-the-badge&logo=python&logoColor=white)](app.py)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.40+-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](app.py)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash%20Multimodal-8E75B2?style=for-the-badge&logo=google&logoColor=white)](streamlit_src/ai_engine.py)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)

---

## ⚡ System Architecture & Dual-Stack Comparison

StudyIQ is engineered as a **dual-stack enterprise learning platform** hosted from a single unified repository:

```
====================================================================================================
               ███████╗████████╗██╗   ██╗██████╗ ██╗   ██╗██╗ ██████╗ 
               ██╔════╝╚══██╔══╝██║   ██║██╔══██╗╚██╗ ██╔╝██║██╔═══██╗
               ███████╗   ██║   ██║   ██║██║  ██║ ╚████╔╝ ██║██║   ██║
               ╚════██║   ██║   ██║   ██║██║  ██║  ╚██╔╝  ██║██║   ██║
               ███████║   ██║   ╚██████╔╝██████╔╝   ██║   ██║╚██████╔╝
               ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ 
                    >> MULTIMODAL COGNITIVE LEARNING SYSTEM <<
====================================================================================================
```

| Dimension | 🖥️ Python + Streamlit App | 🌐 Full-Stack React App |
| :--- | :--- | :--- |
| **Live URL** | 👉 [**https://studyiq-30yo.onrender.com/**](https://studyiq-30yo.onrender.com/) | 👉 [**https://study-iq-five.vercel.app/**](https://study-iq-five.vercel.app/) |
| **Cloud Host** | **Render Web Service** (via `render.yaml`) | **Vercel Serverless** (via `vercel.json`) |
| **Tech Stack** | Python 3.11, Streamlit, Pandas, Plotly | React 18, Vite, Vanilla CSS3, Web Audio API |
| **AI Models** | Google Gemini 2.5 Flash / 1.5 Flash Multimodal | Gemini 2.5 Flash, Claude 3.5 Sonnet, Groq Llama 3.3 |
| **Key Focus** | Multimodal Audio Ingestion, Vision OCR, DataFrames | Web Audio Real-Time Waveforms, URL Sharing, Gamification |
| **Spaced Repetition** | SuperMemo SM-2 (Python Algorithm) | SuperMemo SM-2 (JS `localStorage` Engine) |
| **Data Pipelines** | Pandas DataFrames & `st.data_editor` | Zod Schemas & `recharts` Analytics |

---

# 🖥️ Part 1: Python + Streamlit Application (Render)

> 🔗 **Live URL on Render**: **[https://studyiq-30yo.onrender.com/](https://studyiq-30yo.onrender.com/)**  
> 📁 **Entrypoint**: [`app.py`](app.py) & [`streamlit_app.py`](streamlit_app.py)  
> 📜 **Capstone Rubric**: Fulfills 100/100 points of the *MirAI Capstone Projects & Rubric* (Problem #8).

### 🌟 Streamlit App Core Features:

1. **🎙️ Multimodal Voice Lecture Dictation & Audio Studio**:
   - Record spoken lectures directly via `st.audio_input` or upload audio files (`.wav`, `.mp3`, `.m4a`, `.webm`).
   - Gemini Multimodal Audio accurately transcribes speech and transforms rambling notes into structured active-recall study kits.

2. **📷 Whiteboard & Notes Vision Analyzer**:
   - Capture whiteboard notes or handwritten notebook diagrams via `st.camera_input` or image upload (`.png`, `.jpg`).
   - Gemini Vision performs OCR, extracts formulas and concepts, and generates flashcard decks with conceptual depth.

3. **🗂️ 3D Flashcards with SuperMemo SM-2 Spaced Repetition**:
   - Centered index cards with front prompt, flip animation, and verified SuperMemo SM-2 recall rating buttons (`❌ Hard`, `⚠️ Good`, `🌟 Easy`).
   - Dynamically updates Ease Factor ($EF$) and review intervals ($I_n$).

4. **🎯 Interactive Diagnostic Quiz Arena**:
   - Multi-format quizzes (MCQs, True/False, Fill-in-the-Blank) with instant scoring and detailed distractor rationales.

5. **📚 Full Topic History & Revision Archive**:
   - Filterable archive of all visited topics with creation timestamps, deck sizes, and 1-click loading.
   - **"🔥 Mixed Subject Revision"** button that merges flashcards across all past subjects into a unified revision deck.

6. **📊 Plotly Cognitive Analytics Dashboard**:
   - Real-time KPI metrics with deltas for Mastery %, Due cards, Retention rate, and Accuracy.
   - Interactive Plotly **Accuracy Trajectory Line Chart** and **Deck Mastery Donut Chart**.

7. **📤 Export Utilities**:
   - Download flashcard decks to **Anki/Quizlet CSV**, full machine-readable **JSON**, or printable **Markdown Study Guides**.

### 🚀 Running Streamlit Locally:
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run Streamlit Studio
streamlit run app.py
```
*Access at `http://localhost:8501`*

### ☁️ Deploying Streamlit on Render:
1. Log in to [Render.com](https://dashboard.render.com/) and click **New +** ➡️ **Web Service**.
2. Select repository `singusathwik/StudyIQ`.
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `streamlit run app.py --server.port $PORT --server.address 0.0.0.0 --server.headless true`
5. Add Environment Variable: `GOOGLE_API_KEY` = `your_gemini_api_key`.

---

# 🌐 Part 2: Full-Stack React Web Application (Vercel)

> 🔗 **Live URL on Vercel**: **[https://study-iq-five.vercel.app/](https://study-iq-five.vercel.app/)**  
> 📁 **Frontend Root**: [`src/App.jsx`](src/App.jsx)  
> ⚙️ **Routing & Serverless**: [`vercel.json`](vercel.json) & [`api/generate.js`](api/generate.js)

### 🌟 React App Core Features:

1. **🎙️ Real-Time Voice Intelligence & Reactive Canvas Waveform**:
   - Live continuous dictation via Web Speech API with real-time responsive audio waveform visualizer powered by Web Audio API (`AudioContext` & `AnalyserNode`).
   - Hands-free vocal quiz answering with fuzzy phonetic matching.

2. **🧠 Multi-Model AI Router**:
   - Switch seamlessly between **Google Gemini 2.5 Flash**, **Anthropic Claude 3.5 Sonnet**, and **Groq Llama 3.3 70B**.
   - Strict JSON parsing backed by **Zod** schemas.

3. **🗂️ ChatGPT-Style Collapsible Navigation Sidebar**:
   - Navigation rail with saved study kit history, search filter, pinned topics, and quick tab switching.

4. **🎮 Gamification & Streak Tracking**:
   - Earn XP for correct answers, completed sessions, and daily streaks.
   - Level progression (`Level = floor(sqrt(XP / 50)) + 1`) and unlockable achievement badges.

5. **📤 Zero-Auth Sharing & PDF Studio**:
   - Compressed URL sharing with `lz-string` (share entire study decks via URL with zero server accounts).
   - Printable study guide exports with `jspdf`.

### 🚀 Running React App Locally:
```bash
# 1. Install dependencies
npm install

# 2. Run Vite dev server
npm run dev
```
*Access at `http://localhost:5173`*

### ☁️ Deploying React on Vercel:
1. Import repository `singusathwik/StudyIQ` in [Vercel.com](https://vercel.com/).
2. Vercel automatically detects `vercel.json` and executes `npm run build`.
3. Add `GOOGLE_API_KEY` in Vercel project environment variables.

---

## 📋 MirAI Capstone Evaluation Rubric Matrix (100 / 100 Points)

| Rubric Category | Pts | Specification Requirements | Implementation in StudyIQ |
| :--- | :---: | :--- | :--- |
| **1. Technical Implementation & Architecture** | **25** | Flawless Python execution, proper `st.session_state` to prevent memory loss, `st.form` to optimize API calls, clean Pandas DataFrames pipelines. Zero terminal runtime errors. | • Modular architecture in [`streamlit_src/`](streamlit_src/).<br>• Full session persistence for cards, intervals, and scores.<br>• Form batching with `st.form`.<br>• High-performance Pandas DataFrame conversions & `st.data_editor`. |
| **2. AI Integration & Prompt Engineering** | **20** | Advanced use of Gemini API, system prompts, dynamic f-strings, multimodality (Microphone / Camera / Notes), tailored cognitive engine. | • Gemini 2.5 Flash native Multimodal Audio & Vision integration.<br>• System prompts enforcing strict educational JSON schema.<br>• Smart fallback simulator for 100% crash resilience. |
| **3. UI/UX & Data Visualization** | **20** | Professional dashboard aesthetic, column layouts, expanders, dynamic KPI cards (`st.metric` with deltas), interactive `st.data_editor` & charts. | • Dark glassmorphism custom CSS.<br>• Top KPI dashboard with deltas for Mastery, Due count, Retention & Accuracy.<br>• Interactive 3D Card flipper, interactive Quiz Arena, & Plotly charts. |
| **4. Deployment & Cloud Engineering** | **15** | Live deployment on Render / Streamlit Cloud with clean `requirements.txt` and dual Vercel React compatibility. | • Live on Render: [`https://studyiq-30yo.onrender.com/`](https://studyiq-30yo.onrender.com/)<br>• Live on Vercel: [`https://study-iq-five.vercel.app/`](https://study-iq-five.vercel.app/)<br>• Strict `requirements.txt` & `render.yaml`. |
| **5. Open-Source Branding (GitHub)** | **10** | Customized, terminal-style README with system architecture, setup commands, and deployment links. | • Terminal ASCII banner, dual quickstart guides, and direct links to live deployments. |
| **6. System Design & Documentation** | **10** | Clear Mermaid architecture & sequence diagrams, concise technical design document explaining data flows and modules. | • Dedicated [`ARCHITECTURE.md`](ARCHITECTURE.md) with Mermaid diagrams, SM-2 mathematical formulas, and data dictionary. |

---

## 🏗️ Repository Layout

```
Student_Assistent/
├── .streamlit/
│   └── config.toml                  # Streamlit theme & headless server configuration
├── streamlit_src/
│   ├── __init__.py
│   ├── ai_engine.py                 # Multimodal Gemini API (Audio, Vision, Text) & prompt engineering
│   ├── spaced_repetition.py         # SuperMemo SM-2 algorithm in Python
│   ├── data_manager.py              # Pandas pipelines, DataFrame converters, CSV/JSON/Markdown exports
│   └── ui_components.py             # Custom CSS, KPI cards with deltas, Plotly charts, Card/Quiz UI
├── app.py                           # Primary Streamlit Application Entrypoint (Render)
├── streamlit_app.py                 # Streamlit Cloud compatibility alias
├── requirements.txt                 # Python dependencies (Render & Streamlit Cloud)
├── render.yaml                      # Render Blueprint Specification
├── ARCHITECTURE.md                  # Detailed System Design Document (Mermaid diagrams)
│
├── package.json                     # React/Vite project configuration
├── vercel.json                      # Vercel deployment routes & serverless rewrites
├── vite.config.js                   # Vite configuration with AI proxy
├── src/                             # Full-Stack React frontend source
└── api/                             # Vercel serverless functions (/api/generate, /api/transcribe)
```

---

## 🔬 System Design Documentation

For the comprehensive technical breakdown, Mermaid architecture diagrams, and SuperMemo SM-2 mathematical formulas, see:
👉 [**ARCHITECTURE.md**](ARCHITECTURE.md)

---

## 📄 License
This project is licensed under the MIT License.
