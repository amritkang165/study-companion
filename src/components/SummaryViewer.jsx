import React from 'react';
import { motion } from 'framer-motion';

export function SummaryViewer({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks = [];
  let current = [];

  for (const line of lines) {
    if (line.trim() === '') {
      if (current.length) {
        blocks.push({ type: 'paragraph', lines: current });
        current = [];
      }
      continue;
    }
    const trimmed = line.trim();
    if (/^#{1,3}\s/.test(trimmed)) {
      if (current.length) {
        blocks.push({ type: 'paragraph', lines: current });
        current = [];
      }
      blocks.push({ type: 'heading', text: trimmed.replace(/^#+\s*/, '') });
      continue;
    }
    if (/^\*\*(.+)\*\*$/.test(trimmed)) {
      if (current.length) {
        blocks.push({ type: 'paragraph', lines: current });
        current = [];
      }
      blocks.push({ type: 'heading', text: trimmed.replace(/^\*\*(.+)\*\*$/, '$1') });
      continue;
    }
    if (/^[-*]\s/.test(trimmed)) {
      if (current.length) {
        blocks.push({ type: 'paragraph', lines: current });
        current = [];
      }
      blocks.push({ type: 'bullet', text: trimmed.replace(/^[-*]\s*/, '') });
      continue;
    }
    if (/^\d+[.)]\s/.test(trimmed)) {
      if (current.length) {
        blocks.push({ type: 'paragraph', lines: current });
        current = [];
      }
      blocks.push({ type: 'number', text: trimmed });
      continue;
    }
    current.push(line);
  }
  if (current.length) blocks.push({ type: 'paragraph', lines: current });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ lineHeight: 1.7 }}
    >
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          return (
            <h4 key={i} style={{ margin: '1.2rem 0 0.4rem', fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>
              {b.text}
            </h4>
          );
        }
        if (b.type === 'bullet') {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '2px 0' }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span>
              <span style={{ flex: 1 }}>{renderInline(b.text)}</span>
            </div>
          );
        }
        if (b.type === 'number') {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '2px 0' }}>
              <span style={{ color: 'var(--muted)', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{b.text.match(/^\d+/)?.[0]}.</span>
              <span style={{ flex: 1 }}>{renderInline(b.text.replace(/^\d+[.)]\s*/, ''))}</span>
            </div>
          );
        }
        return (
          <p key={i} style={{ margin: '0.6rem 0', fontSize: '0.95rem' }}>
            {b.lines.map((l, li) => (
              <React.Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(l)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </motion.div>
  );
}

function renderInline(text) {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return p;
  });
}
