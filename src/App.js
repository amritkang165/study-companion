import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PrivateRoute from "./components/PrivateRoute.jsx";
import { Layout } from './components/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Subjects } from './pages/Subjects.jsx';
import { Tasks } from './pages/Tasks.jsx';
import { Revision } from './pages/Revision.jsx';
import { AITools } from './pages/AITools.jsx';
import { StudyProvider } from './context/StudyContext.jsx';

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
            <Route path="subjects" element={<Subjects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="revision" element={<Revision />} />
            <Route path="ai-tools" element={<AITools />} />
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