import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import JoinWorkshopButton from '@/app/components/workshops/JoinWorkshopButton';
import { SafeUser } from '@/app/types';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import useLoginModal from '@/app/hooks/useLoginModal';

// Mock dependencies
vi.mock('react-hot-toast');
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));
vi.mock('@/app/hooks/useLoginModal');

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<JoinWorkshopButton />', () => {
    const mockUser: SafeUser = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: null,
        image: null,
        hashedPassword: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        emailNotifications: false,
        level: 0,
        verified: false,
        badges: [],
        resetToken: null,
        resetTokenExpiry: null,
    };

    const mockRouter = {
        refresh: vi.fn(),
    };

    const mockLoginModalOnOpen = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue(mockRouter);
        (useLoginModal as any).mockReturnValue({
            onOpen: mockLoginModalOnOpen,
        });
        global.fetch = vi.fn();
    });

    afterEach(() => {
        cleanup();
    });

    it('shows join button for non-participant', () => {
        render(
            <JoinWorkshopButton
                workshopId="workshop1"
                currentUser={mockUser}
                isParticipant={false}
                isPast={false}
                isHost={false}
            />
        );

        expect(screen.getByText('join_workshop')).toBeDefined();
    });

    it('shows leave button for participant', () => {
        render(
            <JoinWorkshopButton
                workshopId="workshop1"
                currentUser={mockUser}
                isParticipant={true}
                isPast={false}
                isHost={false}
            />
        );

        expect(screen.getByText('leave_workshop')).toBeDefined();
    });

    it('shows host label for workshop host', () => {
        render(
            <JoinWorkshopButton
                workshopId="workshop1"
                currentUser={mockUser}
                isParticipant={false}
                isPast={false}
                isHost={true}
            />
        );

        expect(screen.getByText('host')).toBeDefined();
    });

    it('shows past workshop message for past workshops', () => {
        render(
            <JoinWorkshopButton
                workshopId="workshop1"
                currentUser={mockUser}
                isParticipant={false}
                isPast={true}
                isHost={false}
            />
        );

        expect(screen.getByText('workshop_date_passed')).toBeDefined();
    });

    it('opens login modal when non-logged-in user clicks join', () => {
        render(
            <JoinWorkshopButton
                workshopId="workshop1"
                currentUser={null}
                isParticipant={false}
                isPast={false}
                isHost={false}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockLoginModalOnOpen).toHaveBeenCalled();
    });

    it('joins workshop successfully', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({}),
        });

        render(
            <JoinWorkshopButton
                workshopId="workshop1"
                currentUser={mockUser}
                isParticipant={false}
                isPast={false}
                isHost={false}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/workshop/workshop1/join',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ action: 'join' }),
                })
            );
            expect(toast.success).toHaveBeenCalledWith('workshop_joined');
            expect(mockRouter.refresh).toHaveBeenCalled();
        });
    });

    it('leaves workshop successfully', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({}),
        });

        render(
            <JoinWorkshopButton
                workshopId="workshop1"
                currentUser={mockUser}
                isParticipant={true}
                isPast={false}
                isHost={false}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/workshop/workshop1/join',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ action: 'leave' }),
                })
            );
            expect(toast.success).toHaveBeenCalledWith('workshop_left');
        });
    });

    it('shows error message on join failure', async () => {
        const errorMessage = 'Workshop is full';
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ error: errorMessage }),
        });

        render(
            <JoinWorkshopButton
                workshopId="workshop1"
                currentUser={mockUser}
                isParticipant={false}
                isPast={false}
                isHost={false}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(errorMessage);
        });
    });
});
