import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSubjects } from '../hooks/useSubjects';
import { useTasks } from '../hooks/useTasks';
import { useDebounce } from '../hooks/useDebounce';
import { SubjectCard } from '../components/SubjectCard';
import { TaskCard } from '../components/TaskCard';
import { TOPIC_STATUSES, TASK_PRIORITIES, isTaskOverdue } from '../utils/helpers';

const subjectSchema = yup.object({
  name: yup.string().required('Name is required').max(120),
  description: yup.string().max(500),
  color: yup.string().required(),
});

const taskSchema = yup.object({
  title: yup.string().required('Title is required').max(200),
  subjectId: yup.string().required('Subject is required'),
  topic: yup.string().max(120),
  deadline: yup.string().nullable(),
  priority: yup.string().required(),
});

export function SubjectsTasks() {
  const {
    subjects,
    topics,
    addSubject,
    updateSubject,
    deleteSubject,
    updateTopic,
    deleteTopic,
  } = useSubjects();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 250);
  const [editingSubject, setEditingSubject] = useState(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFilter, setTaskFilter] = useState('All');
  const [taskSort, setTaskSort] = useState('deadline');

  const {
    register: regSub,
    handleSubmit: submitSub,
    reset: resetSub,
    formState: { errors: errSub },
  } = useForm({
    resolver: yupResolver(subjectSchema),
    defaultValues: { name: '', description: '', color: '#d9468f' },
  });

  const {
    register: regTask,
    handleSubmit: submitTask,
    reset: resetTask,
    watch: watchTask,
    formState: { errors: errTask },
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: { title: '', subjectId: '', topic: '', deadline: '', priority: 'Medium' },
  });

  const taskSubjectId = watchTask('subjectId');
  const taskTopicOptions = useMemo(() => {
    return topics.filter((t) => t.subjectId === taskSubjectId);
  }, [topics, taskSubjectId]);

  const filteredSubjects = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((s) => {
      const matchSub = s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
      const matchTopics = topics.some((t) => t.subjectId === s.id && (t.name.toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q)));
      const matchTasks = tasks.some((t) => t.subject === s.name && t.title.toLowerCase().includes(q));
      return matchSub || matchTopics || matchTasks;
    });
  }, [subjects, topics, tasks, debounced]);

  const filteredTasks = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    let result = tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !(t.subject || '').toLowerCase().includes(q)) return false;
      if (taskFilter === 'Pending' && t.status !== 'Pending') return false;
      if (taskFilter === 'Completed' && t.status !== 'Completed') return false;
      if (taskFilter === 'Overdue' && !isTaskOverdue(t)) return false;
      return true;
    });
    if (taskSort === 'deadline') {
      result.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      });
    } else {
      const order = { High: 0, Medium: 1, Low: 2 };
      result.sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
    }
    return result;
  }, [tasks, debounced, taskFilter, taskSort]);

  const filterCounts = useMemo(() => ({
    All: tasks.length,
    Pending: tasks.filter((t) => t.status === 'Pending').length,
    Completed: tasks.filter((t) => t.status === 'Completed').length,
    Overdue: tasks.filter(isTaskOverdue).length,
  }), [tasks]);

  const onSubjectSubmit = (data) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, data);
      toast.success('Subject updated');
      setEditingSubject(null);
    } else {
      addSubject(data);
      toast.success('Subject added');
    }
    resetSub({ name: '', description: '', color: data.color });
  };

  const onEditSubject = (s) => {
    setEditingSubject(s);
    resetSub({ name: s.name, description: s.description, color: s.color });
  };

  const onTaskSubmit = (data) => {
    const sub = subjects.find((s) => s.id === data.subjectId);
    addTask({ title: data.title, subject: sub?.name || '', topic: data.topic, deadline: data.deadline || null, priority: data.priority, status: 'Pending' });
    toast.success('Task added');
    resetTask({ title: '', subjectId: data.subjectId, topic: '', deadline: '', priority: 'Medium' });
  };

  return (
    <div className="page">
      <motion.header className="page-header" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h2 style={{ margin: 0 }}>Subjects & Tasks</h2>
          <p className="muted" style={{ margin: 0 }}>Organise courses, topics, and study tasks</p>
        </div>
      </motion.header>

      <div className="subjects-tasks-split">
        <section className="subjects-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Subjects ({subjects.length})</h3>
            <input className="input input--sm" style={{ flex: 1, minWidth: 0 }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setShowSubjectForm(!showSubjectForm)}>
              {showSubjectForm ? 'Cancel' : '+ Subject'}
            </button>
          </div>
          {showSubjectForm && (
            <div className="panel" style={{ padding: '0.6rem', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.85rem' }}>{editingSubject ? 'Edit subject' : 'New subject'}</h4>
              <form className="form" onSubmit={submitSub(onSubjectSubmit)} style={{ gap: '0.35rem' }}>
                <label className="form__label" style={{ fontSize: '0.8rem' }}>Name<input className="input input--sm" {...regSub('name')} />{errSub.name && <span className="form__error">{errSub.name.message}</span>}</label>
                <label className="form__label" style={{ fontSize: '0.8rem' }}>Description<textarea className="input input--area" rows={1} {...regSub('description')} /></label>
                <label className="form__label" style={{ fontSize: '0.8rem' }}>Color<input type="color" className="input input--color" {...regSub('color')} /></label>
                <div className="form__actions">
                  <button type="submit" className="btn btn--primary btn--sm">{editingSubject ? 'Save' : 'Add'}</button>
                  {editingSubject && <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setEditingSubject(null); resetSub({ name: '', description: '', color: '#d9468f' }); }}>Cancel</button>}
                </div>
              </form>
            </div>
          )}
          <div className="subjects-scroll">
            <AnimatePresence mode="popLayout">
              {filteredSubjects.map((s) => {
                const st = topics.filter((t) => t.subjectId === s.id);
                const subjectTasks = tasks.filter((t) => t.subject === s.name);
                const open = expandedSubjectId === s.id;
                return (
                  <div key={s.id} className="subject-block" style={{ marginBottom: 6 }}>
                    <SubjectCard subject={s} topicCount={st.length} onEdit={onEditSubject} onDelete={(sub) => { if (window.confirm(`Delete "${sub.name}" and its topics?`)) { deleteSubject(sub.id); toast.info('Subject deleted'); } }} />
                    <button type="button" className="btn btn--ghost btn--sm" style={{ fontSize: '0.75rem', marginTop: 2 }} onClick={() => setExpandedSubjectId(open ? null : s.id)}>
                      {open ? 'Hide' : `Topics (${st.length}) · Tasks (${subjectTasks.length})`}
                    </button>
                    {open && (
                      <>
                        {st.map((t) => (
                          <div key={t.id} className="topic-list__item" style={{ padding: '4px 8px', marginTop: 4, background: 'var(--surface)', borderRadius: 6 }}>
                            <div className="topic-list__head">
                              <strong style={{ fontSize: '0.85rem' }}>{t.name}</strong>
                              <span className="badge" style={{ fontSize: '0.7rem' }}>{t.difficulty}</span>
                              <span className="badge badge--muted" style={{ fontSize: '0.7rem' }}>{t.status}</span>
                            </div>
                            <div className="topic-list__actions" style={{ marginTop: 4 }}>
                              <select className="input input--sm" style={{ fontSize: '0.75rem' }} value={t.status} onChange={(e) => updateTopic(t.id, { status: e.target.value })}>
                                {TOPIC_STATUSES.map((stt) => (<option key={stt} value={stt}>{stt}</option>))}
                              </select>
                              <button type="button" className="btn btn--ghost btn--sm btn--danger" style={{ fontSize: '0.75rem' }} onClick={() => { if (window.confirm('Delete this topic?')) { deleteTopic(t.id); toast.info('Topic deleted'); } }}>Delete</button>
                            </div>
                          </div>
                        ))}
                        {subjectTasks.map((t) => (
                          <TaskCard key={t.id} task={t} onToggleComplete={(task, status) => { updateTask(task.id, { status }); toast.success(status === 'Completed' ? 'Marked completed' : 'Marked pending'); }} onDelete={(task) => { if (window.confirm('Delete task?')) { deleteTask(task.id); toast.info('Task deleted'); } }} />
                        ))}
                        {st.length === 0 && subjectTasks.length === 0 && <p className="muted" style={{ fontSize: '0.8rem', margin: '4px 0' }}>Empty</p>}
                      </>
                    )}
                  </div>
                );
              })}
            </AnimatePresence>
            {!filteredSubjects.length && <p className="muted" style={{ fontSize: '0.85rem' }}>No subjects match your search.</p>}
          </div>
        </section>

        <div className="split-divider" />

        <section className="tasks-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.4rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Tasks ({filteredTasks.length})</h3>
            <button type="button" className="btn btn--primary btn--sm" style={{ marginLeft: 'auto' }} onClick={() => setShowTaskForm(!showTaskForm)}>
              {showTaskForm ? 'Cancel' : '+ Task'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            {['All', 'Pending', 'Completed', 'Overdue'].map((f) => (
              <button key={f} type="button" className={`btn btn--sm ${taskFilter === f ? 'btn--primary' : 'btn--ghost'}`} style={{ fontSize: '0.75rem' }} onClick={() => setTaskFilter(f)}>
                {f} <span className="muted" style={{ opacity: 0.6 }}>({filterCounts[f]})</span>
              </button>
            ))}
            <select className="input input--sm" style={{ marginLeft: 'auto', fontSize: '0.75rem', width: 'auto' }} value={taskSort} onChange={(e) => setTaskSort(e.target.value)}>
              <option value="deadline">By deadline</option>
              <option value="priority">By priority</option>
            </select>
          </div>
          {showTaskForm && (
            <div className="panel" style={{ padding: '0.6rem', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.85rem' }}>New task</h4>
              <form className="form" onSubmit={submitTask(onTaskSubmit)} style={{ gap: '0.35rem' }}>
                <label className="form__label" style={{ fontSize: '0.8rem' }}>Title<input className="input input--sm" {...regTask('title')} />{errTask.title && <span className="form__error">{errTask.title.message}</span>}</label>
                <label className="form__label" style={{ fontSize: '0.8rem' }}>Subject<select className="input input--sm" {...regTask('subjectId')}><option value="">Select…</option>{subjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}</select>{errTask.subjectId && <span className="form__error">{errTask.subjectId.message}</span>}</label>
                <label className="form__label" style={{ fontSize: '0.8rem' }}>Topic<select className="input input--sm" {...regTask('topic')}><option value="">Select…</option>{taskTopicOptions.map((t) => (<option key={t.id} value={t.name}>{t.name}</option>))}</select></label>
                <label className="form__label" style={{ fontSize: '0.8rem' }}>Deadline<input type="date" className="input input--sm" {...regTask('deadline')} /></label>
                <label className="form__label" style={{ fontSize: '0.8rem' }}>Priority<select className="input input--sm" {...regTask('priority')}>{TASK_PRIORITIES.map((p) => (<option key={p} value={p}>{p}</option>))}</select></label>
                <button type="submit" className="btn btn--primary btn--sm">Add</button>
              </form>
            </div>
          )}
          <div className="tasks-scroll">
            {filteredTasks.length === 0 && <p className="muted" style={{ fontSize: '0.85rem' }}>No tasks yet.</p>}
            {filteredTasks.map((t) => (
              <TaskCard key={t.id} task={t} onToggleComplete={(task, status) => { updateTask(task.id, { status }); toast.success(status === 'Completed' ? 'Marked completed' : 'Marked pending'); }} onDelete={(task) => { if (window.confirm('Delete task?')) { deleteTask(task.id); toast.info('Task deleted'); } }} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
