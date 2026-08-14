import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

function cleanAndParseJson(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
${topicHint ? `Topic Hint: ${topicHint}` : ''}
`;

    if (provider === 'google') {
      const apiKey = customApiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey.includes('your_')) {
        return res.status(200).json(generateMock(text, topicHint, numCards, numQuizzes));
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
      return res.status(200).json(cleanAndParseJson(result.response.text()));

    } else if (provider === 'groq') {
      const apiKey = customApiKey || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
      if (!apiKey || apiKey.includes('your_')) {
        return res.status(200).json(generateMock(text, topicHint, numCards, numQuizzes));
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
        throw new Error(`Groq API error: ${groqRes.status}`);
      }
      const groqData = await groqRes.json();
      const rawContent = groqData.choices[0]?.message?.content;
      return res.status(200).json(cleanAndParseJson(rawContent));

    } else {
      // Default: Anthropic
      const apiKey = customApiKey || process.env.ANTHROPIC_API_KEY;
      if (!apiKey || apiKey.includes('your_')) {
        return res.status(200).json(generateMock(text, topicHint, numCards, numQuizzes));
      }
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });
      return res.status(200).json(cleanAndParseJson(response.content[0].text));
    }

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
