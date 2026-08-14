import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper function to strip markdown fence and parse JSON
function cleanAndParseJson(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// Helper for Mock JSON Generation with configurable card and quiz counts
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
    "Quantum computing uses qubits capable of existing in superposition states.",
    "Neural networks adjust synapse weights through backpropagation algorithms.",
    "Chlorophyll absorbs light energy during the light-dependent reactions of photosynthesis."
  ];

  // Generate requested number of flashcards
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

  // Generate requested number of quiz questions (mixed MCQ, T/F, Fill-Blank)
  const mcqItems = [];
  const tfItems = [];
  const fbItems = [];

  for (let i = 0; i < Math.min(numQuizzes, 20); i++) {
    const qType = i % 3;
    const sent = pool[i % pool.length];

    if (qType === 0) {
      mcqItems.push({
        id: `mcq-${i + 1}`,
        question: `Which statement best describes concept #${i + 1}?`,
        options: [
          sent,
          "Passive reading for 5 hours continuously yields maximum memory retention.",
          "Rote memorization without understanding guarantees top test scores.",
          "Studying right before sleeping causes immediate forgetting."
        ],
        answer: sent,
        explanation: `The correct answer is: "${sent}". Active retrieval strengthens neural connections far better than passive reading.`
      });
    } else if (qType === 1) {
      tfItems.push({
        id: `tf-${i + 1}`,
        question: `True or False: ${sent}`,
        answer: true,
        explanation: `True! Research confirms that ${sent.toLowerCase()}`
      });
    } else {
      fbItems.push({
        id: `fb-${i + 1}`,
        question: `The process of retrieving information from memory without looking at notes is called ____ recall.`,
        answer: "active",
        explanation: "Active recall requires your brain to retrieve knowledge from long-term memory, strengthening neural connections."
      });
    }
  }

  const concepts = [
    `${titleTopic} Core Foundations`,
    "Active Recall Mechanics",
    "Spaced Repetition & SM-2",
    "Cognitive Load & Retention"
  ];

  const blocks = [
    {
      type: "flashcard_deck",
      title: `${titleTopic}: Flashcards`,
      items: flashcardItems
    }
  ];

  if (mcqItems.length > 0) {
    blocks.push({
      type: "mcq",
      title: `${titleTopic}: Multiple Choice Quiz`,
      items: mcqItems
    });
  }
  if (tfItems.length > 0) {
    blocks.push({
      type: "true_false",
      title: `${titleTopic}: True or False`,
      items: tfItems
    });
  }
  if (fbItems.length > 0) {
    blocks.push({
      type: "fill_blank",
      title: `${titleTopic}: Fill in the Blank`,
      items: fbItems
    });
  }

  return {
    topic: titleTopic.charAt(0).toUpperCase() + titleTopic.slice(1),
    concepts,
    blocks
  };
}

app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body || {};

    if (!audioBase64) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    const cleanBase64 = audioBase64.replace(/^data:.*?;base64,/, '').replace(/\s+/g, '');
    const audioBuffer = Buffer.from(cleanBase64, 'base64');

    if (audioBuffer.length < 500) {
      return res.status(400).json({ error: 'Audio recording too short or empty.' });
    }

    let ext = 'webm';
    if (mimeType.includes('mp4') || mimeType.includes('m4a')) ext = 'm4a';
    else if (mimeType.includes('wav')) ext = 'wav';
    else if (mimeType.includes('ogg')) ext = 'ogg';

    const cleanMime = mimeType.split(';')[0];
    const file = new File([audioBuffer], `recording.${ext}`, { type: cleanMime });

    // 1. Try Groq Whisper (Ultra-fast speech-to-text)
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
            return res.json({ text: data.text.trim(), source: 'groq-whisper' });
          }
        } else {
          const errText = await groqRes.text();
          console.warn('Groq Whisper HTTP error:', groqRes.status, errText);
        }
      } catch (groqErr) {
        console.warn('Groq Whisper error, trying Gemini fallback:', groqErr.message);
      }
    }

    // 2. Fallback to Google Gemini 1.5 Flash Audio Model
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
          return res.json({ text, source: 'gemini-audio' });
        }
      } catch (geminiErr) {
        console.warn('Gemini audio transcription error:', geminiErr.message);
      }
    }

    return res.status(400).json({ 
      error: 'Could not transcribe audio. Please ensure your microphone is working and speak clearly.'
    });

  } catch (err) {
    console.error('Audio Transcription Error:', err);
    return res.status(500).json({ error: err.message || 'Audio transcription failed' });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { 
      text, 
      topicHint, 
      numCards = 6, 
      numQuizzes = 5, 
      provider = 'google', 
      model = 'gemini-2.5-flash', 
      customApiKey 
    } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text prompt or study material is required.' });
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
${topicHint ? `Topic Focus Hint: ${topicHint}` : ''}
`;

    // Multi-Agent Provider Logic
    if (provider === 'google') {
      const apiKey = customApiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey.includes('your_')) {
        console.warn('Google API key missing. Falling back to mock generator.');
        return res.json(generateMockStudyData(text, topicHint, numCards, numQuizzes));
      }
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
      return res.json(parsedJson);

    } else if (provider === 'groq') {
      const apiKey = customApiKey || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
      if (!apiKey || apiKey.includes('your_')) {
        console.warn('Groq API key missing. Falling back to mock generator.');
        return res.json(generateMockStudyData(text, topicHint, numCards, numQuizzes));
      }
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
      if (!groqRes.ok) {
        const errText = await groqRes.text();
        throw new Error(`Groq API HTTP ${groqRes.status}: ${errText}`);
      }
      const groqData = await groqRes.json();
      const rawContent = groqData.choices[0]?.message?.content;
      if (!rawContent) throw new Error('No content returned from Groq');
      const parsedJson = cleanAndParseJson(rawContent);
      return res.json(parsedJson);

    } else {
      // Default: Anthropic Claude
      const apiKey = customApiKey || process.env.ANTHROPIC_API_KEY;
      if (!apiKey || apiKey.includes('your_')) {
        console.warn('Anthropic API key missing. Falling back to mock generator.');
        return res.json(generateMockStudyData(text, topicHint, numCards, numQuizzes));
      }
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });
      const parsedJson = cleanAndParseJson(response.content[0].text);
      return res.json(parsedJson);
    }

  } catch (err) {
    console.error('Error in /api/generate:', err.message);
    const mockData = generateMockStudyData(req.body?.text || '', req.body?.topicHint, req.body?.numCards, req.body?.numQuizzes);
    return res.json(mockData);
  }
});


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Study Assistant Server running on http://localhost:${PORT}`);
});
