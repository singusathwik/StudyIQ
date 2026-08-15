# AI Study Assistant (StudyIQ) 🚀

> 🌐 **Live Website**: [https://study-iq-five.vercel.app/](https://study-iq-five.vercel.app/)

StudyIQ is an advanced AI-powered Study Assistant web application built with React, Vite, Node.js/Express, Google Gemini & Anthropic Claude APIs, Zod schema validation, SuperMemo SM-2 spaced repetition, and modern web analytics.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://study-iq-five.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🌟 Key Features

1. **AI Generation with Multi-Model Support (Google Gemini & Anthropic Claude)**:
   - Generate interactive flashcards, MCQs, True/False, and Fill-in-the-Blank quizzes from any topic, prompt, or lecture notes.
   - Strict system prompt returning structured JSON parsed safely with **Zod** schema validation.
   - Built-in offline fallback dataset for instant zero-config testing.

2. **ChatGPT-Style Collapsible Sidebar**:
   - Modern, sleek sidebar with history logs, search, pinned study kits, and recent sessions.
   - Smooth transition between expanded full view and collapsed slim rail mode.
   - Defaults to collapsed mode on launch for maximum workspace focus.

3. **Hybrid Speech-to-Text & Real-Time Waveform Visualizer**:
   - Speak directly into the microphone to transcribe lecture audio or prompts in real time.
   - Live Canvas waveform frequency visualizer with active microphone pulse animations.

4. **Spaced Repetition Flashcards (SuperMemo SM-2 Algorithm)**:
   - 3D CSS flip animations with keyboard navigation (`Space`, `Enter`, Arrow Keys).
   - "Easy" / "Hard" feedback intervals updating memory stability in `localStorage`.
   - Dedicated "Review Due Cards" modal targeting only cards due for review.

5. **Multi-Format Quiz Arena**:
   - Supports Multiple Choice, True/False, and Fill-in-the-blank question types.
   - Configurable countdown timer (10s, 20s, 30s, or Off) with auto-advancement.
   - Instant scoring with AI-generated explanations on incorrect answers.
   - "Retry only wrong answers" loop until 100% mastery.

6. **Gamification & Streak Tracking**:
   - Earn XP for correct answers, completed sessions, and daily study streaks.
   - Dynamic Leveling formula (`Level = floor(sqrt(XP / 50)) + 1`).
   - Unlock achievement badges with celebratory confetti particles.

7. **Performance Analytics Dashboard**:
   - Rolling average accuracy across sessions.
   - Interactive `recharts` graphs: Accuracy over time line chart and "Topics Needing Improvement" error rate bar chart.
   - Session history table stored in `localStorage`.

8. **Zero-Auth Sharing & Export Utilities**:
   - **Export as PDF**: Printable study summary via `jspdf`.
   - **Export as CSV**: Flashcards export for Anki and spreadsheet import.
   - **Compressed URL Sharing**: Uses `lz-string` to encode study sets directly into shareable URLs with zero backend storage requirement.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS3 (Custom Design Tokens, Glassmorphism, 3D Transforms)
- **AI Models**: Google Gemini 2.5 Flash, Anthropic Claude 3.5 Sonnet, Groq
- **Schema Validation**: Zod (`studySchema.js`)
- **State & Logic Hooks**:
  - `useGenerate.js`: API execution, AbortController, Zod parsing.
  - `useSpacedRepetition.js`: SuperMemo SM-2 algorithm & localStorage intervals.
  - `useGamification.js`: XP calculation, level progression, streaks, badges.
  - `useSessionHistory.js`: Performance history, rolling accuracy, Recharts data formatting.
  - `useSavedKits.js`: Study kit persistence & management.
- **Backend / API**: Express (`server.js`) & Vercel Serverless Route (`api/generate.js`)
- **Libraries**: `pdfjs-dist`, `mammoth`, `jspdf`, `recharts`, `lz-string`, `canvas-confetti`, `lucide-react`

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

## 🌐 Deployment

The application is deployed on Vercel:
👉 **[https://study-iq-five.vercel.app/](https://study-iq-five.vercel.app/)**

---

## 📄 License

This project is licensed under the MIT License.
