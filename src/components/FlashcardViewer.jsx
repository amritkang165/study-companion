import React, { useState } from 'react';
import './FlashcardViewer.css';

export function FlashcardViewer({ flashcards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) return <div>No flashcards found.</div>;

  const { front, back } = flashcards[index];

  const nextCard = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % flashcards.length);
  };
  const prevCard = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="flashcard-viewer">
      <button className="arrow-btn" onClick={prevCard}>&larr;</button>
      <div
        className={`flashcard${flipped ? ' flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        tabIndex={0}
        role="button"
        aria-pressed={flipped}
      >
        <div className="flashcard-face flashcard-front">{front}</div>
        <div className="flashcard-face flashcard-back">{back}</div>
      </div>
      <button className="arrow-btn" onClick={nextCard}>&rarr;</button>
    </div>
  );
}

// Helper to parse AI output into flashcard objects
export function parseFlashcards(text) {
  // Expects lines like: Front: ... | Back: ...
  return text
    .split('\n')
    .map((line) => {
      const match = line.match(/Front:\s*(.*?)\s*\|\s*Back:\s*(.*)/i);
      if (match) return { front: match[1], back: match[2] };
      return null;
    })
    .filter(Boolean);
}
