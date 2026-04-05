import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { format } from 'date-fns';
import { generateId, defaultRevisionDate } from '../utils/helpers';

const STORAGE_KEY = 'study-companion-v1';

const StudyContext = createContext(null);

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Provide sample data if nothing in localStorage
      return {
        subjects: [
          {
            id: 'subj1',
            name: 'Mathematics',
            description: 'Algebra, Geometry, Calculus',
            color: '#d9468f',
          },
          {
            id: 'subj2',
            name: 'Physics',
            description: 'Mechanics, Optics, Thermodynamics',
            color: '#8f46d9',
          },
          {
            id: 'subj3',
            name: 'Chemistry',
            description: 'Organic, Inorganic, Physical',
            color: '#46d9b2',
          },
        ],
        topics: [
          {
            id: 'top1',
            subjectId: 'subj1',
            name: 'Quadratic Equations',
            difficulty: 'Medium',
            status: 'Completed',
            notes: 'Practice more problems.',
          },
          {
            id: 'top2',
            subjectId: 'subj2',
            name: 'Newton’s Laws',
            difficulty: 'Easy',
            status: 'Completed',
            notes: 'Understand all three laws.',
          },
          {
            id: 'top3',
            subjectId: 'subj3',
            name: 'Acids and Bases',
            difficulty: 'Medium',
            status: 'In Progress',
            notes: 'Review pH calculations.',
          },
          {
            id: 'top4',
            subjectId: 'subj1',
            name: 'Integration',
            difficulty: 'Hard',
            status: 'Not Started',
            notes: '',
          },
          {
            id: 'top5',
            subjectId: 'subj2',
            name: 'Optics',
            difficulty: 'Medium',
            status: 'In Progress',
            notes: '',
          },
        ],
        tasks: [
          {
            id: 'task1',
            title: 'Solve 10 quadratic equations',
            subject: 'Mathematics',
            topic: 'Quadratic Equations',
            deadline: '2026-04-10',
            priority: 'High',
            status: 'Completed',
            completedAt: '2026-04-06T10:00:00',
          },
          {
            id: 'task2',
            title: 'Read about Newton’s Laws',
            subject: 'Physics',
            topic: 'Newton’s Laws',
            deadline: '2026-04-08',
            priority: 'Medium',
            status: 'Completed',
            completedAt: '2026-04-07T11:00:00',
          },
          {
            id: 'task3',
            title: 'Practice pH problems',
            subject: 'Chemistry',
            topic: 'Acids and Bases',
            deadline: '2026-04-09',
            priority: 'High',
            status: 'Completed',
            completedAt: '2026-04-08T12:00:00',
          },
          {
            id: 'task4',
            title: 'Revise Integration',
            subject: 'Mathematics',
            topic: 'Integration',
            deadline: '2026-04-11',
            priority: 'Low',
            status: 'Pending',
            completedAt: null,
          },
          {
            id: 'task5',
            title: 'Draw ray diagrams',
            subject: 'Physics',
            topic: 'Optics',
            deadline: '2026-04-12',
            priority: 'Medium',
            status: 'Completed',
            completedAt: '2026-04-09T13:00:00',
          },
          {
            id: 'task6',
            title: 'Organic Chemistry worksheet',
            subject: 'Chemistry',
            topic: 'Acids and Bases',
            deadline: '2026-04-13',
            priority: 'High',
            status: 'Completed',
            completedAt: '2026-04-10T14:00:00',
          },
          {
            id: 'task7',
            title: 'Solve integration problems',
            subject: 'Mathematics',
            topic: 'Integration',
            deadline: '2026-04-14',
            priority: 'Medium',
            status: 'Pending',
            completedAt: null,
          },
          {
            id: 'task8',
            title: 'Random revision',
            subject: 'Physics',
            topic: 'Optics',
            deadline: '2026-04-06',
            priority: 'Low',
            status: 'Completed',
            completedAt: '2026-04-06T16:00:00',
          },
          {
            id: 'task9',
            title: 'Quick quiz',
            subject: 'Mathematics',
            topic: 'Quadratic Equations',
            deadline: '2026-04-08',
            priority: 'High',
            status: 'Completed',
            completedAt: '2026-04-08T09:00:00',
          },
        ],
        revisions: [
          {
            id: 'rev1',
            topicId: 'top1',
            subjectId: 'subj1',
            topicName: 'Quadratic Equations',
            subjectName: 'Mathematics',
            revisionDate: '2026-04-06',
            status: 'completed',
          },
          {
            id: 'rev2',
            topicId: 'top2',
            subjectId: 'subj2',
            topicName: 'Newton’s Laws',
            subjectName: 'Physics',
            revisionDate: '2026-04-07',
            status: 'completed',
          },
          {
            id: 'rev3',
            topicId: 'top3',
            subjectId: 'subj3',
            topicName: 'Acids and Bases',
            subjectName: 'Chemistry',
            revisionDate: '2026-04-08',
            status: 'completed',
          },
          {
            id: 'rev4',
            topicId: 'top4',
            subjectId: 'subj1',
            topicName: 'Integration',
            subjectName: 'Mathematics',
            revisionDate: '2026-04-09',
            status: 'scheduled',
          },
          {
            id: 'rev5',
            topicId: 'top5',
            subjectId: 'subj2',
            topicName: 'Optics',
            subjectName: 'Physics',
            revisionDate: '2026-04-10',
            status: 'scheduled',
          },
          {
            id: 'rev6',
            topicId: 'top3',
            subjectId: 'subj3',
            topicName: 'Acids and Bases',
            subjectName: 'Chemistry',
            revisionDate: '2026-04-11',
            status: 'scheduled',
          },
          {
            id: 'rev7',
            topicId: 'top1',
            subjectId: 'subj1',
            topicName: 'Quadratic Equations',
            subjectName: 'Mathematics',
            revisionDate: '2026-04-12',
            status: 'scheduled',
          },
          {
            id: 'rev8',
            topicId: 'top2',
            subjectId: 'subj2',
            topicName: 'Newton’s Laws',
            subjectName: 'Physics',
            revisionDate: '2026-04-08',
            status: 'completed',
          },
          {
            id: 'rev9',
            topicId: 'top5',
            subjectId: 'subj2',
            topicName: 'Optics',
            subjectName: 'Physics',
            revisionDate: '2026-04-10',
            status: 'completed',
          },
          {
            id: 'rev10',
            topicId: 'top1',
            subjectId: 'subj1',
            topicName: 'Quadratic Equations',
            subjectName: 'Mathematics',
            revisionDate: '2026-04-09',
            status: 'completed',
          },
        ],
      };
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function StudyProvider({ children }) {
  const saved = loadInitial();
  const [subjects, setSubjects] = useState(saved?.subjects ?? []);
  const [topics, setTopics] = useState(saved?.topics ?? []);
  const [tasks, setTasks] = useState(saved?.tasks ?? []);
  const [revisions, setRevisions] = useState(saved?.revisions ?? []);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ subjects, topics, tasks, revisions })
    );
  }, [subjects, topics, tasks, revisions, hydrated]);

  const addSubject = useCallback((payload) => {
    const s = {
      id: generateId(),
      name: payload.name,
      description: payload.description ?? '',
      color: payload.color ?? '#d9468f',
    };
    setSubjects((prev) => [...prev, s]);
    return s;
  }, []);

  const updateSubject = useCallback((id, patch) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }, []);

  const deleteSubject = useCallback((id) => {
    setSubjects((prev) => {
      const victim = prev.find((s) => s.id === id);
      if (!victim) return prev;
      return prev.filter((s) => s.id !== id);
    });
    setTopics((top) => top.filter((t) => t.subjectId !== id));
    setRevisions((rev) => rev.filter((r) => r.subjectId !== id));
    setTasks((tlist) =>
      tlist.filter((task) => {
        const sub = subjects.find((s) => s.id === id);
        return !sub || task.subject !== sub.name;
      })
    );
  }, [subjects]);

  const addTopic = useCallback((payload) => {
    const t = {
      id: generateId(),
      subjectId: payload.subjectId,
      name: payload.name,
      difficulty: payload.difficulty ?? 'Medium',
      status: payload.status ?? 'Not Started',
      notes: payload.notes ?? '',
    };
    setTopics((prev) => [...prev, t]);
    return t;
  }, []);

  const updateTopic = useCallback(
    (id, patch) => {
      setTopics((prev) => {
        const current = prev.find((x) => x.id === id);
        const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
        const updated = next.find((x) => x.id === id);
        if (
          current &&
          updated &&
          patch.status === 'Completed' &&
          current.status !== 'Completed'
        ) {
          const sub = subjects.find((s) => s.id === updated.subjectId);
          setRevisions((rprev) => [
            ...rprev,
            {
              id: generateId(),
              topicId: updated.id,
              subjectId: updated.subjectId,
              topicName: updated.name,
              subjectName: sub?.name ?? '',
              revisionDate: defaultRevisionDate(),
              status: 'scheduled',
            },
          ]);
        }
        return next;
      });
    },
    [subjects]
  );

  const deleteTopic = useCallback((id) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
    setRevisions((prev) => prev.filter((r) => r.topicId !== id));
  }, []);

  const addTask = useCallback((payload) => {
    const task = {
      id: generateId(),
      title: payload.title,
      subject: payload.subject ?? '',
      topic: payload.topic ?? '',
      deadline: payload.deadline || null,
      priority: payload.priority ?? 'Medium',
      status: payload.status ?? 'Pending',
      completedAt: null,
    };
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback((id, patch) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        let completedAt = t.completedAt;
        if (patch.status === 'Completed' && t.status !== 'Completed') {
          completedAt = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
        }
        if (patch.status && patch.status !== 'Completed') {
          completedAt = null;
        }
        return { ...t, ...patch, completedAt };
      })
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addRevision = useCallback((payload) => {
    const r = {
      id: generateId(),
      topicId: payload.topicId ?? '',
      subjectId: payload.subjectId ?? '',
      topicName: payload.topicName ?? '',
      subjectName: payload.subjectName ?? '',
      revisionDate:
        payload.revisionDate || defaultRevisionDate(),
      status: payload.status ?? 'scheduled',
    };
    setRevisions((prev) => [...prev, r]);
    return r;
  }, []);

  const updateRevision = useCallback((id, patch) => {
    setRevisions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }, []);

  const deleteRevision = useCallback((id) => {
    setRevisions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      subjects,
      topics,
      tasks,
      revisions,
      addSubject,
      updateSubject,
      deleteSubject,
      addTopic,
      updateTopic,
      deleteTopic,
      addTask,
      updateTask,
      deleteTask,
      addRevision,
      updateRevision,
      deleteRevision,
    }),
    [
      subjects,
      topics,
      tasks,
      revisions,
      addSubject,
      updateSubject,
      deleteSubject,
      addTopic,
      updateTopic,
      deleteTopic,
      addTask,
      updateTask,
      deleteTask,
      addRevision,
      updateRevision,
      deleteRevision,
    ]
  );

  return (
    <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
  );
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) {
    throw new Error('useStudy must be used within StudyProvider');
  }
  return ctx;
}

