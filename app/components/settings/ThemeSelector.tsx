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
        const newTheme =
            theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        const cachedTheme = localStorage.getItem('theme');
        if (cachedTheme) {
            setTheme(cachedTheme);
        }
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle(
            'dark',
            theme === 'dark'
        );
        router.refresh();
    }, [theme]);

    return (
        <div className="flex items-center">
            <div className="flex-1">
                <p className="text-left">
                    {theme === 'dark'
                        ? t('light_theme')
                        : t('dark_theme')}
                </p>
            </div>
            <div className="flex items-center">
                <button
                    onClick={toggleTheme}
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border border-gray-50 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-0"
                >
                    <span className="sr-only">Toggle</span>
                    <span
                        className={`${
                            theme === 'dark'
                                ? 'translate-x-5'
                                : 'translate-x-0'
                        } relative ml-[1.2px] mt-[1.2px] inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    >
                        <span
                            className={`${
                                theme === 'dark'
                                    ? 'opacity-0 duration-100 ease-out'
                                    : 'opacity-100 duration-200 ease-in'
                            } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                            aria-hidden="true"
                        >
                            <HiSun className="h-3 w-3 text-gray-400" />
                        </span>
                        <span
                            className={`${
                                theme === 'dark'
                                    ? 'opacity-100 duration-200 ease-in'
                                    : 'opacity-0 duration-100 ease-out'
                            } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
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
