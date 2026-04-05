import React from 'react';
import { motion } from 'framer-motion';
import { HiCalendar, HiFlag, HiTrash, HiCheck } from 'react-icons/hi2';
import { formatDateDisplay, isTaskOverdue } from '../utils/helpers';

const priorityClass = {
  High: 'task-card__priority--high',
  Medium: 'task-card__priority--med',
  Low: 'task-card__priority--low',
};

export function TaskCard({ task, onToggleComplete, onDelete }) {
  const overdue = isTaskOverdue(task);
  return (
    <motion.article
      className={`task-card ${overdue ? 'task-card--overdue' : ''} ${task.status === 'Completed' ? 'task-card--completed' : ''}`}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="task-card__main">
        <button
          type="button"
          className="task-card__check"
          onClick={() =>
            onToggleComplete(
              task,
              task.status === 'Completed' ? 'Pending' : 'Completed'
            )
          }
          aria-label={
            task.status === 'Completed' ? 'Mark pending' : 'Mark complete'
          }
        >
          <HiCheck />
        </button>
        <div>
          <h3 className="task-card__title">{task.title}</h3>
          <p className="task-card__sub">
            {task.subject}
            {task.topic ? ` · ${task.topic}` : ''}
          </p>
          <div className="task-card__row">
            <span className="task-card__date">
              <HiCalendar aria-hidden /> {formatDateDisplay(task.deadline)}
            </span>
            <span
              className={`task-card__priority ${priorityClass[task.priority] || ''}`}
            >
              <HiFlag aria-hidden /> {task.priority}
            </span>
            <span className="task-card__status">{task.status}</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="btn btn--ghost btn--icon task-card__delete"
        onClick={() => onDelete(task)}
        aria-label="Delete task"
      >
        <HiTrash />
      </button>
    </motion.article>
  );
}
