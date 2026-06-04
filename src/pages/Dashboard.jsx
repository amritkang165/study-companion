import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useProgress } from '../hooks/useProgress';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext';
import { CompletionPie, WeeklyProductivityChart } from '../components/ProgressChart';
import { fetchMotivationalQuote } from '../services/aiService';
import { differenceInDays, format } from 'date-fns';
import FullscreenPomodoro from '../components/FullscreenPomodoro.jsx';
import FocusMode from '../components/FocusMode.jsx';

const TODAY_KEY = 'checklist-' + format(new Date(), 'yyyy-MM-dd');

function loadChecklist() {
  try {
    return JSON.parse(localStorage.getItem(TODAY_KEY) || '[]');
  } catch { return []; }
}

function saveChecklist(items) {
  localStorage.setItem(TODAY_KEY, JSON.stringify(items));
}

export function Dashboard() {
  const { total, completed, pending, overdue, completionPercent, weekly } = useProgress();
  const { user } = useAuth();
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [showPomodoroFS, setShowPomodoroFS] = useState(false);
  const [examDate, setExamDate] = useState(() => localStorage.getItem('exam-countdown-date') || '');
  const [showExamPicker, setShowExamPicker] = useState(false);
  const [checklist, setChecklist] = useState(loadChecklist);
  const [checklistInput, setChecklistInput] = useState('');
  const [showFocusMode, setShowFocusMode] = useState(false);

  const addChecklistItem = useCallback(() => {
    const text = checklistInput.trim();
    if (!text) return;
    const item = { id: Date.now(), text, done: false };
    const next = [...checklist, item];
    setChecklist(next);
    saveChecklist(next);
    setChecklistInput('');
  }, [checklistInput, checklist]);

  const toggleChecklist = useCallback((id) => {
    const next = checklist.map((c) => c.id === id ? { ...c, done: !c.done } : c);
    setChecklist(next);
    saveChecklist(next);
  }, [checklist]);

  const removeChecklist = useCallback((id) => {
    const next = checklist.filter((c) => c.id !== id);
    setChecklist(next);
    saveChecklist(next);
  }, [checklist]);

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
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0 }}>Welcome{userName ? `, ${userName}` : ''}</h2>
              <p className="muted" style={{ margin: 0 }}>Your study progress at a glance</p>
            </div>
            {daysLeft !== null && daysLeft >= 0 && (
              <div className="exam-countdown" style={{ padding: '4px 14px', background: 'var(--accent-dim)', borderRadius: 'var(--radius)', border: '1px solid var(--accent)', whiteSpace: 'nowrap' }}>
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

      <div
        className="theme-picker"
        role="toolbar"
        aria-label="Theme chooser"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          margin: '-0.25rem 0 0.75rem auto',
          width: 'fit-content',
        }}
      >
        <button aria-pressed={theme === 'theme-pink'} title="Pink" className="theme-swatch theme-swatch--pink" onClick={() => setTheme('theme-pink')} />
        <button aria-pressed={theme === 'theme-green'} title="Green" className="theme-swatch theme-swatch--green" onClick={() => setTheme('theme-green')} />
        <button aria-pressed={theme === 'theme-blue'} title="Blue" className="theme-swatch theme-swatch--blue" onClick={() => setTheme('theme-blue')} />
        <button aria-pressed={theme === 'theme-yellow'} title="Yellow" className="theme-swatch theme-swatch--yellow" onClick={() => setTheme('theme-yellow')} />
        <button aria-pressed={theme === 'theme-neon'} title="Neon" className="theme-swatch theme-swatch--neon" onClick={() => setTheme('theme-neon')} />
        <button aria-pressed={theme === 'theme-indigo'} title="Indigo" className="theme-swatch theme-swatch--indigo" onClick={() => setTheme('theme-indigo')} />
      </div>

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

      <section className="stat-grid" aria-label="Summary stats">
        <StatCard label="Total tasks" value={total} />
        <StatCard label="Completed" value={completed} accent="var(--success)" />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Overdue" value={overdue} warn={overdue > 0} />
        <div className="stat-card" style={{ borderColor: 'var(--accent)' }}>
          <span className="stat-card__value" style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{format(new Date(), 'MMM d, yyyy')}</span>
          <span className="stat-card__label">Today</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="panel">
          <CompletionPie percent={completionPercent} />
        </div>
        <div className="panel panel--wide">
          <WeeklyProductivityChart data={weekly} />
        </div>
        <div className="panel">
          <h3 className="panel__title" style={{ fontSize: '0.95rem' }}>Today's Checklist</h3>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input
              className="input input--sm" style={{ flex: 1 }}
              placeholder="Add a task…"
              value={checklistInput}
              onChange={(e) => setChecklistInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
            />
            <button type="button" className="btn btn--primary btn--sm" onClick={addChecklistItem}>Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {checklist.length === 0 && <p className="muted small" style={{ margin: 0 }}>No items for today.</p>}
            {checklist.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleChecklist(item.id)}
                  style={{ accentColor: 'var(--accent)', width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', flexShrink: 0 }}
                />
                <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1, fontSize: '0.9rem' }}>{item.text}</span>
                <button type="button" className="btn btn--ghost btn--sm" style={{ fontSize: '0.7rem', padding: '2px 6px' }} onClick={() => removeChecklist(item.id)}>✕</button>
              </div>
            ))}
            {checklist.filter((c) => c.done).length > 0 && (
              <p className="muted small" style={{ margin: '4px 0 0' }}>{checklist.filter((c) => c.done).length}/{checklist.length} done</p>
            )}
          </div>
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
    <div
      className={`stat-card ${warn ? 'stat-card--warn' : ''}`}
      style={accent ? { borderColor: accent } : undefined}
    >
      <span className="stat-card__value" style={{ color: accent }}>
        {value}
      </span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
