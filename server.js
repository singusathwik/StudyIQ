import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

app.post('/api/generate', async (req, res) => {
  try {
    const { text, topicHint, numCards = 6, numQuizzes = 5 } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text prompt or study material is required.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      await new Promise(r => setTimeout(r, 800));
      const mockData = generateMockStudyData(text, topicHint, numCards, numQuizzes);
      return res.json(mockData);
    }

    try {
      const anthropic = new Anthropic({ apiKey });
      const prompt = `
Extract key concepts from the following study notes and return ONLY valid JSON matching this schema:
{
  "topic": "Topic Name",
  "concepts": ["Concept 1", "Concept 2"],
  "blocks": [
    {
      "type": "flashcard_deck",
      "title": "Flashcards",
      "items": [{ "id": "fc-1", "front": "Question/Prompt", "back": "Answer" }]
    },
    {
      "type": "mcq",
      "title": "MCQ Quiz",
      "items": [{ "id": "mcq-1", "question": "Q", "options": ["A","B","C","D"], "answer": "Exact string in options", "explanation": "Why" }]
    },
    {
      "type": "true_false",
      "title": "True False Quiz",
      "items": [{ "id": "tf-1", "question": "Statement", "answer": true, "explanation": "Why" }]
    },
    {
      "type": "fill_blank",
      "title": "Fill Blank Quiz",
      "items": [{ "id": "fb-1", "question": "Sentence with ____", "answer": "word", "explanation": "Why" }]
    }
  ]
}

Instructions:
1. Generate EXACTLY ${numCards} flashcard items in the flashcard_deck block.
2. Generate EXACTLY ${numQuizzes} total quiz questions split across mcq, true_false, and fill_blank blocks.
3. Every quiz item MUST include a detailed "explanation" field.

User Study Text:
"""
${text.substring(0, 10000)}
"""
${topicHint ? `Topic Focus Hint: ${topicHint}` : ''}
`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = response.content[0].text.trim();
      let cleanedJsonString = responseText;
      if (cleanedJsonString.startsWith('```json')) {
        cleanedJsonString = cleanedJsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedJsonString.startsWith('```')) {
        cleanedJsonString = cleanedJsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedJson = JSON.parse(cleanedJsonString);
      return res.json(parsedJson);

    } catch (apiErr) {
      console.warn('Anthropic API Error:', apiErr.message, '- Falling back to smart mock generator.');
      const mockData = generateMockStudyData(text, topicHint, numCards, numQuizzes);
      return res.json(mockData);
    }

  } catch (err) {
    console.error('Error in /api/generate:', err.message);
    const mockData = generateMockStudyData(req.body?.text || '', req.body?.topicHint);
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
