import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useProgress } from '../hooks/useProgress';
import { useStudy } from '../context/StudyContext';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  SubjectProgressChart,
  CompletionPie,
  WeeklyProductivityChart,
} from '../components/ProgressChart';
import { RevisionList } from '../components/RevisionList';
import { fetchMotivationalQuote } from '../services/aiService';
import { formatDateDisplay } from '../utils/helpers';
import { parseISO, isBefore, startOfDay } from 'date-fns';
import FullscreenPomodoro from '../components/FullscreenPomodoro.jsx';

export function Dashboard() {
  const {
    total,
    completed,
    pending,
    revisionTasks,
    overdue,
    completionPercent,
    subjectChart,
    weekly,
    upcomingRevisions,
  } = useProgress();
  const { updateRevision, deleteRevision, revisions } = useStudy();
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [showPomodoroFS, setShowPomodoroFS] = useState(false);

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

  const dueSoon = revisions.filter((r) => {
    if (r.status !== 'scheduled' || !r.revisionDate) return false;
    try {
      const d = parseISO(r.revisionDate);
      return !isBefore(d, startOfDay(new Date()));
    } catch {
      return false;
    }
  });

  const reminderItems = [...dueSoon].sort((a, b) =>
    (a.revisionDate || '').localeCompare(b.revisionDate || '')
  );

  return (
    <div className="page dashboard">
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Dashboard</h2>
        <p className="muted">Your study progress at a glance</p>

        {/* Add a visible dashboard action to open the fullscreen Pomodoro */}
        <div style={{ marginTop: 6 }}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setShowPomodoroFS(true)}
            style={{ transform: 'translateY(-6px)' }}
          >
            Open Pomodoro
          </button>
        </div>

        {/* theme picker removed from header to avoid duplication; use right-side palette */}
      </motion.header>

      {/* Right-side vertical theme bar (fixed) */}
      <div className="theme-bar-right" role="toolbar" aria-label="Theme chooser">
        <button aria-pressed={theme==='theme-pink'} title="Pink" className="theme-swatch theme-swatch--pink" onClick={() => setTheme('theme-pink')} />
        <button aria-pressed={theme==='theme-green'} title="Green" className="theme-swatch theme-swatch--green" onClick={() => setTheme('theme-green')} />
        <button aria-pressed={theme==='theme-blue'} title="Blue" className="theme-swatch theme-swatch--blue" onClick={() => setTheme('theme-blue')} />
        <button aria-pressed={theme==='theme-yellow'} title="Yellow" className="theme-swatch theme-swatch--yellow" onClick={() => setTheme('theme-yellow')} />
        <button aria-pressed={theme==='theme-neon'} title="Neon" className="theme-swatch theme-swatch--neon" onClick={() => setTheme('theme-neon')} />
        <button aria-pressed={theme==='theme-indigo'} title="Indigo" className="theme-swatch theme-swatch--indigo" onClick={() => setTheme('theme-indigo')} />
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
        <StatCard label="Revision tasks" value={revisionTasks} />
      </section>

      {reminderItems.length > 0 && (
        <section className="panel panel--reminder">
          <h3 className="panel__title">Revision reminders</h3>
          <p className="muted small">
            Upcoming sessions:{' '}
            {reminderItems.map((r) => (
              <span key={r.id} className="reminder-chip">
                {r.topicName} ({formatDateDisplay(r.revisionDate)})
              </span>
            ))}
          </p>
        </section>
      )}

      <div className="dashboard-grid">
        <div className="panel">
          <SubjectProgressChart data={subjectChart} />
        </div>
        <div className="panel">
          <CompletionPie percent={completionPercent} />
        </div>
        <div className="panel panel--wide">
          <WeeklyProductivityChart data={weekly} />
        </div>
        <div className="panel panel--wide">
          <h3 className="panel__title">Revision schedule</h3>
          <RevisionList
            items={upcomingRevisions}
            onMarkDone={(r) => {
              updateRevision(r.id, { status: 'done' });
              toast.success('Marked revision complete');
            }}
            onDelete={(r) => {
              deleteRevision(r.id);
              toast.info('Revision removed');
            }}
          />
        </div>
      </div>

      {showPomodoroFS && (
        <FullscreenPomodoro
          onClose={() => setShowPomodoroFS(false)}
        />
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
