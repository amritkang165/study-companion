import {
  addDays,
  differenceInDays,
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

export function getCompletionDates(tasks) {
  return tasks
    .filter((t) => t.status === 'Completed' && t.completedAt)
    .map((t) => format(parseISO(t.completedAt), 'yyyy-MM-dd'));
}

export function computeStreak(completedDates) {
  if (!completedDates.length) return { current: 0, longest: 0 };
  const unique = [...new Set(completedDates)].sort().reverse();

  let current = 0;
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
  let check = today;
  while (unique.includes(check)) {
    current++;
    check = format(addDays(parseISO(check), -1), 'yyyy-MM-dd');
  }
  if (current === 0 && unique.includes(yesterday)) {
    current = 1;
    check = yesterday;
    while (unique.includes(check)) {
      current++;
      check = format(addDays(parseISO(check), -1), 'yyyy-MM-dd');
    }
  }

  const sorted = [...new Set(completedDates)].sort();
  let longest = 1;
  let temp = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
    if (diff === 1) {
      temp++;
      longest = Math.max(longest, temp);
    } else {
      temp = 1;
    }
  }

  return { current, longest };
}

export function getMonthlyActivity(tasks, year, month, numMonths = 1) {
  const completionDates = getCompletionDates(tasks);
  const counts = {};
  completionDates.forEach((d) => { counts[d] = (counts[d] || 0) + 1; });

  const result = [];
  for (let i = numMonths - 1; i >= 0; i--) {
    let targetMonth = month - i;
    let targetYear = year;
    while (targetMonth <= 0) { targetMonth += 12; targetYear -= 1; }
    while (targetMonth > 12) { targetMonth -= 12; targetYear += 1; }

    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ date: d, count: counts[dateStr] || 0, month: targetMonth, year: targetYear });
    }
  }
  return result;
}

export function priorityBreakdown(tasks) {
  return TASK_PRIORITIES.map((p) => ({
    priority: p,
    count: tasks.filter((t) => t.priority === p).length,
  }));
}

export function thisWeekVsLastWeek(tasks) {
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = addDays(thisWeekStart, -7);
  const lastWeekEnd = addDays(thisWeekStart, -1);

  const thisWeek = tasks.filter((t) => {
    if (t.status !== 'Completed' || !t.completedAt) return false;
    return isWithinInterval(parseISO(t.completedAt), {
      start: thisWeekStart,
      end: endOfWeek(now, { weekStartsOn: 1 }),
    });
  }).length;

  const lastWeek = tasks.filter((t) => {
    if (t.status !== 'Completed' || !t.completedAt) return false;
    return isWithinInterval(parseISO(t.completedAt), {
      start: lastWeekStart,
      end: lastWeekEnd,
    });
  }).length;

  return { thisWeek, lastWeek };
}
