import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from "./context/AuthContext.jsx";

// After (correct)
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
