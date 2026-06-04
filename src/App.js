import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PrivateRoute from "./components/PrivateRoute.jsx";
import { Layout } from './components/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { SubjectsTasks } from './pages/SubjectsTasks.jsx';
import { AITools } from './pages/AITools.jsx';
import { StudyProvider } from './context/StudyContext.jsx';
import Pomodoro from './pages/Pomodoro.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

import Login from "./pages/Login.jsx"; // 👉 you will create this

function App() {
  return (
    <StudyProvider>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC ROUTE */}
          <Route path="/login" element={<Login />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="subjects-tasks" element={<SubjectsTasks />} />
            <Route path="pomodoro" element={<Pomodoro />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="study-buddy" element={<AITools />} />
            <Route path="ai-tools" element={<Navigate to="/study-buddy" replace />} />
            <Route path="subjects" element={<Navigate to="/subjects-tasks" replace />} />
            <Route path="tasks" element={<Navigate to="/subjects-tasks" replace />} />
          </Route>

          {/* FALLBACK */}
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