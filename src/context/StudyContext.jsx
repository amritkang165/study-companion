import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { generateId, defaultRevisionDate } from '../utils/helpers';

const STORAGE_KEY = 'study-companion-v1';
const StudyContext = createContext(null);

export function StudyProvider({ children }) {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount / user change
  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setTopics([]);
      setTasks([]);
      setRevisions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);

      // Fetch all user data from Supabase
      const [subRes, topicRes, taskRes, revRes] = await Promise.all([
        supabase.from('subjects').select('*').eq('user_id', user.id),
        supabase.from('topics').select('*').eq('user_id', user.id),
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('revisions').select('*').eq('user_id', user.id),
      ]);

      if (cancelled) return;

      const hasServerData = (subRes.data?.length || 0) > 0;

      // Check localStorage for data to migrate
      let localData = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) localData = JSON.parse(raw);
      } catch {}

      if (hasServerData) {
        setSubjects(subRes.data ?? []);
        setTopics(topicRes.data ?? []);
        setTasks(taskRes.data ?? []);
        setRevisions(revRes.data ?? []);
        if (localData) localStorage.removeItem(STORAGE_KEY);
      } else if (localData) {
        // Migrate localStorage → Supabase
        const { subjects: ls, topics: lt, tasks: ltask, revisions: lr } = localData;

        const ops = [];
        if (ls?.length) ops.push(supabase.from('subjects').insert(ls.map((s) => ({ ...s, user_id: user.id }))).select());
        if (lt?.length) ops.push(supabase.from('topics').insert(lt.map((t) => ({ ...t, user_id: user.id }))).select());
        if (ltask?.length) ops.push(supabase.from('tasks').insert(ltask.map((t) => ({ ...t, user_id: user.id }))).select());
        if (lr?.length) ops.push(supabase.from('revisions').insert(lr.map((r) => ({ ...r, user_id: user.id }))).select());

        const results = await Promise.all(ops);
        if (!cancelled) {
          results.forEach((res) => {
            if (res.error) console.warn('Migration error:', res.error);
          });
          setSubjects(results[0]?.data ?? ls ?? []);
          setTopics(results[1]?.data ?? lt ?? []);
          setTasks(results[2]?.data ?? ltask ?? []);
          setRevisions(results[3]?.data ?? lr ?? []);
        }
        localStorage.removeItem(STORAGE_KEY);
      }

      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const addSubject = useCallback(async (payload) => {
    const s = {
      id: generateId(),
      name: payload.name,
      description: payload.description ?? '',
      color: payload.color ?? '#e8505b',
    };
    setSubjects((prev) => [...prev, s]);
    const { error } = await supabase.from('subjects').insert({ ...s, user_id: user.id });
    if (error) { setSubjects((prev) => prev.filter((x) => x.id !== s.id)); console.warn(error); }
    return s;
  }, [user?.id]);

  const updateSubject = useCallback(async (id, patch) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    const { error } = await supabase.from('subjects').update(patch).eq('id', id);
    if (error) console.warn(error);
  }, []);

  const deleteSubject = useCallback(async (id) => {
    const prev = subjects;
    const sub = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTopics((prev) => prev.filter((t) => t.subjectId !== id));
    setRevisions((prev) => prev.filter((r) => r.subjectId !== id));
    setTasks((prevTasks) => prevTasks.filter((t) => t.subject !== (sub?.name ?? '')));
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) { setSubjects(prev); console.warn(error); }
  }, [subjects]);

  const addTopic = useCallback(async (payload) => {
    const t = {
      id: generateId(),
      subjectId: payload.subjectId,
      name: payload.name,
      difficulty: payload.difficulty ?? 'Medium',
      status: payload.status ?? 'Not Started',
      notes: payload.notes ?? '',
    };
    setTopics((prev) => [...prev, t]);
    const { error } = await supabase.from('topics').insert({ ...t, user_id: user.id });
    if (error) { setTopics((prev) => prev.filter((x) => x.id !== t.id)); console.warn(error); }
    return t;
  }, [user?.id]);

  const updateTopic = useCallback(async (id, patch) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const { error } = await supabase.from('topics').update(patch).eq('id', id);
    if (error) console.warn(error);
  }, []);

  const deleteTopic = useCallback(async (id) => {
    const prev = topics;
    const match = topics.find((t) => t.id === id)?.name ?? '';
    setTopics((prev) => prev.filter((t) => t.id !== id));
    setRevisions((prev) => prev.filter((r) => r.topicId !== id));
    setTasks((prev) => prev.map((task) => (task.topic === match ? { ...task, topic: '' } : task)));
    const { error } = await supabase.from('topics').delete().eq('id', id);
    if (error) { setTopics(prev); console.warn(error); }
  }, [topics]);

  const addTask = useCallback(async (payload) => {
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
    const { error } = await supabase.from('tasks').insert({ ...task, user_id: user.id });
    if (error) { setTasks((prev) => prev.filter((x) => x.id !== task.id)); console.warn(error); }
    return task;
  }, [user?.id]);

  const updateTask = useCallback(async (id, patch) => {
    let updated = null;
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const merged = { ...t, ...patch };
      if (merged.status === 'Completed' && !t.completedAt) merged.completedAt = new Date().toISOString();
      if (merged.status !== 'Completed' && t.completedAt) merged.completedAt = null;
      updated = merged;
      return merged;
    }));
    const { error } = await supabase.from('tasks').update(updated ?? patch).eq('id', id);
    if (error) console.warn(error);
  }, []);

  const deleteTask = useCallback(async (id) => {
    const prev = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { setTasks(prev); console.warn(error); }
  }, [tasks]);

  const addRevision = useCallback(async (payload) => {
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
    const { error } = await supabase.from('revisions').insert({ ...r, user_id: user.id });
    if (error) { setRevisions((prev) => prev.filter((x) => x.id !== r.id)); console.warn(error); }
    return r;
  }, [user?.id]);

  const updateRevision = useCallback(async (id, patch) => {
    setRevisions((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const { error } = await supabase.from('revisions').update(patch).eq('id', id);
    if (error) console.warn(error);
  }, []);

  const deleteRevision = useCallback(async (id) => {
    const prev = revisions;
    setRevisions((prev) => prev.filter((r) => r.id !== id));
    const { error } = await supabase.from('revisions').delete().eq('id', id);
    if (error) { setRevisions(prev); console.warn(error); }
  }, [revisions]);

  const value = useMemo(() => ({
    subjects, topics, tasks, revisions, loading,
    addSubject, updateSubject, deleteSubject,
    addTopic, updateTopic, deleteTopic,
    addTask, updateTask, deleteTask,
    addRevision, updateRevision, deleteRevision,
  }), [
    subjects, topics, tasks, revisions, loading,
    addSubject, updateSubject, deleteSubject,
    addTopic, updateTopic, deleteTopic,
    addTask, updateTask, deleteTask,
    addRevision, updateRevision, deleteRevision,
  ]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
}

