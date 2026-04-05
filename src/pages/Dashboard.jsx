import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useProgress } from '../hooks/useProgress';
import { useStudy } from '../context/StudyContext';
import {
  SubjectProgressChart,
  CompletionPie,
  WeeklyProductivityChart,
} from '../components/ProgressChart';
import { RevisionList } from '../components/RevisionList';
import { fetchMotivationalQuote } from '../services/aiService';
import { formatDateDisplay } from '../utils/helpers';
import { parseISO, isBefore, startOfDay } from 'date-fns';

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
