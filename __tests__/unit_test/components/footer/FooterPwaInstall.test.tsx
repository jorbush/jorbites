import React from 'react';
import {
    render,
    screen,
    fireEvent,
    cleanup,
    act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FooterPwaInstall from '@/app/components/footer/FooterPwaInstall';

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

describe('FooterPwaInstall', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the PWA install section container, title, badge, and description', () => {
        render(<FooterPwaInstall />);

        expect(screen.getByTestId('footer-pwa-install')).toBeDefined();
        expect(screen.getByText('footer_pwa_title')).toBeDefined();
        expect(screen.getByText('footer_pwa_badge')).toBeDefined();
        expect(screen.getByText('footer_pwa_description')).toBeDefined();
    });

    it('renders all three platform tabs', () => {
        render(<FooterPwaInstall />);

        expect(screen.getByTestId('pwa-tab-ios')).toBeDefined();
        expect(screen.getByTestId('pwa-tab-android')).toBeDefined();
        expect(screen.getByTestId('pwa-tab-desktop')).toBeDefined();
    });

    it('displays iOS installation steps when iOS tab is clicked', () => {
        render(<FooterPwaInstall />);

        const iosTab = screen.getByTestId('pwa-tab-ios');
        fireEvent.click(iosTab);

        expect(iosTab.getAttribute('aria-selected')).toBe('true');
        expect(screen.getByText('footer_pwa_ios_step1_title')).toBeDefined();
        expect(screen.getByText('footer_pwa_ios_step1_desc')).toBeDefined();
        expect(screen.getByText('footer_pwa_ios_step2_title')).toBeDefined();
        expect(screen.getByText('footer_pwa_ios_step2_desc')).toBeDefined();
        expect(screen.getByText('footer_pwa_ios_step3_title')).toBeDefined();
        expect(screen.getByText('footer_pwa_ios_step3_desc')).toBeDefined();
    });

    it('displays Android installation steps when Android tab is clicked', () => {
        render(<FooterPwaInstall />);

        const androidTab = screen.getByTestId('pwa-tab-android');
        fireEvent.click(androidTab);

        expect(androidTab.getAttribute('aria-selected')).toBe('true');
        expect(
            screen.getByText('footer_pwa_android_step1_title')
        ).toBeDefined();
        expect(screen.getByText('footer_pwa_android_step1_desc')).toBeDefined();
        expect(
            screen.getByText('footer_pwa_android_step2_title')
        ).toBeDefined();
        expect(screen.getByText('footer_pwa_android_step2_desc')).toBeDefined();
        expect(
            screen.getByText('footer_pwa_android_step3_title')
        ).toBeDefined();
        expect(screen.getByText('footer_pwa_android_step3_desc')).toBeDefined();
    });

    it('displays Desktop installation steps when Desktop tab is clicked', () => {
        render(<FooterPwaInstall />);

        const desktopTab = screen.getByTestId('pwa-tab-desktop');
        fireEvent.click(desktopTab);

        expect(desktopTab.getAttribute('aria-selected')).toBe('true');
        expect(
            screen.getByText('footer_pwa_desktop_step1_title')
        ).toBeDefined();
        expect(screen.getByText('footer_pwa_desktop_step1_desc')).toBeDefined();
        expect(
            screen.getByText('footer_pwa_desktop_step2_title')
        ).toBeDefined();
        expect(screen.getByText('footer_pwa_desktop_step2_desc')).toBeDefined();
        expect(
            screen.getByText('footer_pwa_desktop_step3_title')
        ).toBeDefined();
        expect(screen.getByText('footer_pwa_desktop_step3_desc')).toBeDefined();
    });

    it('renders the 3 PWA benefit badges', () => {
        render(<FooterPwaInstall />);

        expect(screen.getByText('footer_pwa_benefit_standalone')).toBeDefined();
        expect(screen.getByText('footer_pwa_benefit_offline')).toBeDefined();
        expect(
            screen.getByText('footer_pwa_benefit_notifications')
        ).toBeDefined();
    });

    it('toggles collapse and expand when toggle button is clicked', () => {
        render(<FooterPwaInstall />);

        // Initially expanded
        expect(screen.getByTestId('pwa-steps-container')).toBeDefined();

        const toggleButton = screen.getByTestId('pwa-toggle-button');
        fireEvent.click(toggleButton);

        // Now collapsed
        expect(screen.queryByTestId('pwa-steps-container')).toBeNull();

        // Click again to re-expand
        fireEvent.click(toggleButton);
        expect(screen.getByTestId('pwa-steps-container')).toBeDefined();
    });

    it('handles beforeinstallprompt event and triggers prompt on install button click', async () => {
        render(<FooterPwaInstall />);

        const mockPrompt = vi.fn().mockResolvedValue(undefined);
        const promptEvent = new Event('beforeinstallprompt') as any;
        promptEvent.prompt = mockPrompt;
        promptEvent.userChoice = Promise.resolve({
            outcome: 'accepted',
            platform: 'web',
        });

        act(() => {
            window.dispatchEvent(promptEvent);
        });

        const installButton = await screen.findByTestId('pwa-install-button');
        expect(installButton).toBeDefined();

        await act(async () => {
            fireEvent.click(installButton);
        });

        expect(mockPrompt).toHaveBeenCalled();
        expect(screen.getByTestId('pwa-installed-badge')).toBeDefined();
    });

    it('displays installed badge when appinstalled event fires', async () => {
        render(<FooterPwaInstall />);

        act(() => {
            window.dispatchEvent(new Event('appinstalled'));
        });

        const badge = await screen.findByTestId('pwa-installed-badge');
        expect(badge).toBeDefined();
    });
});
