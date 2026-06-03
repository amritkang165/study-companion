import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('sc-theme') || 'theme-pink';
    } catch {
      return 'theme-pink';
    }
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.documentElement;
    el.classList.remove('theme-pink', 'theme-green', 'theme-blue', 'theme-yellow', 'theme-neon', 'theme-indigo');
    el.classList.add(theme);
    try {
      localStorage.setItem('sc-theme', theme);
    } catch {}
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
