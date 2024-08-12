import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EmailNotificationsSelector from '@/app/components/settings/EmailNotificationsSelector';
import axios from 'axios';
import { act } from 'react';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('axios');
vi.mock('react-hot-toast');

describe('<EmailNotificationsSelector />', () => {
    const mockUser = {
        id: '1',
        emailNotifications: true,
        name: null,
        email: null,
        emailVerified: null,
        image: null,
        hashedPassword: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        level: 0,
        verified: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders correctly with user preferences', () => {
        render(<EmailNotificationsSelector currentUser={mockUser} />);

        expect(screen.getByText('enable_email_notifications')).toBeDefined();
        expect(screen.getByRole('button')).toBeDefined();
    });

    it('toggles email notifications when button is clicked', async () => {
        (axios.put as any).mockResolvedValue({});

        render(<EmailNotificationsSelector currentUser={mockUser} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith('/api/emailNotifications/1');
            expect(toast.success).toHaveBeenCalledWith(
                'Email notifications updated!'
            );
        });
    });

    it('shows error toast when API call fails', async () => {
        (axios.put as any).mockRejectedValue(new Error('API Error'));

        render(<EmailNotificationsSelector currentUser={mockUser} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith('/api/emailNotifications/1');
            expect(toast.error).toHaveBeenCalledWith('Something went wrong.');
        });
    });

    it('disables button for 2 seconds after click', async () => {
        vi.useFakeTimers();
        (axios.put as any).mockResolvedValue({});

        await act(async () => {
            render(<EmailNotificationsSelector currentUser={mockUser} />);
        });

        const button = screen.getByRole('button');

        await act(async () => {
            fireEvent.click(button);
        });

        expect(button).toHaveProperty('disabled', true);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        expect(button).toHaveProperty('disabled', false);

        vi.useRealTimers();
    });

    it('renders correct icon based on user preferences', () => {
        const userWithNotifications = {
            ...mockUser,
            emailNotifications: true,
            name: null,
            email: null,
            emailVerified: null,
            image: null,
            hashedPassword: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            favoriteIds: [],
            level: 0,
            verified: false,
        };
        const { rerender } = render(
            <EmailNotificationsSelector currentUser={userWithNotifications} />
        );

        expect(screen.getByTestId('thumb-up-icon')).toBeDefined();

        const userWithoutNotifications = {
            ...mockUser,
            emailNotifications: false,
            name: null,
            email: null,
            emailVerified: null,
            image: null,
            hashedPassword: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            favoriteIds: [],
            level: 0,
            verified: false,
        };
        rerender(
            <EmailNotificationsSelector
                currentUser={userWithoutNotifications}
            />
        );

        expect(screen.getByTestId('thumb-down-icon')).toBeDefined();
    });
});
