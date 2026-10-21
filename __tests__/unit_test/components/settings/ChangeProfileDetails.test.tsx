import React from 'react';
import {
    render,
    screen,
    cleanup,
    fireEvent,
    waitFor,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ChangeProfileDetails, {
    ChangeProfileDetailsRef,
} from '@/app/components/settings/ChangeProfileDetails';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';

vi.mock('axios');
const mockedAxios = axios as any;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockRouter = {
    refresh: vi.fn(),
};

vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
}));

describe('ChangeProfileDetails', () => {
    const mockUser: SafeUser = {
        id: 'user-456',
        name: 'ChefMario',
        email: 'mario@example.com',
        image: null,
        emailVerified: null,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        favoriteIds: [],
        emailNotifications: false,
        level: 3,
        verified: true,
        badges: [],
        bio: 'Artisan baker with 10 years experience.',
        websiteUrl: 'https://mariobakes.com',
        instagram: 'mario_ig',
        twitter: 'mario_tw',
        youtube: 'mario_yt',
        tiktok: 'mario_tt',
    } as unknown as SafeUser;

    beforeEach(() => {
        vi.clearAllMocks();
        mockedAxios.patch.mockResolvedValue({
            data: { ...mockUser },
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders view mode with user details', () => {
        render(<ChangeProfileDetails currentUser={mockUser} />);

        expect(screen.getByTestId('profile-details-section')).toBeDefined();
        expect(
            screen.getByText('"Artisan baker with 10 years experience."')
        ).toBeDefined();
        expect(screen.getByText('mariobakes.com')).toBeDefined();
        expect(screen.getByText('@mario_ig')).toBeDefined();
        expect(screen.getByTestId('edit-profile-details')).toBeDefined();
    });

    it('switches to editing mode when Edit button is clicked', () => {
        render(<ChangeProfileDetails currentUser={mockUser} />);

        fireEvent.click(screen.getByTestId('edit-profile-details'));

        expect(screen.getByTestId('bio-input')).toBeDefined();
        expect(screen.getByTestId('website-input')).toBeDefined();
        expect(screen.getByTestId('instagram-input')).toBeDefined();
        expect(screen.getByTestId('twitter-input')).toBeDefined();
        expect(screen.getByTestId('youtube-input')).toBeDefined();
        expect(screen.getByTestId('tiktok-input')).toBeDefined();
    });

    it('limits bio character count to 250 characters', () => {
        render(<ChangeProfileDetails currentUser={mockUser} />);
        fireEvent.click(screen.getByTestId('edit-profile-details'));

        const bioInput = screen.getByTestId('bio-input') as HTMLTextAreaElement;
        const longText = 'a'.repeat(300);

        fireEvent.change(bioInput, { target: { value: longText } });

        expect(bioInput.value.length).toBe(250);
        expect(screen.getByText('250/250')).toBeDefined();
    });

    it('saves updated details and calls axios patch', async () => {
        render(<ChangeProfileDetails currentUser={mockUser} />);
        fireEvent.click(screen.getByTestId('edit-profile-details'));

        const bioInput = screen.getByTestId('bio-input');
        fireEvent.change(bioInput, {
            target: { value: 'Updated bio description' },
        });

        const saveButton = screen.getByTestId('save-profile-details');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockedAxios.patch).toHaveBeenCalledWith(
                '/api/user/user-456',
                expect.objectContaining({
                    bio: 'Updated bio description',
                    websiteUrl: 'https://mariobakes.com',
                })
            );
            expect(toast.success).toHaveBeenCalledWith('profile_updated');
            expect(mockRouter.refresh).toHaveBeenCalled();
        });
    });

    it('cancels editing and reverts values', () => {
        render(<ChangeProfileDetails currentUser={mockUser} />);
        fireEvent.click(screen.getByTestId('edit-profile-details'));

        const bioInput = screen.getByTestId('bio-input');
        fireEvent.change(bioInput, {
            target: { value: 'Something completely different' },
        });

        fireEvent.click(screen.getByTestId('cancel-profile-details'));

        // Switched back to view mode
        expect(
            screen.getByText('"Artisan baker with 10 years experience."')
        ).toBeDefined();
    });

    it('saves via imperative handle ref when dirty', async () => {
        const ref = React.createRef<ChangeProfileDetailsRef>();
        render(
            <ChangeProfileDetails
                currentUser={mockUser}
                ref={ref}
            />
        );

        fireEvent.click(screen.getByTestId('edit-profile-details'));

        const websiteInput = screen.getByTestId('website-input');
        fireEvent.change(websiteInput, {
            target: { value: 'https://newdomain.org' },
        });

        ref.current?.save();

        await waitFor(() => {
            expect(mockedAxios.patch).toHaveBeenCalledWith(
                '/api/user/user-456',
                expect.objectContaining({
                    websiteUrl: 'https://newdomain.org',
                })
            );
        });
    });
});
