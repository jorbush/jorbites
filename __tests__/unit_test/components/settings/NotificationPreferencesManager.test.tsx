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

    it('returns null when master emailNotifications is false', () => {
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

    it('toggles preference and calls PATCH API with expected key and value', async () => {
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
