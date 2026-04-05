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

const PIE_COLORS = ['#d9468f', '#3d3540'];

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
