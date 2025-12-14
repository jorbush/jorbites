import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import VoluntarySupportToggle from '@/app/components/settings/VoluntarySupportToggle';
import toast from 'react-hot-toast';

// Mock the AdProvider
vi.mock('@/app/providers/AdProvider', () => ({
    useAds: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
    },
}));

// Mock the react-i18next module
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(),
}));

import { useAds } from '@/app/providers/AdProvider';
import { useTranslation } from 'react-i18next';

describe('<VoluntarySupportToggle />', () => {
    const mockSetShowAds = vi.fn();
    const mockTranslate = vi.fn((key) => key);

    beforeEach(() => {
        vi.clearAllMocks();
        (useAds as any).mockReturnValue({
            showAds: false,
            setShowAds: mockSetShowAds,
        });
        (useTranslation as any).mockReturnValue({
            t: mockTranslate,
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders correctly with ads disabled', () => {
        render(<VoluntarySupportToggle />);

        expect(screen.getByText('enable_ads_support')).toBeDefined();
        expect(screen.getByText('enable_ads_support_description')).toBeDefined();
        expect(screen.getByRole('switch')).toBeDefined();
    });

    it('renders correctly with ads enabled', () => {
        (useAds as any).mockReturnValue({
            showAds: true,
            setShowAds: mockSetShowAds,
        });

        render(<VoluntarySupportToggle />);

        const switchControl = screen.getByRole('switch');
        expect(switchControl.getAttribute('aria-checked')).toBe('true');
    });

    it('toggles ads when switch is clicked', async () => {
        render(<VoluntarySupportToggle />);

        const switchControl = screen.getByRole('switch');

        await act(async () => {
            fireEvent.click(switchControl);
        });

        expect(mockSetShowAds).toHaveBeenCalledWith(true);
    });

    it('shows thank you toast when enabling ads', async () => {
        render(<VoluntarySupportToggle />);

        const switchControl = screen.getByRole('switch');

        await act(async () => {
            fireEvent.click(switchControl);
        });

        expect(toast.success).toHaveBeenCalledWith(
            'thank_you_for_support',
            expect.objectContaining({ duration: 3000 })
        );
    });

    it('does not show toast when disabling ads', async () => {
        (useAds as any).mockReturnValue({
            showAds: true,
            setShowAds: mockSetShowAds,
        });

        render(<VoluntarySupportToggle />);

        const switchControl = screen.getByRole('switch');

        await act(async () => {
            fireEvent.click(switchControl);
        });

        expect(mockSetShowAds).toHaveBeenCalledWith(false);
        expect(toast.success).not.toHaveBeenCalled();
    });

    it('uses translation keys', () => {
        render(<VoluntarySupportToggle />);

        expect(mockTranslate).toHaveBeenCalledWith('enable_ads_support');
        expect(mockTranslate).toHaveBeenCalledWith(
            'enable_ads_support_description'
        );
    });
});
