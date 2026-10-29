import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PwaHeader from '@/app/components/footer/pwa/PwaHeader';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock next/image
vi.mock('next/image', () => ({
    default: ({ alt, ...props }: any) => (
        <img
            alt={alt}
            {...props}
        />
    ),
}));

describe('PwaHeader', () => {
    const defaultProps = {
        isInstalled: false,
        hasDeferredPrompt: false,
        isExpanded: false,
        onInstall: vi.fn(),
        onToggle: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders logo, title, and description', () => {
        render(<PwaHeader {...defaultProps} />);

        expect(screen.getByAltText('Jorbites')).toBeDefined();
        expect(screen.getByText('footer_pwa_title')).toBeDefined();
        expect(screen.getByText('footer_pwa_description')).toBeDefined();
        // Verifies no PWA badge
        expect(screen.queryByText('footer_pwa_badge')).toBeNull();
    });

    it('renders collapsed state correctly with show label', () => {
        render(
            <PwaHeader
                {...defaultProps}
                isExpanded={false}
            />
        );

        const toggleButton = screen.getByTestId('pwa-toggle-button');
        expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
        expect(screen.getByText('footer_pwa_toggle_show')).toBeDefined();
    });

    it('renders expanded state correctly with hide label', () => {
        render(
            <PwaHeader
                {...defaultProps}
                isExpanded={true}
            />
        );

        const toggleButton = screen.getByTestId('pwa-toggle-button');
        expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByText('footer_pwa_toggle_hide')).toBeDefined();
    });

    it('calls onToggle when toggle button is clicked', () => {
        const onToggle = vi.fn();
        render(
            <PwaHeader
                {...defaultProps}
                onToggle={onToggle}
            />
        );

        fireEvent.click(screen.getByTestId('pwa-toggle-button'));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('renders installed badge when isInstalled is true and hides install button', () => {
        render(
            <PwaHeader
                {...defaultProps}
                isInstalled={true}
                hasDeferredPrompt={true}
            />
        );

        expect(screen.getByTestId('pwa-installed-badge')).toBeDefined();
        expect(screen.getByText('footer_pwa_btn_installed')).toBeDefined();
        expect(screen.queryByTestId('pwa-install-button')).toBeNull();
    });

    it('renders install button when hasDeferredPrompt is true and not installed', () => {
        const onInstall = vi.fn();
        render(
            <PwaHeader
                {...defaultProps}
                isInstalled={false}
                hasDeferredPrompt={true}
                onInstall={onInstall}
            />
        );

        const installBtn = screen.getByTestId('pwa-install-button');
        expect(installBtn).toBeDefined();
        expect(screen.getByText('footer_pwa_btn_install')).toBeDefined();

        fireEvent.click(installBtn);
        expect(onInstall).toHaveBeenCalledTimes(1);
    });
});
