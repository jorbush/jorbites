'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { HiMoon, HiSun } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';


const ThemeSelector: React.FC = () => {
  const [theme, setTheme] = useState<string>('light');
  const router = useRouter();
  const { t } = useTranslation();


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
    router.refresh()
  }, [theme]);

  return (
    <div className="flex items-center">
      <div className="flex-1">
        <p className="text-left">{theme === 'dark' ? t('light_theme') : t('dark_theme')}</p>
      </div>
      <div className="flex items-center">
        <button
          onClick={toggleTheme}
          className="relative inline-flex flex-shrink-0 h-6 w-11 rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-0 border border-gray-50"
        >
          <span className="sr-only">Toggle</span>
          <span
            className={`${
              theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
            } relative inline-block h-5 w-5 mt-[1.2px] ml-[1.2px] rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
          >
            <span
              className={`${
                theme === 'dark' ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'
              } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
              aria-hidden="true"
            >
              <HiSun className="h-3 w-3 text-gray-400" />
            </span>
            <span
              className={`${
                theme === 'dark' ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'
              } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
              aria-hidden="true"
            >
              <HiMoon className="h-3 w-3 text-gray-400" />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;
