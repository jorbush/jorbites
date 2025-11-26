'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';

const ThemeSelector: React.FC = () => {
    const [theme, setTheme] = useState<string>('light');
    const router = useRouter();
    const { t } = useTranslation();

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        router.refresh();
    };

    useEffect(() => {
        const cachedTheme = localStorage.getItem('theme');
        if (cachedTheme) {
            setTheme(cachedTheme);
            document.documentElement.classList.toggle(
                'dark',
                cachedTheme === 'dark'
            );
        }
    }, []);

    return (
        <div className="flex items-center">
            <div className="flex-1">
                <p className="text-left">{t('dark_theme')}</p>
            </div>
            <ToggleSwitch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                label=""
                dataCy="theme-toggle"
            />
        </div>
    );
};

export default ThemeSelector;
