# AI Study Assistant (StudyIQ) 🚀

An AI-powered Study Assistant web application built with React, Vite, Node.js/Express, Anthropic Claude API, Zod schema validation, SM-2 spaced repetition, and modern web analytics.

![App Screenshot Placeholder](https://img.shields.value)

---

## 🌟 Key Features

1. **Free-Form & Document Input**:
   - Paste free-form notes or upload PDF/Word (`.docx`) documents.
   - **Client-Side Document Parsing**: Extracted safely in browser using `pdfjs-dist` (PDF) and `mammoth` (DOCX). Non-extractable scanned files, empty files, and corrupted formats fail gracefully with user-friendly error banners without crashing the application.

2. **AI Generation Backend & Zod Schema Validation**:
   - Node/Express backend (`server.js` and `/api/generate.js`) invoking `@anthropic-ai/sdk` (Claude 3.5 Sonnet).
   - Strict system prompt returning structured JSON (topic, concepts, flashcards, MCQs, True/False, Fill-in-the-blank with per-item explanations).
   - **Frontend Resilience**: Every API response is strictly parsed with `zod` before rendering. Includes `AbortController` cancellation to prevent stale response overwrites.
   - **Offline Mock Generator**: Seamless fallback when `ANTHROPIC_API_KEY` is not present, making local evaluation instant.

3. **Spaced Repetition Flashcards (SM-2 Algorithm)**:
   - 3D CSS card flip animations (click/tap or keyboard `Space`/`Enter`).
   - Rate cards as "Easy" or "Hard" to update SuperMemo SM-2 interval multipliers and next review dates in `localStorage`.
   - "Review Due Cards" mode pulls only flashcards due today.

4. **Multi-Format Quiz Engine**:
   - Supports MCQ, True/False, and Fill-in-the-blank question types.
   - Configurable per-question countdown timer (10s, 20s, 30s, or Off) with auto-advance.
   - Instant scoring with AI-generated explanations on incorrect answers.
   - **Voice Quiz Mode**: Web Speech API (`SpeechRecognition`) integration for vocal answering.
   - End-of-quiz loop: "Retry only wrong answers" until 100% mastery.

5. **Gamification & Streak Tracking**:
   - Earn XP for correct answers, session completions, flashcard reviews, and streak days.
   - Level calculation formula: `Level = floor(sqrt(XP / 50)) + 1`.
   - Achievement badges (7-day streak, 100 cards reviewed, perfect quiz, etc.) with celebratory particle confetti.
   - Persistent top header bar showcasing XP, level progress bar, and streak counter.

6. **Performance Analytics Dashboard**:
   - Rolling average accuracy across sessions.
   - Interactive `recharts` graphs: Accuracy over time line chart and "Topics Needing Improvement" error rate bar chart.
   - Session history table stored in `localStorage`.

7. **Export & Zero-Auth Sharing**:
   - **Export as PDF**: Printable study guide using `jspdf`.
   - **Export as CSV**: Flashcards front/back export.
   - **Compressed URL Sharing**: Uses `lz-string` to encode study sets into shareable URL parameters, requiring zero backend or user accounts.
   - **JSON File Import/Export**: Save and load `.json` study sets locally.

8. **Dev-Only Debug Panel**:
   - Live testing toggle to inject malformed JSON, empty response, network 500 error, or timeout into the pipeline to demonstrate error boundaries and Zod validation resilience.

---

## 🛠️ Tech Stack & Architecture Overview

- **Frontend**: React 18, Vite, JavaScript, CSS3 (Glassmorphism, CSS Variables, 3D Transforms)
- **Validation**: Zod (`studySchema.js`)
- **State Architecture**: Business logic isolated in custom hooks:
  - `useGenerate.js`: API execution, AbortController, Zod parsing, debug overrides.
  - `useSpacedRepetition.js`: SM-2 algorithm & localStorage card intervals.
  - `useGamification.js`: XP calculation, level progression, streaks, badges.
  - `useSessionHistory.js`: Performance history, rolling accuracy, Recharts data formatting.
  - `useSpeechRecognition.js`: Web Speech API voice control.
- **Backend / API**: Express (`server.js`) & Serverless Route (`api/generate.js`) with `@anthropic-ai/sdk`
- **Parsers & Utilities**: `pdfjs-dist`, `mammoth`, `jspdf`, `recharts`, `lz-string`, `canvas-confetti`, `lucide-react`

---

## 🚀 Setup & Local Running Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment (Optional)**:
   Create a `.env` file in the root directory:
   ```env
   ANTHROPIC_API_KEY=your_claude_api_key_here
   PORT=3001
   ```
   *Note: If no API key is provided, the application automatically uses a smart mock AI generator so you can test all features immediately!*

3. **Start the Application**:
   Run both the Express API server and Vite dev server:
   ```bash
   npm start
   ```
   Or run the Express server and Vite concurrently:
   ```bash
   node server.js
   ```
   Then open `http://localhost:5173` (or `http://localhost:3001` for production build).

---

## 💡 AI-Usage Note

This project was designed and built with the assistance of Anthropic's Claude 3.5 Sonnet model. AI was utilized to model the structured prompt schema for tool-use generation, generate fallback mock datasets for zero-config offline testing, refine the SM-2 algorithm implementation, and construct the glassmorphism UI design tokens.

---

## ⚠️ Known Limitations

1. **Scanned Image-Only PDFs**: OCR (Optical Character Recognition) is not included in the client-side parser bundle to keep application size lightweight. Scanned PDFs containing only raster images will return a clear message prompting text paste or DOCX upload.
2. **Browser Voice Support**: Web Speech API is supported natively in modern versions of Google Chrome, Microsoft Edge, and Safari. Browsers without speech recognition support will gracefully hide the voice trigger and show an informative message.

---

## ⏱️ Time Spent

- **Architecture & Setup**: ~30 mins
- **Client-Side Document Parsing & Zod Schemas**: ~45 mins
- **SM-2 Algorithm & Custom Hooks**: ~60 mins
- **UI Components (Flashcards 3D, Quiz, Voice, Dashboard)**: ~90 mins
- **Export/Share Utilities & Dev Debug Panel**: ~45 mins
- **Total Time**: ~4.5 hours
