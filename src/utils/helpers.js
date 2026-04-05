import {
  addDays,
  format,
  isBefore,
  parseISO,
  startOfDay,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from 'date-fns';

export const TOPIC_STATUSES = [
  'Not Started',
  'In Progress',
  'Completed',
  'Needs Revision',
];

export const TASK_PRIORITIES = ['Low', 'Medium', 'High'];

export const TASK_STATUSES = ['Pending', 'Completed', 'Revision'];

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function isTaskOverdue(task) {
  if (!task.deadline || task.status === 'Completed') return false;
  const d = parseISO(task.deadline);
  return isBefore(d, startOfDay(new Date()));
}

export function priorityOrder(p) {
  const map = { High: 0, Medium: 1, Low: 2 };
  return map[p] ?? 3;
}

export function formatDateDisplay(iso) {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

export function countCompletionsInWeek(tasks, weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return tasks.filter((t) => {
    if (t.status !== 'Completed' || !t.completedAt) return false;
    const d = parseISO(t.completedAt);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  }).length;
}

export function completionsByWeekday(tasks) {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const counts = Object.fromEntries(labels.map((d) => [d, 0]));
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  tasks.forEach((t) => {
    if (t.status !== 'Completed' || !t.completedAt) return;
    const d = parseISO(t.completedAt);
    if (!isWithinInterval(d, { start, end })) return;
    const idx = (d.getDay() + 6) % 7;
    counts[labels[idx]] += 1;
  });
  return labels.map((name) => ({ name, count: counts[name] }));
}

export function subjectProgressStats(subjects, topics) {
  return subjects.map((s) => {
    const st = topics.filter((t) => t.subjectId === s.id);
    const done = st.filter((t) => t.status === 'Completed').length;
    const total = st.length || 1;
    return {
      name: s.name,
      completed: done,
      total: st.length,
      percent: Math.round((done / total) * 100),
    };
  });
}

export function defaultRevisionDate() {
  return format(addDays(new Date(), 3), 'yyyy-MM-dd');
}
