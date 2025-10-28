import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NoInternetConnection from '@/app/components/utils/NoInternetConnection';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                connect_to_internet: 'Connect to the Internet',
                you_are_offline: "You're offline. Check your connection.",
                retry: 'Retry',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock useOnlineStatus hook
vi.mock('@/app/hooks/useOnlineStatus', () => ({
    default: vi.fn(),
}));

import useOnlineStatus from '@/app/hooks/useOnlineStatus';

describe('<NoInternetConnection />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete (window as { location?: unknown }).location;
        window.location = { reload: vi.fn() } as unknown as Location;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders nothing when online', () => {
        vi.mocked(useOnlineStatus).mockReturnValue(true);
        const { container } = render(<NoInternetConnection />);
        expect(container.firstChild).toBeNull();
    });

    it('renders the offline message when offline', () => {
        vi.mocked(useOnlineStatus).mockReturnValue(false);
        render(<NoInternetConnection />);
        expect(screen.getByText('Connect to the Internet')).toBeDefined();
        expect(
            screen.getByText("You're offline. Check your connection.")
        ).toBeDefined();
    });

    it('renders the retry button when offline', () => {
        vi.mocked(useOnlineStatus).mockReturnValue(false);
        const { container } = render(<NoInternetConnection />);
        const buttons = container.querySelectorAll('button');
        const hasRetryButton = Array.from(buttons).some(
            (button) => button.textContent === 'Retry'
        );
        expect(hasRetryButton).toBe(true);
    });

    it('renders "No Internet connection" text at bottom when offline', () => {
        vi.mocked(useOnlineStatus).mockReturnValue(false);
        const { container } = render(<NoInternetConnection />);
        const paragraphs = container.querySelectorAll('p');
        const hasNoInternetText = Array.from(paragraphs).some(
            (p) => p.textContent === 'No Internet connection'
        );
        expect(hasNoInternetText).toBe(true);
    });

    it('reloads the page when retry button is clicked', () => {
        vi.mocked(useOnlineStatus).mockReturnValue(false);
        const reloadSpy = vi.fn();
        window.location.reload = reloadSpy;

        const { container } = render(<NoInternetConnection />);
        const retryButtons = container.querySelectorAll('button');
        expect(retryButtons.length).toBeGreaterThan(0);
        fireEvent.click(retryButtons[0]);

        expect(reloadSpy).toHaveBeenCalled();
    });

    it('renders the astronaut illustration when offline', () => {
        vi.mocked(useOnlineStatus).mockReturnValue(false);
        const { container } = render(<NoInternetConnection />);
        const svg = container.querySelector('svg');
        expect(svg).toBeDefined();
    });

    it('applies correct classes for full-screen overlay', () => {
        vi.mocked(useOnlineStatus).mockReturnValue(false);
        const { container } = render(<NoInternetConnection />);
        const overlayElement = container.firstChild as HTMLElement;
        expect(overlayElement).toBeDefined();
        expect(overlayElement.className).toContain('fixed');
        expect(overlayElement.className).toContain('inset-0');
        expect(overlayElement.className).toContain('z-50');
    });
});
