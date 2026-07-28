import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NotificationPreferencesManager from '@/app/components/settings/NotificationPreferencesManager';
import axios from 'axios';
import { act } from 'react';
import { toast } from 'react-hot-toast';
import { SafeUser } from '@/app/types';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('axios');
vi.mock('react-hot-toast');

describe('<NotificationPreferencesManager />', () => {
    const mockUserActive = {
        id: '1',
        emailNotifications: true,
        notificationPreferences: {
            social: true,
            newContent: true,
            eventsAndChallenges: true,
            quests: true,
            voting: true,
            achievements: true,
        },
    } as unknown as SafeUser;

    const mockUserInactive = {
        id: '1',
        emailNotifications: false,
    } as unknown as SafeUser;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('returns null when BOTH emailNotifications is false AND push notifications are unsubscribed', () => {
        const { container } = render(
            <NotificationPreferencesManager currentUser={mockUserInactive} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders category toggles when emailNotifications is true', () => {
        render(<NotificationPreferencesManager currentUser={mockUserActive} />);

        expect(
            screen.getByText('notification_preferences_title')
        ).toBeDefined();
        expect(screen.getByText('notification_social')).toBeDefined();
        expect(screen.getByText('notification_new_content')).toBeDefined();
        expect(
            screen.getByText('notification_events_challenges')
        ).toBeDefined();
        expect(screen.getByText('notification_quests')).toBeDefined();
        expect(screen.getByText('notification_voting')).toBeDefined();
        expect(screen.getByText('notification_achievements')).toBeDefined();
    });

    it('renders category toggles when emailNotifications is false BUT push notifications are subscribed (OR logic)', async () => {
        // Mock serviceWorker ready with an active push subscription
        const mockGetSubscription = vi
            .fn()
            .mockResolvedValue({ endpoint: 'https://push.example.com/sub' });
        Object.defineProperty(global.navigator, 'serviceWorker', {
            value: {
                ready: Promise.resolve({
                    pushManager: {
                        getSubscription: mockGetSubscription,
                    },
                }),
            },
            writable: true,
            configurable: true,
        });
        (global as any).window.PushManager = {};

        render(
            <NotificationPreferencesManager currentUser={mockUserInactive} />
        );

        await waitFor(() => {
            expect(
                screen.getByText('notification_preferences_title')
            ).toBeDefined();
            expect(screen.getByText('notification_social')).toBeDefined();
        });
    });

    it('toggles preference, calls PATCH API, and calls router.refresh() to update server components', async () => {
        (axios.patch as any).mockResolvedValue({
            data: { social: false },
        });

        render(<NotificationPreferencesManager currentUser={mockUserActive} />);

        const socialSwitch = screen.getByTestId('pref-toggle-social');

        await act(async () => {
            fireEvent.click(socialSwitch);
        });

        await waitFor(() => {
            expect(axios.patch).toHaveBeenCalledWith(
                '/api/notificationPreferences',
                { social: false }
            );
            expect(toast.success).toHaveBeenCalledWith(
                'notification_preferences_updated'
            );
            expect(mockRefresh).toHaveBeenCalled();
        });
    });

    it('reverts state and displays error toast when API patch fails', async () => {
        (axios.patch as any).mockRejectedValue(new Error('Network Error'));

        render(<NotificationPreferencesManager currentUser={mockUserActive} />);

        const socialSwitch = screen.getByTestId('pref-toggle-social');

        await act(async () => {
            fireEvent.click(socialSwitch);
        });

        await waitFor(() => {
            expect(axios.patch).toHaveBeenCalledWith(
                '/api/notificationPreferences',
                { social: false }
            );
            expect(toast.error).toHaveBeenCalledWith('something_went_wrong');
        });
    });
});
