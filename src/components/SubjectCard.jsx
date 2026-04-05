import React from 'react';
import { motion } from 'framer-motion';
import { HiTrash, HiPencilSquare } from 'react-icons/hi2';

export function SubjectCard({ subject, topicCount, onEdit, onDelete }) {
  return (
    <motion.article
      className="subject-card"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ '--subject-color': subject.color }}
    >
      <div className="subject-card__accent" />
      <div className="subject-card__body">
        <h3 className="subject-card__title">{subject.name}</h3>
        <p className="subject-card__desc">
          {subject.description || 'No description'}
        </p>
        <p className="subject-card__meta">{topicCount} topics</p>
        <div className="subject-card__actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => onEdit(subject)}
          >
            <HiPencilSquare /> Edit
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--danger"
            onClick={() => onDelete(subject)}
          >
            <HiTrash /> Delete
          </button>
        </div>
      </div>
    </motion.article>
  );
}
