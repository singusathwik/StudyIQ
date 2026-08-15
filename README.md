# AI Study Assistant (StudyIQ) 🚀

> 🌐 **Live Website**: [https://study-iq-five.vercel.app/](https://study-iq-five.vercel.app/)

StudyIQ is an advanced AI-powered Study Assistant web application built with React, Vite, Node.js/Express, Google Gemini & Anthropic Claude APIs, Zod schema validation, SuperMemo SM-2 spaced repetition, and interactive voice intelligence.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://study-iq-five.vercel.app/)
[![Voice-Powered](https://img.shields.io/badge/Voice--Powered-Live%20Dictation%20%26%20Quiz-ff6b6b?style=flat&logo=mic&logoColor=white)](https://study-iq-five.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎙️ Spotlight Feature: Voice Intelligence & Hands-Free Audio Studio

StudyIQ features an interactive **Voice-First Learning Engine** that allows you to generate study kits, dictate chaotic lectures, and answer quiz questions completely hands-free using your voice.

```
                  ┌────────────────────────────────────────────────────────┐
                  │              🎙️ StudyIQ Voice Engine                  │
                  └────────────────────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│   🗣️ Live Lecture Dictation     │           │   🎯 Hands-Free Voice Quizzes   │
│ • Real-time Speech-to-Text      │           │ • Answer MCQs & T/F out loud    │
│ • Live Audio Waveform Canvas    │           │ • Smart Fuzzy Phonetic Match    │
│ • Auto Topic Detection          │           │ • Instant Answer Feedback       │
└─────────────────────────────────┘           └─────────────────────────────────┘
```

### 1. 🎙️ Real-Time Lecture Dictation & Spoken Prompts
- **Continuous Voice Streaming**: Click **"Speak Lecture"** to speak your thoughts, rambling class notes, or complex topics directly into your microphone.
- **Dynamic Waveform Visualizer**: Powered by the Web Audio API (`AudioContext` and `AnalyserNode`), rendering real-time responsive audio frequencies that pulse to your voice.
- **Automatic Topic Detection**: Intelligently extracts and fills the topic title from the opening words of your speech.
- **"Speak Chaotic Lecture" Mode**: Effortlessly handles fast or unorganized speech and transforms it into structured study kits, flashcard decks, and quiz sets.

### 2. 🎯 Hands-Free Voice Quiz Arena
- **Vocal Quiz Answering**: Practice flashcards and answer quiz questions aloud without touching the keyboard or mouse.
- **Phonetic & Option Matching**: Recognizes phrases like *"Option A"*, *"Option B"*, *"True"*, *"False"*, or spoken answers and automatically selects the matching option.
- **Active Recall for On-the-Go**: Perfect for hands-free studying during commutes, walks, gym workouts, or for enhanced accessibility.

### 3. ⚡ Resilient Dual-Engine Voice Architecture
- **Web Speech API**: Low-latency continuous speech recognition supported in Chrome, Edge, and Safari.
- **Graceful Error Handling**: Detects microphone permissions, network status, and unsupported browser states with intuitive UI prompts and text fallbacks.

---

## 🌟 All Core Features

1. **🎙️ Voice Intelligence & Real-Time Waveform Visualizer**:
   - Voice lecture transcription, hands-free quiz answering, and live canvas audio visualizer.

2. **🧠 Multi-Model AI Generation (Google Gemini 2.5 Flash & Claude 3.5 Sonnet)**:
   - Transforms notes, questions, or documents into structured flashcards, MCQs, True/False, and Fill-in-the-Blank quizzes.
   - Strict JSON parsing with **Zod** schema validation for rock-solid error resilience.
   - Smart offline mock fallback for instant zero-config exploration.

3. **🗂️ ChatGPT-Style Collapsible Sidebar**:
   - Clean navigation rail with saved study kit history, search filter, pinned topics, and quick tab switching.
   - Starts collapsed on launch for a distraction-free workspace.

4. **🔄 Spaced Repetition Flashcards (SuperMemo SM-2 Algorithm)**:
   - 3D CSS card flip animations (click/tap, keyboard `Space`/`Enter`, or swipe).
   - "Easy" / "Hard" feedback intervals updating memory stability and optimal recall intervals in `localStorage`.
   - "Review Due Cards" mode filtering only flashcards scheduled for review today.

5. **🏆 Multi-Format Quiz Arena**:
   - Supports MCQs, True/False, and Fill-in-the-Blank with optional timer countdowns (10s, 20s, 30s).
   - Instant scoring with AI-generated explanations on incorrect answers.
   - "Retry only wrong answers" loop until 100% mastery.

6. **🎮 Gamification & Streak Tracking**:
   - Earn XP for correct answers, completed sessions, and daily streaks.
   - Level progression (`Level = floor(sqrt(XP / 50)) + 1`) and unlockable achievement badges.

7. **📊 Performance Analytics Dashboard**:
   - Interactive `recharts` graphs: Accuracy over time line chart and "Topics Needing Improvement" error rate bar chart.
   - Historical session tracking stored in `localStorage`.

8. **📤 Zero-Auth Sharing & Export Utilities**:
   - **Export PDF / CSV**: Printable study guide and flashcard exports.
   - **Compressed URL Sharing**: Uses `lz-string` to encode study sets directly into shareable links with zero backend accounts needed.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Vanilla CSS3 (Glassmorphism, 3D Transforms, Responsive Grid)
- **Audio & Speech**: Web Speech API (`SpeechRecognition`), Web Audio API (`AudioContext`, `AnalyserNode`), HTML5 Canvas
- **AI Models**: Google Gemini 2.5 Flash, Anthropic Claude 3.5 Sonnet, Groq
- **Validation**: Zod (`studySchema.js`)
- **State Hooks**:
  - `useSpeechRecognition.js`: Hybrid speech recognition & live frequency waveform analysis.
  - `useGenerate.js`: API execution, AbortController, Zod parsing.
  - `useSpacedRepetition.js`: SuperMemo SM-2 algorithm & localStorage intervals.
  - `useGamification.js`: XP calculation, level progression, streaks, badges.
  - `useSessionHistory.js`: Performance history, rolling accuracy, Recharts data formatting.
  - `useSavedKits.js`: Study kit persistence & management.
- **Backend / API**: Express (`server.js`) & Vercel Serverless Route (`api/generate.js`)
- **Parsers & Utilities**: `pdfjs-dist`, `mammoth`, `jspdf`, `recharts`, `lz-string`, `canvas-confetti`, `lucide-react`

---

## 🚀 Setup & Local Running Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/singusathwik/StudyIQ.git
   cd StudyIQ
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Create a `.env` file in the root directory:
   ```env
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   PORT=3001
   ```
   *Note: If no API key is provided, the application automatically uses a smart mock AI generator so you can test all features immediately!*

4. **Start the Application**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🌐 Live Website

Access the live web application on Vercel:
👉 **[https://study-iq-five.vercel.app/](https://study-iq-five.vercel.app/)**

---

## 📄 License

This project is licensed under the MIT License.
