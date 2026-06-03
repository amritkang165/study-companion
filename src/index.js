import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from './context/ThemeContext.jsx';

// After (correct)
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';

// Apply saved theme (fallback to pink) - moved to ThemeProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
