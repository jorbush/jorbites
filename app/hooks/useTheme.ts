import { useEffect } from 'react';

const useTheme = () => {
    useEffect(() => {
        const cachedTheme = localStorage.getItem('theme');
        if (cachedTheme) {
            document.documentElement.classList.toggle(
                'dark',
                cachedTheme === 'dark'
            );

            updateStatusBarStyle(cachedTheme === 'dark');
        }
        const themeChangedListener = (e: Event) => {
            const isDark = (e as CustomEvent).detail.isDark;
            updateStatusBarStyle(isDark);
        };
        document.addEventListener('themeChanged', themeChangedListener);
        return () => {
            document.removeEventListener('themeChanged', themeChangedListener);
        };
    }, []);

    const updateStatusBarStyle = (isDark: boolean) => {
        let statusBarMeta = document.querySelector(
            'meta[name="apple-mobile-web-app-status-bar-style"]'
        );

        if (!statusBarMeta) {
            statusBarMeta = document.createElement('meta');
            statusBarMeta.setAttribute(
                'name',
                'apple-mobile-web-app-status-bar-style'
            );
            document.head.appendChild(statusBarMeta);
        }
        statusBarMeta.setAttribute(
            'content',
            isDark ? 'black-translucent' : 'default'
        );

        const existingThemeTags = document.querySelectorAll(
            'meta[name="theme-color"]'
        );
        existingThemeTags.forEach((tag) => tag.remove());
        const themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        themeColorMeta.setAttribute('content', isDark ? '#0F0F0F' : '#ffffff');
        document.head.appendChild(themeColorMeta);
    };
};

export default useTheme;
