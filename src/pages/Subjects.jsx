import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSubjects } from '../hooks/useSubjects';
import { SubjectCard } from '../components/SubjectCard';
import { SearchBar } from '../components/SearchBar';
import { useDebounce } from '../hooks/useDebounce';
import { TOPIC_STATUSES } from '../utils/helpers';

const subjectSchema = yup.object({
  name: yup.string().required('Name is required').max(120),
  description: yup.string().max(500),
  color: yup.string().required(),
});

const topicSchema = yup.object({
  subjectId: yup.string().required('Pick a subject'),
  name: yup.string().required('Topic name is required').max(120),
  difficulty: yup.string().required(),
  status: yup.string().required(),
  notes: yup.string().max(2000),
});

export function Subjects() {
  const {
    subjects,
    topics,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
  } = useSubjects();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 250);
  const [editingSubject, setEditingSubject] = useState(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);

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
    register: regTop,
    handleSubmit: submitTop,
    reset: resetTop,
    formState: { errors: errTop },
  } = useForm({
    resolver: yupResolver(topicSchema),
    defaultValues: {
      subjectId: '',
      name: '',
      difficulty: 'Medium',
      status: 'Not Started',
      notes: '',
    },
  });

  const filteredSubjects = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((s) => {
      const matchSub =
        s.name.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q);
      const matchTopics = topics.some(
        (t) =>
          t.subjectId === s.id &&
          (t.name.toLowerCase().includes(q) ||
            (t.notes || '').toLowerCase().includes(q))
      );
      return matchSub || matchTopics;
    });
  }, [subjects, topics, debounced]);

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
    resetSub({
      name: s.name,
      description: s.description,
      color: s.color,
    });
  };

  const onTopicSubmit = (data) => {
    addTopic(data);
    toast.success('Topic added');
    resetTop({
      subjectId: data.subjectId,
      name: '',
      difficulty: 'Medium',
      status: 'Not Started',
      notes: '',
    });
  };

  return (
    <div className="page">
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Subjects & topics</h2>
        <p className="muted">Organize courses and break them into topics</p>
      </motion.header>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search subjects, topics, notes…"
      />

      <div className="layout-split">
        <section className="panel">
          <h3 className="panel__title">
            {editingSubject ? 'Edit subject' : 'New subject'}
          </h3>
          <form className="form" onSubmit={submitSub(onSubjectSubmit)}>
            <label className="form__label">
              Name
              <input className="input" {...regSub('name')} />
              {errSub.name && (
                <span className="form__error">{errSub.name.message}</span>
              )}
            </label>
            <label className="form__label">
              Description
              <textarea className="input input--area" rows={2} {...regSub('description')} />
            </label>
            <label className="form__label">
              Color
              <input type="color" className="input input--color" {...regSub('color')} />
            </label>
            <div className="form__actions">
              <button type="submit" className="btn btn--primary">
                {editingSubject ? 'Save changes' : 'Add subject'}
              </button>
              {editingSubject && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setEditingSubject(null);
                    resetSub({ name: '', description: '', color: '#d9468f' });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h3 className="panel__title" style={{ marginTop: '1.5rem' }}>
            New topic
          </h3>
          <form className="form" onSubmit={submitTop(onTopicSubmit)}>
            <label className="form__label">
              Subject
              <select className="input" {...regTop('subjectId')}>
                <option value="">Select…</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errTop.subjectId && (
                <span className="form__error">{errTop.subjectId.message}</span>
              )}
            </label>
            <label className="form__label">
              Topic name
              <input className="input" {...regTop('name')} />
              {errTop.name && (
                <span className="form__error">{errTop.name.message}</span>
              )}
            </label>
            <label className="form__label">
              Difficulty
              <select className="input" {...regTop('difficulty')}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
            <label className="form__label">
              Status
              <select className="input" {...regTop('status')}>
                {TOPIC_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </label>
            <label className="form__label">
              Notes
              <textarea className="input input--area" rows={3} {...regTop('notes')} />
            </label>
            <button type="submit" className="btn btn--primary">
              Add topic
            </button>
          </form>
        </section>

        <section className="subjects-list">
          <AnimatePresence mode="popLayout">
            {filteredSubjects.map((s) => {
              const st = topics.filter((t) => t.subjectId === s.id);
              const open = expandedSubjectId === s.id;
              return (
                <div key={s.id} className="subject-block">
                  <SubjectCard
                    subject={s}
                    topicCount={st.length}
                    onEdit={onEditSubject}
                    onDelete={(sub) => {
                      if (window.confirm(`Delete “${sub.name}” and its topics?`)) {
                        deleteSubject(sub.id);
                        toast.info('Subject deleted');
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm subject-block__toggle"
                    onClick={() =>
                      setExpandedSubjectId(open ? null : s.id)
                    }
                  >
                    {open ? 'Hide topics' : `Topics (${st.length})`}
                  </button>
                  {open && (
                    <ul className="topic-list">
                      {st.map((t) => (
                        <li key={t.id} className="topic-list__item">
                          <div className="topic-list__head">
                            <strong>{t.name}</strong>
                            <span className="badge">{t.difficulty}</span>
                            <span className="badge badge--muted">{t.status}</span>
                          </div>
                          {t.notes && <p className="topic-list__notes">{t.notes}</p>}
                          <div className="topic-list__actions">
                            <select
                              className="input input--sm"
                              value={t.status}
                              onChange={(e) =>
                                updateTopic(t.id, { status: e.target.value })
                              }
                            >
                              {TOPIC_STATUSES.map((stt) => (
                                <option key={stt} value={stt}>
                                  {stt}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm btn--danger"
                              onClick={() => {
                                if (window.confirm('Delete this topic?')) {
                                  deleteTopic(t.id);
                                  toast.info('Topic deleted');
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </AnimatePresence>
          {!filteredSubjects.length && (
            <p className="muted">No subjects match your search.</p>
          )}
        </section>
      </div>
    </div>
  );
}
