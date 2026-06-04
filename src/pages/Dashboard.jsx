import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useProgress } from '../hooks/useProgress';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { CompletionPie, WeeklyProductivityChart, ConsistencyHeatmap, PriorityBreakdown } from '../components/ProgressChart';
import { fetchMotivationalQuote } from '../services/aiService';
import { differenceInDays } from 'date-fns';
import { formatDateDisplay, isTaskOverdue, priorityOrder } from '../utils/helpers';
import FullscreenPomodoro from '../components/FullscreenPomodoro.jsx';
import FocusMode from '../components/FocusMode.jsx';

export function Dashboard() {
  const { total, completed, pending, overdue, completionPercent, weekly, streak, monthly, priorities, weekComparison } = useProgress();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [showPomodoroFS, setShowPomodoroFS] = useState(false);
  const [examDate, setExamDate] = useState(() => localStorage.getItem('exam-countdown-date') || '');
  const [showExamPicker, setShowExamPicker] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const displayTasks = [...tasks]
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => {
      const aOver = isTaskOverdue(a);
      const bOver = isTaskOverdue(b);
      if (aOver && !bOver) return -1;
      if (!aOver && bOver) return 1;
      return priorityOrder(a.priority) - priorityOrder(b.priority);
    })
    .slice(0, 10);

  const handleQuickAdd = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    addTask({ title, status: 'Pending', priority: 'Medium' });
    setNewTaskTitle('');
    toast.success('Task added');
  };

  const completedTaskCount = tasks.filter((t) => t.status === 'Completed').length;

  useEffect(() => {
    localStorage.setItem('exam-countdown-date', examDate);
  }, [examDate]);

  const daysLeft = examDate ? differenceInDays(new Date(examDate), new Date()) : null;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = await fetchMotivationalQuote();
        if (!cancelled) setQuote(q);
      } catch {
        if (!cancelled) {
          setQuote({
            text: 'Small steps each day add up to big results.',
            author: 'Study Companion',
          });
        }
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page dashboard">
      {/* Decorative notch */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 'clamp(160px, 30vw, 320px)', height: '180px',
        background: `radial-gradient(ellipse 60% 100% at 50% 0%, var(--warm-dim), transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0 }}>Welcome{userName ? `, ${userName}` : ''}</h2>
              <p className="muted" style={{ margin: 0 }}>Your study progress at a glance</p>
            </div>
            {daysLeft !== null && daysLeft >= 0 && (
              <div className="exam-countdown" style={{ padding: '4px 14px', background: 'var(--accent-dim)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--accent)', whiteSpace: 'nowrap' }}>
                <strong style={{ fontSize: '1.1rem' }}>{daysLeft}</strong>
                <span className="muted" style={{ fontSize: '0.8rem', marginLeft: 4 }}>day{daysLeft !== 1 ? 's' : ''} left</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!examDate ? (
              <button type="button" className="btn btn--primary" onClick={() => setShowExamPicker(true)}>
                Set exam date
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => { setExamDate(''); localStorage.removeItem('exam-countdown-date'); }}>
                Clear exam
              </button>
            )}
            <button type="button" className="btn btn--primary" onClick={() => setShowPomodoroFS(true)}>
              Open Pomodoro
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setShowFocusMode(true)} style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}>
              Focus Mode
            </button>
          </div>
        </div>
        {showExamPicker && (
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" className="input" value={examDate} onChange={(e) => { setExamDate(e.target.value); setShowExamPicker(false); }} />
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowExamPicker(false)}>Cancel</button>
          </div>
        )}
      </motion.header>

      <section className="quote-card" aria-live="polite">
        {quoteLoading ? (
          <p className="muted">Loading quote…</p>
        ) : (
          <>
            <blockquote className="quote-card__text">“{quote?.text}”</blockquote>
            <cite className="quote-card__author">— {quote?.author}</cite>
          </>
        )}
      </section>

      <motion.section
        className="stat-grid" aria-label="Summary stats"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.07 } },
        }}
      >
        <StatCard label="Total tasks" value={total} />
        <StatCard label="Completed" value={completed} accent="var(--success)" />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Overdue" value={overdue} warn={overdue > 0} />
      </motion.section>

      <div className="dashboard-grid">
        <ConsistencyHeatmap monthly={monthly} streak={streak} weekComparison={weekComparison} />
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', maxHeight: 340 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 className="panel__title" style={{ margin: 0, fontSize: '0.95rem' }}>Active tasks ({tasks.length - completedTaskCount})</h3>
            <button type="button" className="btn btn--ghost btn--sm" style={{ fontSize: '0.75rem' }} onClick={() => navigate('/subjects-tasks')}>View all</button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input
              className="input input--sm" style={{ flex: 1, minWidth: 0 }}
              placeholder="Quick add task…"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            />
            <button type="button" className="btn btn--primary btn--sm" onClick={handleQuickAdd}>Add</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {displayTasks.length === 0 && (
              <p className="muted small" style={{ margin: 'auto', textAlign: 'center' }}>All caught up! 🎉</p>
            )}
            <AnimatePresence mode="popLayout">
              {displayTasks.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                    borderRadius: 8, background: 'var(--surface-2)',
                    borderLeft: isTaskOverdue(t) ? '3px solid var(--danger)' : '3px solid transparent',
                  }}
                >
                  <motion.button
                    type="button"
                    onClick={() => { updateTask(t.id, { status: 'Completed' }); toast.success('Task completed'); }}
                    whileTap={{ scale: 0.8 }}
                    style={{
                      width: 22, height: 22, borderRadius: 8, flexShrink: 0,
                      border: `1px solid ${isTaskOverdue(t) ? 'var(--danger)' : 'var(--border)'}`,
                      background: 'transparent', cursor: 'pointer', padding: 0,
                      display: 'grid', placeItems: 'center',
                      color: 'transparent', transition: 'all 0.2s',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--accent-press)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,6 5,9 10,2" />
                    </svg>
                  </motion.button>
                  <div style={{ flex: 1, minWidth: 0, fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                      {t.subject || ''}{t.deadline ? ` · ${formatDateDisplay(t.deadline)}` : ''}
                    </div>
                  </div>
                  <button
                    type="button" className="btn btn--ghost btn--sm"
                    style={{ fontSize: '0.65rem', padding: '2px 6px', opacity: 0.5 }}
                    onClick={() => { deleteTask(t.id); toast.info('Task removed'); }}
                  >✕</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="panel">
          <CompletionPie percent={completionPercent} />
        </div>
        {priorities.some((p) => p.count > 0) && (
          <PriorityBreakdown priorities={priorities} />
        )}
        <div className="panel panel--wide">
          <WeeklyProductivityChart data={weekly} />
        </div>
      </div>

      {showPomodoroFS && (
        <FullscreenPomodoro onClose={() => setShowPomodoroFS(false)} />
      )}

      {showFocusMode && (
        <FocusMode onClose={() => setShowFocusMode(false)} />
      )}
    </div>
  );
}

function StatCard({ label, value, accent, warn }) {
  return (
    <motion.div
      className={`stat-card ${warn ? 'stat-card--warn' : ''}`}
      style={accent ? { borderColor: accent } : undefined}
      variants={{
        hidden: { opacity: 0, y: 12, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 18 } },
      }}
    >
      <span className="stat-card__value" style={{ color: accent }}>
        {value}
      </span>
      <span className="stat-card__label">{label}</span>
    </motion.div>
  );
}
