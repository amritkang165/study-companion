import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';

const PIE_COLORS = ['var(--accent)', 'var(--surface)'];
const HEAT_COLORS = ['var(--surface)', '#1a6b3c', '#27ae60', '#2ecc71', '#58d68d'];

export function SubjectProgressChart({ data }) {
  if (!data?.length) {
    return <p className="chart-empty">Add subjects and topics to see progress.</p>;
  }
  return (
    <div className="chart-wrap">
      <h3 className="chart-title">Subject progress</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
          />
          <Bar dataKey="percent" fill="var(--accent)" radius={[6, 6, 0, 0]} name="Complete %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompletionPie({ percent }) {
  const data = [
    { name: 'Done', value: percent },
    { name: 'Remaining', value: Math.max(0, 100 - percent) },
  ];
  return (
    <div className="chart-wrap chart-wrap--pie">
      <h3 className="chart-title">Task completion</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ color: 'var(--muted)' }} />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyProductivityChart({ data }) {
  return (
    <div className="chart-wrap">
      <h3 className="chart-title">This week (tasks completed)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
          />
          <Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function heatColor(count, max) {
  if (count === 0) return HEAT_COLORS[0];
  const idx = Math.min(Math.ceil((count / Math.max(max, 1)) * (HEAT_COLORS.length - 1)), HEAT_COLORS.length - 1);
  return HEAT_COLORS[idx];
}

export function ConsistencyHeatmap({ monthly, streak, weekComparison }) {
  const maxCount = Math.max(...monthly.map((d) => d.count), 1);
  const weeks = [];
  let week = [];
  const firstDow = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();
  const emptyStart = firstDow === 0 ? 6 : firstDow - 1;
  for (let i = 0; i < emptyStart; i++) week.push(null);
  monthly.forEach((d) => {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="panel">
      <h3 className="chart-title" style={{ fontSize: '0.95rem', marginBottom: 4 }}>Consistency</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
        <div className="stat-card" style={{ flex: 1, minWidth: 80, padding: '6px 10px' }}>
          <span className="stat-card__value" style={{ fontSize: '1.1rem' }}>{streak.current}</span>
          <span className="stat-card__label" style={{ fontSize: '0.7rem' }}>day streak</span>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 80, padding: '6px 10px' }}>
          <span className="stat-card__value" style={{ fontSize: '1.1rem' }}>{streak.longest}</span>
          <span className="stat-card__label" style={{ fontSize: '0.7rem' }}>best streak</span>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 80, padding: '6px 10px' }}>
          <span className="stat-card__value" style={{ fontSize: '1.1rem' }}>{weekComparison.thisWeek}</span>
          <span className="stat-card__label" style={{ fontSize: '0.7rem' }}>
            this week {weekComparison.lastWeek > 0 && <span style={{ opacity: 0.6 }}>(vs {weekComparison.lastWeek})</span>}
          </span>
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, color: 'var(--muted)' }}>{monthName}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {weeks.map((w, wi) => (
          <div key={wi} style={{ display: 'flex', gap: 2 }}>
            {w.map((d, di) => (
              <div
                key={di}
                title={d ? `${d.count} task${d.count !== 1 ? 's' : ''}` : ''}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: d ? heatColor(d.count, maxCount) : 'transparent',
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 6 }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Less</span>
        {HEAT_COLORS.map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>More</span>
      </div>
    </div>
  );
}

export function PriorityBreakdown({ priorities }) {
  const total = priorities.reduce((s, p) => s + p.count, 0);
  if (!total) return null;
  return (
    <div className="panel">
      <h3 className="chart-title" style={{ fontSize: '0.95rem', marginBottom: 4 }}>By priority</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {priorities.map((p) => (
          <div key={p.priority} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', width: 50, fontWeight: p.priority === 'High' ? 600 : 400 }}>{p.priority}</span>
            <div style={{ flex: 1, height: 8, background: 'var(--surface)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${total ? (p.count / total) * 100 : 0}%`,
                  height: '100%',
                  background: p.priority === 'High' ? 'var(--danger, #e74c3c)' : p.priority === 'Medium' ? 'var(--accent)' : 'var(--muted)',
                  borderRadius: 4,
                  transition: 'width 0.3s',
                }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', width: 24, textAlign: 'right' }}>{p.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
