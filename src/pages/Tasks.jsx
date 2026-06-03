import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTasks } from '../hooks/useTasks';
import { useSubjects } from '../hooks/useSubjects';
import { useDebounce } from '../hooks/useDebounce';
import { TASK_PRIORITIES, TASK_STATUSES, isTaskOverdue, priorityOrder } from '../utils/helpers';
import { TaskCard } from '../components/TaskCard';

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
    return topics.filter((t) => {
      const sub = subjects.find((s) => s.name === formSubjectName);
      return sub ? t.subjectId === sub.id : true;
    });
  }, [subjects, topics, formSubjectName]);

  const onSubmit = (data) => {
    addTask(data);
    toast.success('Task added');
    reset({ title: '', subject: '', topic: '', deadline: '', priority: 'Medium', status: 'Pending' });
  };

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => matchesTab(t, tab))
      .filter((t) => {
        const q = debounced.trim().toLowerCase();
        if (!q) return true;
        return (
          (t.title || '').toLowerCase().includes(q) ||
          (t.subject || '').toLowerCase().includes(q) ||
          (t.topic || '').toLowerCase().includes(q)
        );
      })
      .filter((t) => (filterSubject ? t.subject === filterSubject : true))
      .filter((t) => (filterPriority ? t.priority === filterPriority : true))
      .filter((t) => (filterStatus ? t.status === filterStatus : true))
      .filter((t) => (filterDeadlineBefore ? (t.deadline || '') <= filterDeadlineBefore : true))
      .sort((a, b) => {
        if (sortBy === 'due') {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.localeCompare(b.deadline);
        }
        if (sortBy === 'priority') {
          return priorityOrder(a.priority) - priorityOrder(b.priority);
        }
        if (sortBy === 'created') {
          return a.id.localeCompare(b.id);
        }
        return 0;
      });
  }, [tasks, tab, debounced, filterSubject, filterPriority, filterStatus, filterDeadlineBefore, sortBy, topics]);

  return (
    <div className="page">
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Tasks</h2>
        <p className="muted">Create and manage study tasks</p>
      </motion.header>

      <div className="tabs" style={{ marginBottom: '0.75rem' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tabs__btn ${tab === t.id ? 'tabs__btn--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="layout-split">
        <section className="panel">
          <h3 className="panel__title">New task</h3>
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <label className="form__label">
              Title
              <input className="input" {...register('title')} />
              {errors.title && <span className="form__error">{errors.title.message}</span>}
            </label>
            <label className="form__label">
              Subject (name)
              <select className="input" {...register('subject')}>
                <option value="">Select…</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              {errors.subject && <span className="form__error">{errors.subject.message}</span>}
            </label>
            <label className="form__label">
              Topic
              <select className="input" {...register('topic')}>
                <option value="">Select…</option>
                {formTopicOptions.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
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
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="form__label">
              Status
              <select className="input" {...register('status')}>
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <div className="form__actions">
              <button type="submit" className="btn btn--primary">Add task</button>
            </div>
          </form>
        </section>

        <section className="panel panel--wide">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="input" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="">All subjects</option>
              {subjects.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
            <select className="input" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">All priorities</option>
              {TASK_PRIORITIES.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
            <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All statuses</option>
              {TASK_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>

          <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <label className="small muted">Sort by:</label>
            <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="due">Due date</option>
              <option value="priority">Priority</option>
              <option value="created">Created</option>
            </select>

            <label style={{ marginLeft: 'auto' }} className="small muted">Filter before:</label>
            <input type="date" className="input" value={filterDeadlineBefore} onChange={(e) => setFilterDeadlineBefore(e.target.value)} />
          </div>

          <div className="task-list">
            {filtered.length === 0 && <p className="muted">No tasks found.</p>}
            {filtered.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onToggleComplete={(task, status) => {
                  updateTask(task.id, { status });
                  toast.success(status === 'Completed' ? 'Marked completed' : 'Marked pending');
                }}
                onDelete={(task) => {
                  if (window.confirm('Delete task?')) {
                    deleteTask(task.id);
                    toast.info('Task deleted');
                  }
                }}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
