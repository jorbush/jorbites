import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProfilePreferencesForm from '@/app/components/settings/ProfilePreferencesForm';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh,
        push: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => key || fallback,
        i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    }),
}));

vi.mock('axios');
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ProfilePreferencesForm', () => {
    const mockUser: SafeUser = {
        id: 'user-1',
        name: 'Test Chef',
        email: 'test@example.com',
        profilePreferences: {
            showStats: true,
            showActivityGraph: true,
            showArticles: true,
        },
    } as SafeUser;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders null when currentUser is null', () => {
        const { container } = render(
            <ProfilePreferencesForm currentUser={null} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders all three profile display preference options with default checked values', () => {
        render(<ProfilePreferencesForm currentUser={mockUser} />);

        expect(screen.getByTestId('profile-preferences-form')).toBeDefined();
        expect(
            screen.getByTestId('profile-preference-row-showStats')
        ).toBeDefined();
        expect(
            screen.getByTestId('profile-preference-row-showActivityGraph')
        ).toBeDefined();
        expect(
            screen.getByTestId('profile-preference-row-showArticles')
        ).toBeDefined();

        const statsToggle = screen.getByTestId('pref-toggle-showStats');
        const activityToggle = screen.getByTestId(
            'pref-toggle-showActivityGraph'
        );
        const articlesToggle = screen.getByTestId('pref-toggle-showArticles');

        expect(statsToggle.getAttribute('aria-checked')).toBe('true');
        expect(activityToggle.getAttribute('aria-checked')).toBe('true');
        expect(articlesToggle.getAttribute('aria-checked')).toBe('true');
    });

    it('renders existing saved false preferences correctly', () => {
        const userWithCustomPrefs: SafeUser = {
            ...mockUser,
            profilePreferences: {
                showStats: false,
                showActivityGraph: false,
                showArticles: true,
            },
        };

        render(<ProfilePreferencesForm currentUser={userWithCustomPrefs} />);

        const statsToggle = screen.getByTestId('pref-toggle-showStats');
        const activityToggle = screen.getByTestId(
            'pref-toggle-showActivityGraph'
        );
        const articlesToggle = screen.getByTestId('pref-toggle-showArticles');

        expect(statsToggle.getAttribute('aria-checked')).toBe('false');
        expect(activityToggle.getAttribute('aria-checked')).toBe('false');
        expect(articlesToggle.getAttribute('aria-checked')).toBe('true');
    });

    it('toggles a preference switch and calls PATCH /api/profilePreferences', async () => {
        (axios.patch as any).mockResolvedValueOnce({
            data: {
                showStats: false,
                showActivityGraph: true,
                showArticles: true,
            },
        });

        render(<ProfilePreferencesForm currentUser={mockUser} />);

        const statsToggle = screen.getByTestId('pref-toggle-showStats');
        fireEvent.click(statsToggle);

        await waitFor(() => {
            expect(axios.patch).toHaveBeenCalledWith(
                '/api/profilePreferences',
                {
                    showStats: false,
                }
            );
            expect(toast.success).toHaveBeenCalledWith(
                'profile_preferences_updated'
            );
            expect(mockRefresh).toHaveBeenCalled();
        });
    });

    it('shows error toast when toggle update fails', async () => {
        (axios.patch as any).mockRejectedValueOnce(new Error('Network error'));

        render(<ProfilePreferencesForm currentUser={mockUser} />);

        const articlesToggle = screen.getByTestId('pref-toggle-showArticles');
        fireEvent.click(articlesToggle);

        await waitFor(() => {
            expect(axios.patch).toHaveBeenCalledWith(
                '/api/profilePreferences',
                {
                    showArticles: false,
                }
            );
            expect(toast.error).toHaveBeenCalledWith('something_went_wrong');
        });
    });
});
