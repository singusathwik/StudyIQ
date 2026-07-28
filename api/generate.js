import { Anthropic } from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text, topicHint, numCards = 6, numQuizzes = 5 } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text prompt or study material is required.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      const mockData = generateMock(text, topicHint, numCards, numQuizzes);
      return res.status(200).json(mockData);
    }

    const anthropic = new Anthropic({ apiKey });

    const prompt = `
Extract key concepts from notes and return JSON matching this schema:
{
  "topic": "Topic Name",
  "concepts": ["Concept 1", "Concept 2"],
  "blocks": [
    { "type": "flashcard_deck", "title": "Flashcards", "items": [{ "id": "fc-1", "front": "Q", "back": "A" }] },
    { "type": "mcq", "title": "MCQ Quiz", "items": [{ "id": "mcq-1", "question": "Q", "options": ["A","B","C","D"], "answer": "A", "explanation": "Why" }] },
    { "type": "true_false", "title": "True False", "items": [{ "id": "tf-1", "question": "Q", "answer": true, "explanation": "Why" }] },
    { "type": "fill_blank", "title": "Fill Blank", "items": [{ "id": "fb-1", "question": "Q ____", "answer": "word", "explanation": "Why" }] }
  ]
}

Instructions: Generate EXACTLY ${numCards} flashcards and ${numQuizzes} quiz questions.

Notes:
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

    return res.status(200).json(JSON.parse(raw));
  } catch (err) {
    console.error('Serverless function error:', err);
    return res.status(200).json(generateMock(req.body?.text || '', req.body?.topicHint, req.body?.numCards, req.body?.numQuizzes));
  }
}

function generateMock(text, topicHint, numCards = 6, numQuizzes = 5) {
  const title = topicHint || (text.split('\n')[0]?.substring(0, 30) || 'Study Notes');
  const sentences = (text ? text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10) : []);
  const pool = sentences.length >= 4 ? sentences : [
    "Spaced repetition improves long-term memory retention by spacing review intervals over time.",
    "Active recall forces the brain to retrieve information rather than passively reviewing notes.",
    "Quantum computing leverages superposition and entanglement for parallel state processing.",
    "Formative assessment with instant feedback helps identify knowledge gaps quickly."
  ];

  const flashcardItems = [];
  for (let i = 0; i < Math.min(numCards, 20); i++) {
    const sent = pool[i % pool.length];
    flashcardItems.push({
      id: `fc-${i + 1}`,
      front: `Concept ${i + 1}: What is the key principle of "${sent.substring(0, 25)}..."?`,
      back: sent
    });
  }

  const mcqItems = [];
  for (let i = 0; i < Math.min(numQuizzes, 15); i++) {
    const sent = pool[i % pool.length];
    mcqItems.push({
      id: `mcq-${i + 1}`,
      question: `Question #${i + 1}: Which concept is fundamental to ${title}?`,
      options: [sent, 'Passive re-reading of textbook pages', 'Memorizing without understanding concepts', 'Forgetting facts after 1 hour'],
      answer: sent,
      explanation: `Correct: "${sent}". Active retrieval builds strong neural connections.`
    });
  }

  return {
    topic: title,
    concepts: [`${title} Basics`, 'Core Principles', 'Practical Applications'],
    blocks: [
      { type: 'flashcard_deck', title: `${title} Flashcards`, items: flashcardItems },
      { type: 'mcq', title: `${title} Multiple Choice Quiz`, items: mcqItems },
      { type: 'true_false', title: `${title} True/False`, items: [{ id: 'tf-1', question: 'Spaced repetition enhances retention.', answer: true, explanation: 'True!' }] },
      { type: 'fill_blank', title: `${title} Fill in the Blank`, items: [{ id: 'fb-1', question: 'The SM-2 algorithm calculates card ____.', answer: 'intervals', explanation: 'Intervals determine review frequency.' }] }
    ]
  };
}
