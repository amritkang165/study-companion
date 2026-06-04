import React from 'react';
import FullscreenPomodoro from './FullscreenPomodoro';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from './TaskCard';
import { toast } from 'react-toastify';

export default function FocusMode({ onClose }) {
  const { tasks, updateTask, deleteTask } = useTasks();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', gap: 0,
      background: 'var(--bg)',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <FullscreenPomodoro onClose={onClose} noOverlay />
      </div>
      <div style={{ width: 1, background: 'var(--border-strong)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Tasks</h3>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>Exit Focus Mode</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {tasks.length === 0 && <p className="muted">No tasks yet.</p>}
          {tasks.sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return a.deadline.localeCompare(b.deadline);
          }).map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onToggleComplete={(task, status) => { updateTask(task.id, { status }); toast.success(status === 'Completed' ? 'Marked completed' : 'Marked pending'); }}
              onDelete={(task) => { if (window.confirm('Delete task?')) { deleteTask(task.id); toast.info('Task deleted'); } }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
