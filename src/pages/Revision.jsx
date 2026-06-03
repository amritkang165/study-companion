import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useStudy } from '../context/StudyContext';
import { useSubjects } from '../hooks/useSubjects';
import { RevisionList } from '../components/RevisionList';

const schema = yup.object({
  topicId: yup.string().required('Select a topic'),
  revisionDate: yup.string().required(),
});

export function Revision() {
  const { revisions, addRevision, updateRevision, deleteRevision } = useStudy();
  const { subjects, topics } = useSubjects();
  const [calValue, setCalValue] = useState(new Date());

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      topicId: '',
      revisionDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onCalChange = (d) => {
    setCalValue(d);
    setValue('revisionDate', format(d, 'yyyy-MM-dd'));
  };

  const onSubmit = (data) => {
    const top = topics.find((t) => t.id === data.topicId);
    const sub = top ? subjects.find((s) => s.id === top.subjectId) : null;
    if (!top) {
      toast.error('Topic not found');
      return;
    }
    addRevision({
      topicId: top.id,
      subjectId: top.subjectId,
      topicName: top.name,
      subjectName: sub?.name ?? '',
      revisionDate: data.revisionDate,
      status: 'scheduled',
    });
    toast.success('Revision scheduled');
    reset({
      topicId: '',
      revisionDate: data.revisionDate,
    });
  };

  const selectedKey = format(calValue, 'yyyy-MM-dd');
  const forDay = useMemo(
    () =>
      revisions.filter(
        (r) => r.revisionDate && r.revisionDate.slice(0, 10) === selectedKey
      ),
    [revisions, selectedKey]
  );

  return (
    <div className="page">
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Revision planner</h2>
        <p className="muted">
          Schedule reviews for your topics.
        </p>
      </motion.header>

      <div className="revision-layout">
        <section className="panel panel--calendar">
          <h3 className="panel__title">Calendar</h3>
          <Calendar
            onChange={onCalChange}
            value={calValue}
            className="study-calendar"
          />
          <p className="muted small" style={{ marginTop: '0.75rem' }}>
            Selected: {selectedKey} — {forDay.length} session(s)
          </p>
          <RevisionList
            items={forDay}
            onMarkDone={(r) => {
              updateRevision(r.id, { status: 'done' });
              toast.success('Marked done');
            }}
            onDelete={(r) => {
              deleteRevision(r.id);
              toast.info('Removed');
            }}
          />
        </section>

        <section className="panel">
          <h3 className="panel__title">Schedule revision</h3>
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <label className="form__label">
              Topic
              <select className="input" {...register('topicId')}>
                <option value="">Select…</option>
                {topics.map((t) => {
                  const sub = subjects.find((s) => s.id === t.subjectId);
                  return (
                    <option key={t.id} value={t.id}>
                      {(sub ? `${sub.name}: ` : '') + t.name}
                    </option>
                  );
                })}
              </select>
              {errors.topicId && (
                <span className="form__error">{errors.topicId.message}</span>
              )}
            </label>
            <label className="form__label">
              Revision date
              <input
                type="date"
                className="input"
                {...register('revisionDate')}
              />
            </label>
            <button type="submit" className="btn btn--primary">
              Add to planner
            </button>
          </form>

          <h3 className="panel__title" style={{ marginTop: '1.5rem' }}>
            All scheduled
          </h3>
          <RevisionList
            items={revisions.filter((r) => r.status === 'scheduled')}
            onMarkDone={(r) => {
              updateRevision(r.id, { status: 'done' });
              toast.success('Marked done');
            }}
            onDelete={(r) => {
              deleteRevision(r.id);
              toast.info('Removed');
            }}
          />
        </section>
      </div>
    </div>
  );
}
