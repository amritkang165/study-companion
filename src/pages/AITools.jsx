import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  generateTopicSummary,
  generatePracticeQuestions,
  generateFlashcards,
} from '../services/aiService';
import { isGroqConfigured } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FlashcardViewer, parseFlashcards } from '../components/FlashcardViewer';

const MODES = [
  { id: 'summary', label: 'Topic summary' },
  { id: 'questions', label: 'Practice questions' },
  { id: 'flashcards', label: 'Flashcards' },
];

export function AITools() {
  const [mode, setMode] = useState('summary');
  const [prompt, setPrompt] = useState('');
  const [notes, setNotes] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!isGroqConfigured()) {
      toast.warning('Add REACT_APP_GROQ_API_KEY to .env and restart the dev server');
      return;
    }
    const topic = prompt.trim();
    if (!topic) {
      toast.warning('Enter a topic or prompt first');
      return;
    }
    setLoading(true);
    setOutput('');
    try {
      let text;
      if (mode === 'summary') {
        text = await generateTopicSummary(topic, notes.trim());
      } else if (mode === 'questions') {
        text = await generatePracticeQuestions(topic, 6);
      } else {
        text = await generateFlashcards(topic, 10);
      }
      setOutput(text);
      toast.success('Generated');
    } catch (e) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.message ||
        'Something went wrong';
      const missingKey =
        typeof msg === 'string' && msg.includes('REACT_APP_GROQ_API_KEY');
      toast.error(missingKey ? 'Groq API key missing or invalid' : msg);
      setOutput(
        missingKey
          ? 'Add your key to a `.env` file in the project root (next to package.json):\n\nREACT_APP_GROQ_API_KEY=AIza…\n\nThen stop the dev server and run npm start again.\n\nTip: copy .env.example to .env and paste your key from Google AI Studio.'
          : `Could not reach the AI service.\n\n${msg}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>AI study assistant</h2>
        <p className="muted">
          Generate summaries, questions, and flashcards with Google Gemini
        </p>
      </motion.header>

      {!isGroqConfigured() && (
        <section className="panel ai-setup-panel" aria-labelledby="ai-setup-title">
          <h3 id="ai-setup-title" className="panel__title">
            Connect Gemini (required)
          </h3>
          <ol className="ai-setup-panel__steps">
            <li>
              In the project root (same folder as <code>package.json</code>), create{' '}
              <code>.env</code> — you can copy <code>.env.example</code> to{' '}
              <code>.env</code>.
            </li>
            <li>
              Create an API key in{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google AI Studio
              </a>
              .
            </li>
            <li>
              Set <code>REACT_APP_GROQ_API_KEY=AIza…</code> in <code>.env</code>.
            </li>
            <li>
              Restart the dev server (<kbd>Ctrl+C</kbd> then <code>npm start</code>
              ). Create React App only reads <code>.env</code> when the server starts.
            </li>
          </ol>
        </section>
      )}

      <div className="ai-toolbar">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`tabs__btn ${mode === m.id ? 'tabs__btn--active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <section className="panel ai-panel">
        <label className="form__label">
          {mode === 'summary' ? 'Topic' : 'Topic or focus area'}
          <input
            className="input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter topic or prompt"
          />
        </label>
        {mode === 'summary' && (
          <label className="form__label">
            Optional notes / context
            <textarea
              className="input input--area"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste key points from your notes…"
            />
          </label>
        )}
        <button
          type="button"
          className="btn btn--primary"
          onClick={run}
          disabled={loading || !isGroqConfigured()}
          title={
            !isGroqConfigured()
              ? 'Add REACT_APP_GROQ_API_KEY to .env and restart npm start'
              : undefined
          }
        >
          {loading ? 'Generating…' : 'Generate'}
        </button>

        <div className="ai-output">
          {loading && <LoadingSpinner label="Calling AI…" />}
          {!loading && output && mode === 'flashcards' && (
            <FlashcardViewer flashcards={parseFlashcards(output)} />
          )}
          {!loading && output && mode !== 'flashcards' && (
            <pre className="ai-output__pre">{output}</pre>
          )}
          {!loading && !output && (
            <p className="muted">
              Enter a topic or prompt above and choose a mode to generate content.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
