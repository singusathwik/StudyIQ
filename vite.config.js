// StudyIQ Vite Configuration with AI Local Proxy
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

function cleanAndParseJson(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

function generateMockStudyData(text, topicHint, numCards = 6, numQuizzes = 5) {
  const cleanText = text ? text.trim() : '';
  const titleTopic = topicHint || (cleanText.length > 0 
    ? cleanText.split('\n')[0].substring(0, 40).replace(/[^\w\s]/gi, '') 
    : 'Study Material');

  const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  const pool = sentences.length >= 4 ? sentences : [
    "Spaced repetition improves long-term memory retention by spacing review intervals over time.",
    "The SM-2 algorithm calculates card intervals using an Ease Factor (EF) starting at 2.5.",
    "Active recall forces the brain to retrieve information rather than passively reviewing notes.",
    "Gamification increases student engagement through streak tracking, XP points, and milestone badges.",
    "Formative assessment with instant feedback helps identify knowledge gaps quickly.",
    "Quantum computing uses qubits capable of existing in superposition states."
  ];

  const flashcardItems = [];
  for (let i = 0; i < Math.min(numCards, 25); i++) {
    const sent = pool[i % pool.length];
    const keyPhrase = sent.split(' ').slice(0, 4).join(' ');
    flashcardItems.push({
      id: `fc-${i + 1}`,
      front: `Concept ${i + 1}: What is the significance of "${keyPhrase}..."?`,
      back: sent
    });
  }

  const mcqItems = [];
  for (let i = 0; i < Math.min(numQuizzes, 15); i++) {
    const sent = pool[i % pool.length];
    mcqItems.push({
      id: `mcq-${i + 1}`,
      question: `Question #${i + 1}: Which concept is fundamental to ${titleTopic}?`,
      options: [
        sent,
        "Passive re-reading of textbook pages for 5 hours",
        "Memorizing without understanding key concepts",
        "Forgetting facts after 1 hour"
      ],
      answer: sent,
      explanation: `Correct answer: "${sent}". Active retrieval strengthens neural connections far better than passive reading.`
    });
  }

  const concepts = [
    `${titleTopic} Core Foundations`,
    "Active Recall Mechanics",
    "Spaced Repetition & SM-2",
    "Cognitive Load & Memory Retention"
  ];

  return {
    topic: titleTopic.charAt(0).toUpperCase() + titleTopic.slice(1),
    concepts,
    blocks: [
      {
        type: "flashcard_deck",
        title: `${titleTopic}: Flashcards`,
        items: flashcardItems
      },
      {
        type: "mcq",
        title: `${titleTopic}: Multiple Choice Quiz`,
        items: mcqItems
      },
      {
        type: "true_false",
        title: `${titleTopic}: True or False Check`,
        items: [
          {
            id: "tf-1",
            question: "The SM-2 algorithm adjusts review intervals dynamically based on performance.",
            answer: true,
            explanation: "True! Rating a card Easy increases interval multiplier, while Hard resets interval length."
          }
        ]
      },
      {
        type: "fill_blank",
        title: `${titleTopic}: Fill in the Blank`,
        items: [
          {
            id: "fb-1",
            question: "The process of retrieving information from memory without looking at notes is called ____ recall.",
            answer: "active",
            explanation: "Active recall requires your brain to retrieve knowledge from long-term memory."
          }
        ]
      }
    ]
  };
}

function apiGeneratePlugin() {
  return {
    name: 'api-generate-plugin',
    configureServer(server) {
      // 1. Audio Transcription Middleware (Groq Whisper + Gemini Audio)
      server.middlewares.use('/api/transcribe', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { audioBase64, mimeType = 'audio/webm' } = JSON.parse(body || '{}');
            if (!audioBase64) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'No audio data provided' }));
            }

            const cleanBase64 = audioBase64.replace(/^data:.*?;base64,/, '').replace(/\s+/g, '');
            const audioBuffer = Buffer.from(cleanBase64, 'base64');

            if (audioBuffer.length < 500) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Audio recording too short or empty.' }));
            }

            let ext = 'webm';
            if (mimeType.includes('mp4') || mimeType.includes('m4a')) ext = 'm4a';
            else if (mimeType.includes('wav')) ext = 'wav';
            else if (mimeType.includes('ogg')) ext = 'ogg';

            const cleanMime = mimeType.split(';')[0];
            const file = new File([audioBuffer], `recording.${ext}`, { type: cleanMime });

            // Try Groq Whisper
            const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
            if (groqKey && !groqKey.includes('your_')) {
              try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('model', 'whisper-large-v3-turbo');
                formData.append('response_format', 'json');

                const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${groqKey}`
                  },
                  body: formData
                });

                if (groqRes.ok) {
                  const data = await groqRes.json();
                  if (data && data.text) {
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify({ text: data.text.trim(), source: 'groq-whisper' }));
                  }
                } else {
                  const errText = await groqRes.text();
                  console.warn('Vite Groq Whisper HTTP error:', groqRes.status, errText);
                }
              } catch (groqErr) {
                console.warn('Vite Groq Whisper error:', groqErr.message);
              }
            }

            // Fallback to Gemini 1.5 Flash Audio
            const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
            if (geminiKey && !geminiKey.includes('your_')) {
              try {
                const genAI = new GoogleGenerativeAI(geminiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const result = await model.generateContent([
                  {
                    inlineData: {
                      mimeType: cleanMime,
                      data: cleanBase64
                    }
                  },
                  { text: "Accurately transcribe this audio lecture recording verbatim into clean text. Return ONLY the transcribed text without quotes or explanations." }
                ]);

                const text = result.response.text().trim();
                if (text) {
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ text, source: 'gemini-audio' }));
                }
              } catch (geminiErr) {
                console.warn('Vite Gemini audio error:', geminiErr.message);
              }
            }

            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ 
              error: 'Could not transcribe audio. Please ensure your microphone is working and speak clearly.'
            }));

          } catch (err) {
            console.error('Vite audio transcription error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message || 'Transcription failed' }));
          }
        });
      });

      // 2. Study Kit Generation Middleware
      server.middlewares.use('/api/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { 
              text, 
              topicHint, 
              numCards = 6, 
              numQuizzes = 5, 
              provider = 'google', 
              model = 'gemini-2.5-flash' 
            } = JSON.parse(body || '{}');

            if (!text || typeof text !== 'string' || text.trim().length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Text prompt or study material is required.' }));
            }

            const prompt = `
You are an expert tutor creating an interactive study kit.
Generate a structured study kit based on the provided topic or study notes. If the input is a question, brief topic (e.g. "explain machine learning"), or lecture summary, generate a complete, rigorous educational study kit covering the core concepts, principles, algorithms, and applications of that subject.

Return ONLY a valid JSON object matching EXACTLY this structure:
{
  "topic": "Topic Title",
  "concepts": ["Key Concept 1", "Key Concept 2", "Key Concept 3", "Key Concept 4"],
  "blocks": [
    {
      "type": "flashcard_deck",
      "title": "Flashcards",
      "items": [
        {
          "id": "fc-1",
          "front": "Front of card with clear question or concept",
          "back": "Back of card with detailed explanation"
        }
      ]
    },
    {
      "type": "mcq",
      "title": "Multiple Choice Questions",
      "items": [
        {
          "id": "mcq-1",
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Option A (must exactly match one of the options)",
          "explanation": "Detailed explanation of why this answer is correct"
        }
      ]
    },
    {
      "type": "true_false",
      "title": "True / False Questions",
      "items": [
        {
          "id": "tf-1",
          "question": "Factual statement?",
          "answer": true,
          "explanation": "Why this statement is true or false"
        }
      ]
    },
    {
      "type": "fill_blank",
      "title": "Fill in the Blank",
      "items": [
        {
          "id": "fb-1",
          "question": "Sentence with a ____ missing word.",
          "answer": "word",
          "explanation": "Explanation"
        }
      ]
    }
  ]
}

CRITICAL RULES:
1. Create EXACTLY ${numCards} items in the "flashcard_deck" block.
2. Create quiz questions across MCQ, True/False, and Fill-in-the-Blank blocks totaling EXACTLY ${numQuizzes} questions.
3. Every question and card MUST be directly, deeply relevant to the subject matter ("${text.substring(0, 500)}").
4. Never generate generic or unrelated placeholder text.

User Topic / Study Notes:
"""
${text.substring(0, 10000)}
"""
${topicHint ? `Topic Hint: ${topicHint}` : ''}
`;

            if (provider === 'google') {
              const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
              try {
                let targetModel = model;
                if (!targetModel || targetModel.includes('1.5')) {
                  targetModel = 'gemini-2.5-flash';
                }
                const genAI = new GoogleGenerativeAI(apiKey);
                const geminiModel = genAI.getGenerativeModel({
                  model: targetModel,
                  generationConfig: { responseMimeType: "application/json" }
                });
                const result = await geminiModel.generateContent(prompt);
                const parsedJson = cleanAndParseJson(result.response.text());
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(parsedJson));
              } catch (apiErr) {
                console.warn("Google Gemini API Error:", apiErr.message, "- Falling back to smart mock generator.");
                const mockData = generateMockStudyData(text, topicHint, numCards, numQuizzes);
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(mockData));
              }
            } else if (provider === 'groq') {
              const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
              if (!apiKey || apiKey.includes('your_')) {
                const mockData = generateMockStudyData(text, topicHint, numCards, numQuizzes);
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(mockData));
              }
              try {
                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: model || 'llama-3.3-70b-versatile',
                    response_format: { type: 'json_object' },
                    messages: [{ role: 'user', content: prompt }]
                  })
                });
                const groqData = await groqRes.json();
                const rawContent = groqData.choices[0]?.message?.content;
                res.setHeader('Content-Type', 'application/json');
                return res.end(rawContent || JSON.stringify(generateMockStudyData(text, topicHint, numCards, numQuizzes)));
              } catch (apiErr) {
                console.warn("Groq API Error:", apiErr.message, "- Falling back to smart mock generator.");
                const mockData = generateMockStudyData(text, topicHint, numCards, numQuizzes);
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(mockData));
              }
            } else {
              // Anthropic Claude
              const apiKey = process.env.ANTHROPIC_API_KEY;
              if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
                await new Promise(r => setTimeout(r, 600));
                const mockData = generateMockStudyData(text, topicHint, numCards, numQuizzes);
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(mockData));
              }

              try {
                const anthropic = new Anthropic({ apiKey });
                const response = await anthropic.messages.create({
                  model: model || 'claude-3-5-sonnet-20241022',
                  max_tokens: 4000,
                  messages: [{ role: 'user', content: prompt }]
                });

                let raw = response.content[0].text.trim();
                if (raw.startsWith('```json')) raw = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                else if (raw.startsWith('```')) raw = raw.replace(/^```\s*/, '').replace(/\s*```$/, '');

                res.setHeader('Content-Type', 'application/json');
                return res.end(raw);
              } catch (apiErr) {
                console.warn("Anthropic API Error:", apiErr.message, "- Falling back to smart mock generator.");
                const mockData = generateMockStudyData(text, topicHint, numCards, numQuizzes);
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(mockData));
              }
            }
          } catch (err) {
            console.error("Error processing request:", err);
            const mockData = generateMockStudyData('', '', 6, 5);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(mockData));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiGeneratePlugin()],
  server: {
    port: 5173
  }
});
