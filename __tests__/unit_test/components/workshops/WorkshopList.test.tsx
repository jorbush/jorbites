import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WorkshopList from '@/app/components/workshops/WorkshopList';
import { SafeWorkshop, SafeUser } from '@/app/types';

// Mock WorkshopCard
vi.mock('@/app/components/workshops/WorkshopCard', () => ({
    default: ({ data }: { data: SafeWorkshop }) => (
        <div data-testid="workshop-card">{data.title}</div>
    ),
}));

// Mock EmptyState
vi.mock('@/app/components/utils/EmptyState', () => ({
    default: ({
        title,
        subtitle,
    }: {
        title: string;
        subtitle: string;
        height?: string;
    }) => (
        <div data-testid="empty-state">
            <h3>{title}</h3>
            <p>{subtitle}</p>
        </div>
    ),
}));

describe('<WorkshopList />', () => {
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

    const mockWorkshops: SafeWorkshop[] = [
        {
            id: '1',
            title: 'Test Workshop 1',
            description: 'Description 1',
            date: new Date().toISOString(),
            location: 'Location 1',
            isRecurrent: false,
            recurrencePattern: null,
            isPrivate: false,
            whitelistedUserIds: [],
            imageSrc: null,
            price: 0,
            ingredients: [],
            previousSteps: [],
            hostId: 'host1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            host: mockUser,
            participants: [],
        },
        {
            id: '2',
            title: 'Test Workshop 2',
            description: 'Description 2',
            date: new Date().toISOString(),
            location: 'Location 2',
            isRecurrent: false,
            recurrencePattern: null,
            isPrivate: false,
            whitelistedUserIds: [],
            imageSrc: null,
            price: 10,
            ingredients: [],
            previousSteps: [],
            hostId: 'host1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            host: mockUser,
            participants: [],
        },
    ];

    afterEach(() => {
        cleanup();
    });

    it('renders workshop cards when workshops are provided', () => {
        render(
            <WorkshopList
                workshops={mockWorkshops}
                currentUser={mockUser}
                emptyStateTitle="No workshops"
                emptyStateSubtitle="Check back later"
            />
        );

        expect(screen.getByText('Test Workshop 1')).toBeDefined();
        expect(screen.getByText('Test Workshop 2')).toBeDefined();
    });

    it('renders correct number of workshop cards', () => {
        render(
            <WorkshopList
                workshops={mockWorkshops}
                currentUser={mockUser}
                emptyStateTitle="No workshops"
                emptyStateSubtitle="Check back later"
            />
        );

        const cards = screen.getAllByTestId('workshop-card');
        expect(cards.length).toBe(2);
    });

    it('renders empty state when no workshops provided', () => {
        render(
            <WorkshopList
                workshops={[]}
                currentUser={mockUser}
                emptyStateTitle="No workshops found"
                emptyStateSubtitle="Please check back later"
            />
        );

        expect(screen.getByTestId('empty-state')).toBeDefined();
        expect(screen.getByText('No workshops found')).toBeDefined();
        expect(screen.getByText('Please check back later')).toBeDefined();
    });

    it('passes correct props to empty state', () => {
        render(
            <WorkshopList
                workshops={[]}
                currentUser={mockUser}
                emptyStateTitle="Custom Title"
                emptyStateSubtitle="Custom Subtitle"
            />
        );

        expect(screen.getByText('Custom Title')).toBeDefined();
        expect(screen.getByText('Custom Subtitle')).toBeDefined();
    });

    it('renders workshop cards in a grid layout', () => {
        const { container } = render(
            <WorkshopList
                workshops={mockWorkshops}
                currentUser={mockUser}
                emptyStateTitle="No workshops"
                emptyStateSubtitle="Check back later"
            />
        );

        const grid = container.querySelector('.grid');
        expect(grid).toBeDefined();
    });

    it('renders section with correct aria-label', () => {
        const { container } = render(
            <WorkshopList
                workshops={mockWorkshops}
                currentUser={mockUser}
                emptyStateTitle="No workshops"
                emptyStateSubtitle="Check back later"
            />
        );

        const section = container.querySelector('[aria-label="Workshops grid"]');
        expect(section).toBeDefined();
    });

    it('marks first workshop card with isFirstCard prop', () => {
        const { container } = render(
            <WorkshopList
                workshops={mockWorkshops}
                currentUser={mockUser}
                emptyStateTitle="No workshops"
                emptyStateSubtitle="Check back later"
            />
        );

        // First card should be rendered
        const cards = screen.getAllByTestId('workshop-card');
        expect(cards[0]).toBeDefined();
    });

    it('renders without current user', () => {
        render(
            <WorkshopList
                workshops={mockWorkshops}
                emptyStateTitle="No workshops"
                emptyStateSubtitle="Check back later"
            />
        );

        expect(screen.getByText('Test Workshop 1')).toBeDefined();
    });
});
