import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useTheme from '@/app/hooks/useTheme';

describe('useTheme', () => {
    beforeEach(() => {
        // Clear DOM head meta tags
        const metaTags = document.querySelectorAll(
            'meta[name="apple-mobile-web-app-status-bar-style"], meta[name="theme-color"]'
        );
        metaTags.forEach((tag) => tag.remove());

        // Reset document element classes
        document.documentElement.className = '';

        // Clear localStorage
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize status bar and theme-color meta tags using system default (light mode)', () => {
        // Mock default system/document mode as light
        document.documentElement.classList.remove('dark');

        renderHook(() => useTheme());

        const statusBarMeta = document.querySelector(
            'meta[name="apple-mobile-web-app-status-bar-style"]'
        );
        const themeColorMeta = document.querySelector(
            'meta[name="theme-color"]'
        );

        expect(statusBarMeta).not.toBeNull();
        expect(statusBarMeta?.getAttribute('content')).toBe(
            'black-translucent'
        );

        expect(themeColorMeta).not.toBeNull();
        expect(themeColorMeta?.getAttribute('content')).toBe('#ffffff');
    });

    it('should initialize status bar and theme-color meta tags using system default (dark mode)', () => {
        // Mock default system/document mode as dark
        document.documentElement.classList.add('dark');

        renderHook(() => useTheme());

        const statusBarMeta = document.querySelector(
            'meta[name="apple-mobile-web-app-status-bar-style"]'
        );
        const themeColorMeta = document.querySelector(
            'meta[name="theme-color"]'
        );

        expect(statusBarMeta).not.toBeNull();
        expect(statusBarMeta?.getAttribute('content')).toBe(
            'black-translucent'
        );

        expect(themeColorMeta).not.toBeNull();
        expect(themeColorMeta?.getAttribute('content')).toBe('#0F0F0F');
    });

    it('should respect cachedTheme light mode from localStorage', () => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.add('dark'); // Mock opposite starting state

        renderHook(() => useTheme());

        expect(document.documentElement.classList.contains('dark')).toBe(false);

        const statusBarMeta = document.querySelector(
            'meta[name="apple-mobile-web-app-status-bar-style"]'
        );
        const themeColorMeta = document.querySelector(
            'meta[name="theme-color"]'
        );

        expect(statusBarMeta?.getAttribute('content')).toBe(
            'black-translucent'
        );
        expect(themeColorMeta?.getAttribute('content')).toBe('#ffffff');
    });

    it('should respect cachedTheme dark mode from localStorage', () => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.remove('dark'); // Mock opposite starting state

        renderHook(() => useTheme());

        expect(document.documentElement.classList.contains('dark')).toBe(true);

        const statusBarMeta = document.querySelector(
            'meta[name="apple-mobile-web-app-status-bar-style"]'
        );
        const themeColorMeta = document.querySelector(
            'meta[name="theme-color"]'
        );

        expect(statusBarMeta?.getAttribute('content')).toBe(
            'black-translucent'
        );
        expect(themeColorMeta?.getAttribute('content')).toBe('#0F0F0F');
    });

    it('should listen to themeChanged event and update styling accordingly', () => {
        renderHook(() => useTheme());

        // Emit custom event for dark mode
        const event = new CustomEvent('themeChanged', {
            detail: { isDark: true },
        });
        document.dispatchEvent(event);

        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        expect(themeColorMeta?.getAttribute('content')).toBe('#0F0F0F');

        // Emit another custom event for light mode
        const eventLight = new CustomEvent('themeChanged', {
            detail: { isDark: false },
        });
        document.dispatchEvent(eventLight);

        themeColorMeta = document.querySelector('meta[name="theme-color"]');
        expect(themeColorMeta?.getAttribute('content')).toBe('#ffffff');
    });
});
