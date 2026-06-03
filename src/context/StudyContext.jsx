import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { generateId, defaultRevisionDate } from '../utils/helpers';

const STORAGE_KEY = 'study-companion-v1';

const StudyContext = createContext(null);

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        subjects: [],
        topics: [],
        tasks: [],
        revisions: [],
      };
    }
    return JSON.parse(raw);
  } catch {
    return { subjects: [], topics: [], tasks: [], revisions: [] };
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
    // mark hydrated after initial render so autosave doesn't overwrite with initial empty state
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ subjects, topics, tasks, revisions })
      );
    } catch {
      // ignore storage errors
    }
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
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const deleteSubject = useCallback((id) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTopics((prev) => prev.filter((t) => t.subjectId !== id));
    setRevisions((prev) => prev.filter((r) => r.subjectId !== id));

    // Remove subject name from tasks where it matched
    setTasks((prevTasks) => prevTasks.filter((t) => t.subject !== (subjects.find((s) => s.id === id)?.name ?? '')));
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

  const updateTopic = useCallback((id, patch) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTopic = useCallback((id) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
    setRevisions((prev) => prev.filter((r) => r.topicId !== id));
    // Remove topic name from tasks if it matched the deleted topic
    setTasks((prev) => prev.map((task) => {
      const match = topics.find((t) => t.id === id)?.name ?? '';
      return task.topic === match ? { ...task, topic: '' } : task;
    }));
  }, [topics]);

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
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const merged = { ...t, ...patch };
      // manage completedAt timestamp
      if (merged.status === 'Completed' && !t.completedAt) {
        merged.completedAt = new Date().toISOString();
      }
      if (merged.status !== 'Completed' && t.completedAt) {
        merged.completedAt = null;
      }
      return merged;
    }));
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
      revisionDate: payload.revisionDate || defaultRevisionDate(),
      status: payload.status ?? 'scheduled',
    };
    setRevisions((prev) => [...prev, r]);
    return r;
  }, []);

  const updateRevision = useCallback((id, patch) => {
    setRevisions((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const deleteRevision = useCallback((id) => {
    setRevisions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const value = useMemo(() => ({
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
  }), [
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
  ]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) {
    throw new Error('useStudy must be used within StudyProvider');
  }
  return ctx;
}

