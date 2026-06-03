// filepath: /Users/amritkang/Desktop/projects/studyCompanion/study-companion/src/pages/Pomodoro.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FullscreenPomodoro from '../components/FullscreenPomodoro.jsx';

export default function Pomodoro() {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Render fullscreen pomodoro when user navigates to /pomodoro. Closing returns to dashboard. */}
      <FullscreenPomodoro onClose={() => navigate('/dashboard')} />
    </div>
  );
}
