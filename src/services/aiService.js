import {
  groqHttp,
  requireGroqApiKey,
} from './api.js';
const DEFAULT_GROQ_MODEL = process.env.REACT_APP_GROQ_MODEL || 'llama-3.3-70b-versatile';

function buildGroqBody(messages, options = {}) {
  return {
    model: options.model || DEFAULT_GROQ_MODEL,
    messages,
    max_tokens: options.maxOutputTokens ?? options.max_tokens ?? 2048,
    temperature: options.temperature ?? 0.7,
  };
}

function extractGroqText(data) {
  const content = data?.choices?.[0]?.message?.content;
  return content || '';
}

async function chat(messages, options = {}) {
  const key = requireGroqApiKey();
  const { data } = await groqHttp.post(
    '/chat/completions',
    buildGroqBody(messages, options),
    { headers: { 'Authorization': `Bearer ${key}` } }
  );
  const text = extractGroqText(data);
  if (!text) throw new Error('Empty response from AI');
  return text.trim();
}

export async function generateTopicSummary(topicName, extraContext = '') {
  const user = extraContext
    ? `Topic: ${topicName}\n\nContext from student notes:\n${extraContext}\n\nProvide a clear, structured summary suitable for exam revision.`
    : `Topic: ${topicName}\n\nProvide a clear, structured summary suitable for exam revision.`;
  return chat(
    [
      {
        role: 'system',
        content:
          'You are a study assistant. Write concise, accurate educational summaries.',
      },
      { role: 'user', content: user },
    ],
    { maxOutputTokens: 1500 }
  );
}

export async function generatePracticeQuestions(topicName, count = 5) {
  return chat(
    [
      {
        role: 'system',
        content:
          'You are a tutor. Output numbered practice questions. After each question, put the answer in bold on a new line using **answer here**. Tag each question with difficulty in parentheses: (Easy), (Medium), or (Hard).',
      },
      {
        role: 'user',
        content: `Generate ${count} practice questions about: ${topicName}`,
      },
    ],
    { maxOutputTokens: 2000 }
  );
}

export async function generateFlashcards(topicName, count = 8) {
  return chat(
    [
      {
        role: 'system',
        content:
          'You are a tutor. Output flashcards as lines: Front: ... | Back: ...',
      },
      {
        role: 'user',
        content: `Create ${count} flashcards for: ${topicName}`,
      },
    ],
    { maxOutputTokens: 1500 }
  );
}

const QUOTES_API_KEY = 'R4SuuMbNIXz5kmIT6FN9BZjTAeFf0AElzuInxKui';

export async function fetchMotivationalQuote() {
  const response = await fetch('https://api.api-ninjas.com/v2/quoteoftheday', {
    headers: { 'X-Api-Key': QUOTES_API_KEY },
  });
  const data = await response.json();
  const quote = Array.isArray(data) ? data[0] : data;
  return {
    text: quote?.quote ?? '',
    author: quote?.author ?? '',
  };
}
