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
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import useLoginModal from '@/app/hooks/useLoginModal';

// Mock dependencies
vi.mock('axios');
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
        (axios.post as any).mockResolvedValueOnce({ data: {} });

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
            expect(axios.post).toHaveBeenCalledWith(
                '/api/workshop/workshop1/join',
                { action: 'join' }
            );
            expect(toast.success).toHaveBeenCalledWith('workshop_joined');
            expect(mockRouter.refresh).toHaveBeenCalled();
        });
    });

    it('leaves workshop successfully', async () => {
        (axios.post as any).mockResolvedValueOnce({ data: {} });

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
            expect(axios.post).toHaveBeenCalledWith(
                '/api/workshop/workshop1/join',
                { action: 'leave' }
            );
            expect(toast.success).toHaveBeenCalledWith('workshop_left');
        });
    });

    it('shows error message on join failure', async () => {
        const errorMessage = 'Workshop is full';
        (axios.post as any).mockRejectedValueOnce({
            response: { data: { error: errorMessage } },
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
