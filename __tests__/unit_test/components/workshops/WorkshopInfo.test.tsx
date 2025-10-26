import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WorkshopInfo from '@/app/components/workshops/WorkshopInfo';
import { SafeUser, SafeWorkshopParticipant } from '@/app/types';
import axios from 'axios';

// Mock dependencies
vi.mock('axios');
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: () => false,
}));

vi.mock('@/app/utils/responsive', () => ({
    default: (user: SafeUser) => user.name,
}));

vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src, onClick }: { src: string | null; onClick?: () => void }) => (
        <div data-testid="avatar" onClick={onClick}>
            Avatar
        </div>
    ),
}));

vi.mock('@/app/components/VerificationBadge', () => ({
    default: () => <div data-testid="verification-badge">Verified</div>,
}));

describe('<WorkshopInfo />', () => {
    const mockHost: SafeUser = {
        id: 'host1',
        name: 'Test Host',
        email: 'host@example.com',
        emailVerified: null,
        image: '/host-image.jpg',
        hashedPassword: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        emailNotifications: false,
        level: 5,
        verified: true,
        badges: [],
        resetToken: null,
        resetTokenExpiry: null,
    };

    const mockParticipants: SafeWorkshopParticipant[] = [
        {
            id: 'p1',
            workshopId: 'workshop1',
            userId: 'user1',
            joinedAt: new Date('2024-01-01').toISOString(),
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders workshop information correctly', () => {
        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={false}
                price={0}
                ingredients={[]}
                previousSteps={[]}
                id="workshop1"
                whitelistedUserIds={[]}
            />
        );

        expect(screen.getByText('Test Description')).toBeDefined();
        expect(screen.getByText('Test Location')).toBeDefined();
    });

    it('displays host information', () => {
        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={false}
                price={0}
                ingredients={[]}
                previousSteps={[]}
                id="workshop1"
                whitelistedUserIds={[]}
            />
        );

        expect(screen.getByText('Test Host')).toBeDefined();
        expect(screen.getByText('host')).toBeDefined();
    });

    it('shows verification badge for verified host', () => {
        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={false}
                price={0}
                ingredients={[]}
                previousSteps={[]}
                id="workshop1"
                whitelistedUserIds={[]}
            />
        );

        expect(screen.getByTestId('verification-badge')).toBeDefined();
    });

    it('does not show verification badge for unverified host', () => {
        const unverifiedHost = { ...mockHost, verified: false };

        render(
            <WorkshopInfo
                host={unverifiedHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={false}
                price={0}
                ingredients={[]}
                previousSteps={[]}
                id="workshop1"
                whitelistedUserIds={[]}
            />
        );

        expect(screen.queryByTestId('verification-badge')).toBeNull();
    });

    it('displays price when workshop has a cost', () => {
        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={false}
                price={25.5}
                ingredients={[]}
                previousSteps={[]}
                id="workshop1"
                whitelistedUserIds={[]}
            />
        );

        expect(screen.getByText(/25.50/)).toBeDefined();
    });

    it('does not display price section for free workshop', () => {
        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={false}
                price={0}
                ingredients={[]}
                previousSteps={[]}
                id="workshop1"
                whitelistedUserIds={[]}
            />
        );

        // Price section should not be rendered when price is 0
        // Check that price_per_person is not shown
        const textContent = document.body.textContent || '';
        expect(textContent.includes('price_per_person')).toBe(false);
    });

    it('displays private workshop indicator', () => {
        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={true}
                price={0}
                ingredients={[]}
                previousSteps={[]}
                id="workshop1"
                whitelistedUserIds={[]}
            />
        );

        expect(screen.getByText('private_workshop')).toBeDefined();
    });

    it('displays recurrence pattern when workshop is recurrent', () => {
        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={true}
                recurrencePattern="weekly"
                isPrivate={false}
                price={0}
                ingredients={[]}
                previousSteps={[]}
                id="workshop1"
                whitelistedUserIds={[]}
            />
        );

        // The text is combined as "recurrence: weekly"
        expect(screen.getByText(/recurrence/)).toBeDefined();
        expect(screen.getByText(/weekly/)).toBeDefined();
    });

    it('displays ingredients list', () => {
        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={false}
                price={0}
                ingredients={['Flour', 'Sugar', 'Eggs']}
                previousSteps={[]}
                id="workshop1"
                whitelistedUserIds={[]}
            />
        );

        expect(screen.getByText('ingredients')).toBeDefined();
        expect(screen.getByText(/Flour/)).toBeDefined();
        expect(screen.getByText(/Sugar/)).toBeDefined();
        expect(screen.getByText(/Eggs/)).toBeDefined();
    });

    it('displays previous steps when provided', () => {
        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={false}
                price={0}
                ingredients={[]}
                previousSteps={['Step 1', 'Step 2']}
                id="workshop1"
                whitelistedUserIds={[]}
            />
        );

        expect(screen.getByText('previous_steps')).toBeDefined();
        expect(screen.getByText(/Step 1/)).toBeDefined();
        expect(screen.getByText(/Step 2/)).toBeDefined();
    });

    it('displays participants count', () => {
        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={false}
                price={0}
                ingredients={[]}
                previousSteps={[]}
                id="workshop1"
                participants={mockParticipants}
                whitelistedUserIds={[]}
            />
        );

        expect(screen.getByText(/1 participants/)).toBeDefined();
    });

    it('fetches and displays whitelisted users for private workshop when user is host', async () => {
        const mockWhitelistedUsers = [
            { id: 'user1', name: 'User 1', image: null },
            { id: 'user2', name: 'User 2', image: null },
        ];

        (axios.get as any).mockResolvedValueOnce({ data: mockWhitelistedUsers });

        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={true}
                price={0}
                ingredients={[]}
                previousSteps={[]}
                id="workshop1"
                currentUser={mockHost}
                whitelistedUserIds={['user1', 'user2']}
            />
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                '/api/users/multiple?ids=user1,user2'
            );
        });

        await waitFor(() => {
            expect(screen.getByText('workshop_whitelist')).toBeDefined();
        });
    });

    it('does not show whitelist section when user is not host', async () => {
        const otherUser: SafeUser = { ...mockHost, id: 'other-user' };
        
        (axios.get as any).mockResolvedValueOnce({ 
            data: [{ id: 'user1', name: 'User 1', image: null }] 
        });

        render(
            <WorkshopInfo
                host={mockHost}
                description="Test Description"
                date="2024-12-01T10:00:00.000Z"
                location="Test Location"
                isRecurrent={false}
                isPrivate={true}
                price={0}
                ingredients={[]}
                previousSteps={[]}
                id="workshop1"
                currentUser={otherUser}
                whitelistedUserIds={['user1']}
            />
        );

        // Wait for the API call to complete
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        // Whitelist section should not be shown for non-host
        expect(screen.queryByText('workshop_whitelist')).toBeNull();
    });
});
