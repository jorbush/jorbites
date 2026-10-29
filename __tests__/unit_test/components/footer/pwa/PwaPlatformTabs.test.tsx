import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PwaPlatformTabs from '@/app/components/footer/pwa/PwaPlatformTabs';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('PwaPlatformTabs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the tablist container and all 3 platform tabs', () => {
        render(
            <PwaPlatformTabs
                platform="ios"
                onSelectPlatform={vi.fn()}
            />
        );

        expect(screen.getByRole('tablist')).toBeDefined();
        expect(screen.getByTestId('pwa-tab-ios')).toBeDefined();
        expect(screen.getByTestId('pwa-tab-android')).toBeDefined();
        expect(screen.getByTestId('pwa-tab-desktop')).toBeDefined();
    });

    it('marks the active platform as aria-selected="true"', () => {
        render(
            <PwaPlatformTabs
                platform="android"
                onSelectPlatform={vi.fn()}
            />
        );

        const androidTab = screen.getByTestId('pwa-tab-android');
        const iosTab = screen.getByTestId('pwa-tab-ios');
        const desktopTab = screen.getByTestId('pwa-tab-desktop');

        expect(androidTab.getAttribute('aria-selected')).toBe('true');
        expect(iosTab.getAttribute('aria-selected')).toBe('false');
        expect(desktopTab.getAttribute('aria-selected')).toBe('false');
    });

    it('calls onSelectPlatform when another platform tab is clicked', () => {
        const onSelectPlatform = vi.fn();
        render(
            <PwaPlatformTabs
                platform="ios"
                onSelectPlatform={onSelectPlatform}
            />
        );

        fireEvent.click(screen.getByTestId('pwa-tab-desktop'));
        expect(onSelectPlatform).toHaveBeenCalledWith('desktop');

        fireEvent.click(screen.getByTestId('pwa-tab-android'));
        expect(onSelectPlatform).toHaveBeenCalledWith('android');
    });
});
