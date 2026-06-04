import React, { createContext, useContext, useEffect, useState } from 'react';

const DarkModeContext = createContext(null);

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('sc-dark-mode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sc-dark-mode', dark);
  }, [dark]);

  return (
    <DarkModeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode must be used within DarkModeProvider');
  return ctx;
}
