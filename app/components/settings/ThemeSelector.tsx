'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';

let listeners: (() => void)[] = [];
const themeStore = {
    subscribe(callback: () => void) {
        listeners.push(callback);
        return () => {
            listeners = listeners.filter((l) => l !== callback);
        };
    },
    getSnapshot() {
        if (typeof window === 'undefined') return 'light';
        return localStorage.getItem('theme') || 'light';
    },
    getServerSnapshot() {
        return 'light';
    },
    setTheme(newTheme: string) {
        localStorage.setItem('theme', newTheme);
        listeners.forEach((l) => l());
    },
};

const ThemeSelector: React.FC = () => {
    const theme = useSyncExternalStore(
        themeStore.subscribe,
        themeStore.getSnapshot,
        themeStore.getServerSnapshot
    );
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        themeStore.setTheme(newTheme);
        refresh();
    };

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

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
