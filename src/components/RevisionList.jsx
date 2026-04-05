import React from 'react';
import { motion } from 'framer-motion';
import { formatDateDisplay } from '../utils/helpers';
import { HiCheck, HiTrash } from 'react-icons/hi2';

export function RevisionList({ items, onMarkDone, onDelete }) {
  if (!items.length) {
    return <p className="muted">No revision sessions scheduled.</p>;
  }
  return (
    <ul className="revision-list">
      {items.map((r) => (
        <motion.li
          key={r.id}
          className="revision-list__item"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div>
            <strong>{r.topicName}</strong>
            <span className="revision-list__sub">{r.subjectName}</span>
            <span className="revision-list__date">
              Revision: {formatDateDisplay(r.revisionDate)}
            </span>
          </div>
          <div className="revision-list__actions">
            {r.status === 'scheduled' && (
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() => onMarkDone(r)}
              >
                <HiCheck /> Done
              </button>
            )}
            <button
              type="button"
              className="btn btn--sm btn--ghost btn--danger"
              onClick={() => onDelete(r)}
            >
              <HiTrash />
            </button>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
