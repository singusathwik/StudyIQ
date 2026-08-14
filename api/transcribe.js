import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
            return res.status(200).json({ text: data.text.trim(), source: 'groq-whisper' });
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
          return res.status(200).json({ text, source: 'gemini-audio' });
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
}
