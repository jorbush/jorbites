import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ChefsList from '@/app/components/chefs/ChefsList';
import { SafeUser } from '@/app/types';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                no_chefs: 'No chefs found',
                no_chefs_description: 'Try adjusting your search or filters',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock ChefCard component
vi.mock('@/app/components/chefs/ChefCard', () => ({
    default: ({ chef }: { chef: SafeUser }) => (
        <div data-testid={`chef-card-${chef.id}`}>{chef.name}</div>
    ),
}));

// Mock EmptyState component
vi.mock('@/app/components/utils/EmptyState', () => ({
    default: ({
        title,
        subtitle,
        height,
    }: {
        title: string;
        subtitle: string;
        height: string;
    }) => (
        <div
            data-testid="empty-state"
            data-height={height}
        >
            <h3>{title}</h3>
            <p>{subtitle}</p>
        </div>
    ),
}));

describe('<ChefsList />', () => {
    afterEach(() => {
        cleanup();
    });

    const mockChefs: SafeUser[] = [
        {
            id: '1',
            name: 'Chef One',
            email: 'chef1@example.com',
            image: null,
            level: 5,
            verified: true,
            hashedPassword: null,
            favoriteIds: [],
            emailNotifications: false,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            emailVerified: null,
            recipeCount: 10,
            likesReceived: 100,
        },
        {
            id: '2',
            name: 'Chef Two',
            email: 'chef2@example.com',
            image: null,
            level: 3,
            verified: false,
            hashedPassword: null,
            favoriteIds: [],
            emailNotifications: false,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
            emailVerified: null,
            recipeCount: 5,
            likesReceived: 50,
        },
        {
            id: '3',
            name: 'Chef Three',
            email: 'chef3@example.com',
            image: null,
            level: 7,
            verified: true,
            hashedPassword: null,
            favoriteIds: [],
            emailNotifications: false,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
            createdAt: '2024-01-03T00:00:00.000Z',
            updatedAt: '2024-01-03T00:00:00.000Z',
            emailVerified: null,
            recipeCount: 20,
            likesReceived: 300,
        },
    ];

    it('renders all chef cards when chefs are provided', () => {
        render(<ChefsList chefs={mockChefs} />);

        expect(screen.getByTestId('chef-card-1')).toBeDefined();
        expect(screen.getByTestId('chef-card-2')).toBeDefined();
        expect(screen.getByTestId('chef-card-3')).toBeDefined();
    });

    it('renders chef names', () => {
        render(<ChefsList chefs={mockChefs} />);

        expect(screen.getByText('Chef One')).toBeDefined();
        expect(screen.getByText('Chef Two')).toBeDefined();
        expect(screen.getByText('Chef Three')).toBeDefined();
    });

    it('renders empty state when no chefs are provided', () => {
        render(<ChefsList chefs={[]} />);

        expect(screen.getByTestId('empty-state')).toBeDefined();
        expect(screen.getByText('No chefs found')).toBeDefined();
    });

    it('renders custom empty state title and subtitle', () => {
        render(
            <ChefsList
                chefs={[]}
                emptyStateTitle="Custom Title"
                emptyStateSubtitle="Custom Subtitle"
            />
        );

        expect(screen.getByText('Custom Title')).toBeDefined();
        expect(screen.getByText('Custom Subtitle')).toBeDefined();
    });

    it('uses default empty state messages when not provided', () => {
        render(<ChefsList chefs={[]} />);

        expect(screen.getByText('No chefs found')).toBeDefined();
        expect(
            screen.getByText('Try adjusting your search or filters')
        ).toBeDefined();
    });

    it('renders a grid layout for chefs', () => {
        const { container } = render(<ChefsList chefs={mockChefs} />);
        const gridElement = container.querySelector('.grid');

        expect(gridElement).toBeDefined();
        expect(gridElement?.className).toContain('grid-cols-1');
    });

    it('renders correct number of chef cards', () => {
        render(<ChefsList chefs={mockChefs} />);

        const chefCards = [
            screen.getByTestId('chef-card-1'),
            screen.getByTestId('chef-card-2'),
            screen.getByTestId('chef-card-3'),
        ];

        expect(chefCards.length).toBe(3);
    });

    it('renders section with correct aria-label', () => {
        const { container } = render(<ChefsList chefs={mockChefs} />);
        const section = container.querySelector(
            'section[aria-label="Chefs grid"]'
        );

        expect(section).toBeDefined();
    });

    it('passes correct height to EmptyState', () => {
        render(<ChefsList chefs={[]} />);

        const emptyState = screen.getByTestId('empty-state');
        expect(emptyState.getAttribute('data-height')).toBe('h-[30vh]');
    });

    it('handles single chef', () => {
        render(<ChefsList chefs={[mockChefs[0]]} />);

        expect(screen.getByTestId('chef-card-1')).toBeDefined();
        expect(screen.queryByTestId('chef-card-2')).toBeNull();
    });

    it('renders with minimum height class', () => {
        const { container } = render(<ChefsList chefs={mockChefs} />);
        const section = container.querySelector('section');

        expect(section?.className).toContain('min-h-[60vh]');
    });
});
