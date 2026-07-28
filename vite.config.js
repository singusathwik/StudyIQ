import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';

dotenv.config();

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
      server.middlewares.use('/api/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { text, topicHint, numCards = 6, numQuizzes = 5 } = JSON.parse(body || '{}');

            if (!text || typeof text !== 'string' || text.trim().length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Text prompt or study material is required.' }));
            }

            const apiKey = process.env.ANTHROPIC_API_KEY;

            if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
              await new Promise(r => setTimeout(r, 600));
              const mockData = generateMockStudyData(text, topicHint, numCards, numQuizzes);
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify(mockData));
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
      "items": [{ "id": "fc-1", "front": "Q", "back": "A" }]
    },
    {
      "type": "mcq",
      "title": "MCQ Quiz",
      "items": [{ "id": "mcq-1", "question": "Q", "options": ["A","B","C","D"], "answer": "A", "explanation": "Why" }]
    },
    {
      "type": "true_false",
      "title": "True False Quiz",
      "items": [{ "id": "tf-1", "question": "Statement", "answer": true, "explanation": "Why" }]
    },
    {
      "type": "fill_blank",
      "title": "Fill Blank Quiz",
      "items": [{ "id": "fb-1", "question": "____", "answer": "word", "explanation": "Why" }]
    }
  ]
}

Instructions: Generate EXACTLY ${numCards} flashcards and ${numQuizzes} total quiz questions.

User Study Notes:
"""
${text.substring(0, 10000)}
"""
${topicHint ? `Topic Hint: ${topicHint}` : ''}
`;

              const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
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
