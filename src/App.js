import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StudyProvider } from './context/StudyContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Subjects } from './pages/Subjects';
import { Tasks } from './pages/Tasks';
import { Revision } from './pages/Revision';
import { AITools } from './pages/AITools';

function App() {
  return (
    <StudyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="revision" element={<Revision />} />
            <Route path="ai-tools" element={<AITools />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          theme="dark"
          closeOnClick
          pauseOnHover
        />
      </BrowserRouter>
    </StudyProvider>
  );
}

export default App;
