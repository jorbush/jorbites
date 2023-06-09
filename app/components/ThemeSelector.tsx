'use client';

import React, { useEffect, useState } from 'react';
import useTheme from '../hooks/useTheme';

const ThemeSelector: React.FC = () => {
  const [theme, setTheme] = useState<string>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Almacena la preferencia del usuario en caché
  };

  useEffect(() => {
    const cachedTheme = localStorage.getItem('theme');
    if (cachedTheme) {
      setTheme(cachedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <button onClick={toggleTheme}>
      Cambiar a {theme === 'light' ? 'dark' : 'light'}
    </button>
  );
};

export default ThemeSelector;
