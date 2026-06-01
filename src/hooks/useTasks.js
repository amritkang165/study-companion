import { useStudy } from '../context/StudyContext.jsx';

export function useTasks() {
  const { tasks, addTask, updateTask, deleteTask } = useStudy();
  return { tasks, addTask, updateTask, deleteTask };
}
