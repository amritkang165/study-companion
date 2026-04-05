import axios from 'axios';

function trimSlash(url) {
  return (url || '').replace(/\/$/, '');
}

/**
 * Central API config (Create React App: only REACT_APP_* vars are exposed).
 * - appBaseUrl: your own backend when you add one
 * - groqBaseUrl: Groq API root
 * - quotesBaseUrl: motivational quotes JSON API
 */
export const apiConfig = {
  appBaseUrl: trimSlash(process.env.REACT_APP_API_BASE_URL || ''),
  groqBaseUrl: trimSlash(
    process.env.REACT_APP_GROQ_API_BASE_URL ||
      'https://api.groq.com/openai/v1'
  ),
  quotesBaseUrl: trimSlash(
    process.env.REACT_APP_QUOTES_API_URL || 'https://api.quotable.io'
  ),
};

/** Optional app backend — set REACT_APP_API_BASE_URL when you deploy an API. */
export const appHttp = axios.create({
  baseURL: apiConfig.appBaseUrl || undefined,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const groqHttp = axios.create({
  baseURL: apiConfig.groqBaseUrl,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

export const quotesHttp = axios.create({
  baseURL: apiConfig.quotesBaseUrl,
  timeout: 10000,
});

const PLACEHOLDER_KEYS =
  /^(sk-your-key-here|your_key_here|your_groq_key_here|gsk-your-key-here)$/i;

function groqApiKey() {
  return (process.env.REACT_APP_GROQ_API_KEY || '').trim();
}

/** True when a non-empty Groq API key is set (injected at build time). */
export function isGroqConfigured() {
  const key = groqApiKey();
  if (!key || PLACEHOLDER_KEYS.test(key)) return false;
  return true;
}

export function requireGroqApiKey() {
  const key = groqApiKey();
  if (!key || PLACEHOLDER_KEYS.test(key)) {
    throw new Error(
      'Missing REACT_APP_GROQ_API_KEY. Add it to a .env file in the project root.'
    );
  }
  return key;
}
