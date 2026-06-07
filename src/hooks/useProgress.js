import { useMemo } from 'react';
import { useStudy } from '../context/StudyContext.jsx';
import {
  isTaskOverdue,
  subjectProgressStats,
  completionsByWeekday,
  getCompletionDates,
  computeStreak,
  getMonthlyActivity,
  priorityBreakdown,
  thisWeekVsLastWeek,
} from '../utils/helpers.js';

export function useProgress() {
  const { tasks, topics, subjects, revisions } = useStudy();

  return useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const revisionTasks = tasks.filter((t) => t.status === 'Revision').length;
    const overdue = tasks.filter(isTaskOverdue).length;
    const completionPercent =
      total === 0 ? 0 : Math.round((completed / total) * 100);
    const subjectChart = subjectProgressStats(subjects, topics);
    const weekly = completionsByWeekday(tasks);
    const upcomingRevisions = revisions.filter((r) => r.status === 'scheduled');

    const completionDates = getCompletionDates(tasks);
    const streak = computeStreak(completionDates);
    const now = new Date();
    const monthly = getMonthlyActivity(tasks, now.getFullYear(), now.getMonth() + 1, 2);
    const priorities = priorityBreakdown(tasks);
    const weekComparison = thisWeekVsLastWeek(tasks);

    return {
      total,
      completed,
      pending,
      revisionTasks,
      overdue,
      completionPercent,
      subjectChart,
      weekly,
      upcomingRevisions,
      streak,
      monthly,
      priorities,
      weekComparison,
    };
  }, [tasks, topics, subjects, revisions]);
}