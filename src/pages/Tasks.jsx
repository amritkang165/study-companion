import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { parseISO, compareAsc } from 'date-fns';
import { useTasks } from '../hooks/useTasks';
import { useSubjects } from '../hooks/useSubjects';
import { TaskCard } from '../components/TaskCard';
import { SearchBar } from '../components/SearchBar';
import { useDebounce } from '../hooks/useDebounce';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  isTaskOverdue,
  priorityOrder,
} from '../utils/helpers';

const taskSchema = yup.object({
  title: yup.string().required('Title is required').max(200),
  subject: yup.string().required('Subject is required'),
  topic: yup.string().max(120),
  deadline: yup.string().nullable(),
  priority: yup.string().required(),
  status: yup.string().required(),
});

const TABS = [
  { id: 'all', label: 'All tasks' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'revision', label: 'Revision' },
];

function matchesTab(task, tab) {
  switch (tab) {
    case 'all':
      return true;
    case 'pending':
      return task.status === 'Pending';
    case 'completed':
      return task.status === 'Completed';
    case 'overdue':
      return isTaskOverdue(task);
    case 'revision':
      return task.status === 'Revision';
    default:
      return true;
  }
}

export function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { subjects, topics } = useSubjects();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDeadlineBefore, setFilterDeadlineBefore] = useState('');
  const [sortBy, setSortBy] = useState('due');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title: '',
      subject: '',
      topic: '',
      deadline: '',
      priority: 'Medium',
      status: 'Pending',
    },
  });

  const formSubjectName = watch('subject');
  const formTopicOptions = useMemo(() => {
    if (!formSubjectName) return topics;
    const sub = subjects.find((s) => s.name === formSubjectName);
    if (!sub) return topics;
    return topics.filter((t) => t.subjectId === sub.id);
  }, [subjects, topics, formSubjectName]);

  const onSubmit = (data) => {
    addTask({
      ...data,
      deadline: data.deadline || null,
    });
    toast.success('Task created');
    reset({
      title: '',
      subject: data.subject,
      topic: '',
      deadline: '',
      priority: 'Medium',
      status: 'Pending',
    });
  };

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    let list = tasks.filter((t) => matchesTab(t, tab));

    if (filterSubject) {
      list = list.filter((t) => t.subject === filterSubject);
    }
    if (filterPriority) {
      list = list.filter((t) => t.priority === filterPriority);
    }
    if (filterStatus) {
      list = list.filter((t) => t.status === filterStatus);
    }
    if (filterDeadlineBefore) {
      const before = parseISO(filterDeadlineBefore);
      list = list.filter((t) => {
        if (!t.deadline) return false;
        return compareAsc(parseISO(t.deadline), before) <= 0;
      });
    }

    if (q) {
      const topicNotesMatch = new Set(
        topics
          .filter(
            (top) =>
              top.name.toLowerCase().includes(q) ||
              (top.notes || '').toLowerCase().includes(q)
          )
          .map((top) => top.name)
      );
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.topic.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          topicNotesMatch.has(t.topic)
      );
    }

    const sorted = [...list];
    if (sortBy === 'due') {
      sorted.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return compareAsc(parseISO(a.deadline), parseISO(b.deadline));
      });
    } else if (sortBy === 'priority') {
      sorted.sort(
        (a, b) => priorityOrder(a.priority) - priorityOrder(b.priority)
      );
    } else if (sortBy === 'subject') {
      sorted.sort((a, b) => a.subject.localeCompare(b.subject));
    }
    return sorted;
  }, [
    tasks,
    tab,
    debounced,
    filterSubject,
    filterPriority,
    filterStatus,
    filterDeadlineBefore,
    sortBy,
    topics,
  ]);

  return (
    <div className="page">
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Study tasks</h2>
        <p className="muted">Track deadlines, priorities, and revision work</p>
      </motion.header>

      <div className="tabs" role="tablist" aria-label="Task categories">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tabs__btn ${tab === t.id ? 'tabs__btn--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search tasks, topics, notes…"
      />

      <div className="filters-bar">
        <label className="filters-bar__item">
          <span>Subject</span>
          <select
            className="input input--sm"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">All</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="filters-bar__item">
          <span>Priority</span>
          <select
            className="input input--sm"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="filters-bar__item">
          <span>Status</span>
          <select
            className="input input--sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="filters-bar__item">
          <span>Deadline by</span>
          <input
            type="date"
            className="input input--sm"
            value={filterDeadlineBefore}
            onChange={(e) => setFilterDeadlineBefore(e.target.value)}
          />
        </label>
        <label className="filters-bar__item">
          <span>Sort</span>
          <select
            className="input input--sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="due">Due date</option>
            <option value="priority">Priority</option>
            <option value="subject">Subject name</option>
          </select>
        </label>
      </div>

      <div className="layout-split layout-split--tasks">
        <section className="panel">
          <h3 className="panel__title">New task</h3>
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <label className="form__label">
              Title
              <input className="input" {...register('title')} />
              {errors.title && (
                <span className="form__error">{errors.title.message}</span>
              )}
            </label>
            <label className="form__label">
              Subject
              <select
                className="input"
                {...register('subject', {
                  onChange: () => setValue('topic', ''),
                })}
              >
                <option value="">Select…</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <span className="form__error">{errors.subject.message}</span>
              )}
            </label>
            <label className="form__label">
              Topic
              <select className="input" {...register('topic')}>
                <option value="">Optional</option>
                {formTopicOptions.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form__label">
              Deadline
              <input type="date" className="input" {...register('deadline')} />
            </label>
            <label className="form__label">
              Priority
              <select className="input" {...register('priority')}>
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="form__label">
              Status
              <select className="input" {...register('status')}>
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn btn--primary">
              Add task
            </button>
          </form>
        </section>

        <section className="task-list-wrap">
          <p className="muted small">
            Showing {filtered.length} of {tasks.length} tasks
          </p>
          <div className="task-list">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={(t, next) => {
                  updateTask(t.id, { status: next });
                  toast.info(next === 'Completed' ? 'Nice work!' : 'Task reopened');
                }}
                onDelete={(t) => {
                  if (window.confirm('Delete this task?')) {
                    deleteTask(t.id);
                    toast.info('Task deleted');
                  }
                }}
              />
            ))}
            {!filtered.length && (
              <p className="muted">No tasks match your filters.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
