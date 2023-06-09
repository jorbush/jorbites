'use client';

import React, { useEffect, useState } from 'react';

const ThemeSelector: React.FC = () => {
  const [theme, setTheme] = useState<string>('claro');

  const toggleTheme = () => {
    const newTheme = theme === 'claro' ? 'oscuro' : 'claro';
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
    document.documentElement.classList.toggle('dark', theme === 'oscuro');
  }, [theme]);

  return (
    <button onClick={toggleTheme}>
      Cambiar a {theme === 'claro' ? 'oscuro' : 'claro'}
    </button>
  );
};

export default ThemeSelector;
