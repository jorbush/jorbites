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

        // Update theme-color meta tags with media queries
        const lightThemeMeta = document.querySelector(
            'meta[name="theme-color"][media="(prefers-color-scheme: light)"]'
        );
        const darkThemeMeta = document.querySelector(
            'meta[name="theme-color"][media="(prefers-color-scheme: dark)"]'
        );

        if (lightThemeMeta && darkThemeMeta) {
            // When user manually selects a theme, override both media query variants
            lightThemeMeta.setAttribute(
                'content',
                isDark ? '#0F0F0F' : '#ffffff'
            );
            darkThemeMeta.setAttribute(
                'content',
                isDark ? '#0F0F0F' : '#ffffff'
            );
        } else {
            // Fallback: update or create single theme-color meta
            let themeColorMeta = document.querySelector(
                'meta[name="theme-color"]:not([media])'
            );

            if (!themeColorMeta) {
                themeColorMeta = document.createElement('meta');
                themeColorMeta.setAttribute('name', 'theme-color');
                document.head.appendChild(themeColorMeta);
            }

            themeColorMeta.setAttribute(
                'content',
                isDark ? '#0F0F0F' : '#ffffff'
            );
        }
    };
};

export default useTheme;
