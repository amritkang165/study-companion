import { useStudy } from '../context/StudyContext.jsx';

export function useSubjects() {
  const {
    subjects,
    topics,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
  } = useStudy();
  return {
    subjects,
    topics,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
  };
}
