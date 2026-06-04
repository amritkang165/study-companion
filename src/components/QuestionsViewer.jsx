import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiLightBulb } from 'react-icons/hi2';

const DIFFICULTY_COLORS = {
  Easy: { bg: 'rgba(16,185,129,0.12)', text: '#34d399' },
  Medium: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  Hard: { bg: 'rgba(239,68,68,0.12)', text: '#f87171' },
};

export function parseQuestions(text) {
  if (!text) return [];
  const blocks = text.split(/\n\s*(?=\d+[.)])/);
  return blocks
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const labelMatch = b.match(/^(\d+)[.)]\s*/);
      const num = labelMatch ? labelMatch[1] : '';
      const rest = labelMatch ? b.slice(labelMatch[0].length) : b;
      const difficultyMatch = rest.match(/\((\w+)\)\s*$/);
      const difficulty = difficultyMatch && DIFFICULTY_COLORS[difficultyMatch[1]]
        ? difficultyMatch[1]
        : null;
      let question = difficultyMatch
        ? rest.slice(0, rest.lastIndexOf('(')).trim()
        : rest.trim();
      const answerMatch = question.match(/\*\*(.+?)\*\*/);
      const answer = answerMatch ? answerMatch[1] : null;
      if (answer) question = question.replace(/\*\*.+?\*\*/, '').replace(/\s+/g, ' ').trim();
      const colonIdx = question.indexOf(':');
      if (answer && colonIdx > 0 && colonIdx < 60) {
        const afterColon = question.slice(colonIdx + 1).trim();
        if (afterColon.length < question.length / 2) {
          question = afterColon;
        }
      }
      return { num, question, difficulty, answer };
    });
}

export function QuestionsViewer({ questions }) {
  const [expanded, setExpanded] = useState(null);

  if (!questions.length) {
    return <pre className="ai-output__pre">No questions could be parsed.</pre>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {questions.map((q, i) => {
        const open = expanded === i;
        return (
          <motion.div
            key={i}
            className="panel"
            style={{
              padding: '0.85rem 1rem',
              margin: 0,
              cursor: q.answer ? 'pointer' : 'default',
            }}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => q.answer && setExpanded(open ? null : i)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {q.num || i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>{q.question}</p>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
                  {q.difficulty && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: DIFFICULTY_COLORS[q.difficulty]?.bg || 'var(--surface)',
                        color: DIFFICULTY_COLORS[q.difficulty]?.text || 'var(--muted)',
                        fontWeight: 600,
                      }}
                    >
                      {q.difficulty}
                    </span>
                  )}
                  {q.answer && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HiLightBulb /> {open ? 'Hide answer' : 'Show answer'}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {open && q.answer && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        marginTop: 8,
                        padding: '10px 12px',
                        background: 'var(--surface-2)',
                        borderRadius: 8,
                        fontSize: '0.88rem',
                        lineHeight: 1.55,
                        borderLeft: '3px solid var(--accent)',
                      }}
                    >
                      {q.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {q.answer && (
                <HiChevronDown
                  style={{
                    marginTop: 4,
                    flexShrink: 0,
                    color: 'var(--muted)',
                    transform: open ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
