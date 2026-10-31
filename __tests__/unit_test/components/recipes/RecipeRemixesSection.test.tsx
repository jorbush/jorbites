import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeRemixesSection from '@/app/components/recipes/RecipeRemixesSection';
import { SafeRecipe, SafeUser } from '@/app/types';

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'community_remixes') return 'Remixes';
            return options?.defaultValue || key;
        },
    }),
}));

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

describe('RecipeRemixesSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockUser: SafeUser = {
        id: 'user-1',
        name: 'Alex',
        email: 'alex@test.com',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        favoriteIds: [],
        savedPlanningIds: [],
        pinnedRecipeIds: [],
        badges: [],
        emailNotifications: false,
        level: 3,
        verified: false,
    };

    const mockRemixes: SafeRecipe[] = [
        {
            id: 'remix-1',
            title: 'Spicy Carbonara Remix',
            description: 'With habanero flakes',
            imageSrc: 'https://img.test/remix1.jpg',
            createdAt: '2026-02-01',
            categories: ['Italian'],
            method: 'Stove',
            minutes: 25,
            numLikes: 3,
            ingredients: ['Pasta', 'Egg', 'Habanero'],
            steps: ['Cook'],
            extraImages: [],
            userId: 'user-2',
            user: {
                id: 'user-2',
                name: 'SpicyChef',
                image: null,
            } as any,
        },
    ];

    it('returns null when remixes list is empty or undefined', () => {
        const { container: emptyContainer } = render(
            <RecipeRemixesSection
                originalRecipeId="orig-123"
                remixes={[]}
                currentUser={mockUser}
            />
        );
        expect(emptyContainer.firstChild).toBeNull();

        const { container: undefinedContainer } = render(
            <RecipeRemixesSection
                originalRecipeId="orig-123"
                currentUser={mockUser}
            />
        );
        expect(undefinedContainer.firstChild).toBeNull();
    });

    it('renders list of remixes without count or duplicate button and handles clicking a variation', () => {
        render(
            <RecipeRemixesSection
                originalRecipeId="orig-123"
                remixes={mockRemixes}
                currentUser={mockUser}
            />
        );

        expect(screen.getByText('Remixes')).toBeInTheDocument();
        expect(screen.queryByText('(1)')).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('section-remix-btn')
        ).not.toBeInTheDocument();

        expect(screen.getByText('Spicy Carbonara Remix')).toBeInTheDocument();
        expect(screen.getByText('SpicyChef')).toBeInTheDocument();

        const remixCard = screen.getByTestId('remix-card-remix-1');
        expect(remixCard).toHaveAttribute('href', '/recipes/remix-1');
    });
});
