import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeRemixesSection from '@/app/components/recipes/RecipeRemixesSection';
import { SafeRecipe, SafeUser } from '@/app/types';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

const mockLoginOpen = vi.fn();
vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({
        onOpen: mockLoginOpen,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'community_remixes')
                return 'Community Remixes & Variations';
            if (key === 'remix_recipe') return 'Remix';
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

    it('renders list of remixes and handles clicking a variation', () => {
        render(
            <RecipeRemixesSection
                originalRecipeId="orig-123"
                remixes={mockRemixes}
                currentUser={mockUser}
            />
        );

        expect(screen.getByText('(1)')).toBeInTheDocument();
        expect(screen.getByText('Spicy Carbonara Remix')).toBeInTheDocument();
        expect(screen.getByText('SpicyChef')).toBeInTheDocument();

        const remixCard = screen.getByTestId('remix-card-remix-1');
        fireEvent.click(remixCard);
        expect(mockPush).toHaveBeenCalledWith('/recipes/remix-1');
    });

    it('navigates to create remix when header Remix button is clicked', () => {
        render(
            <RecipeRemixesSection
                originalRecipeId="orig-123"
                remixes={mockRemixes}
                currentUser={mockUser}
            />
        );

        const remixBtn = screen.getByTestId('section-remix-btn');
        fireEvent.click(remixBtn);
        expect(mockPush).toHaveBeenCalledWith(
            '/recipes/create?forkFrom=orig-123'
        );
    });

    it('prompts login if unauthenticated user clicks header Remix button', () => {
        render(
            <RecipeRemixesSection
                originalRecipeId="orig-123"
                remixes={mockRemixes}
                currentUser={null}
            />
        );

        const remixBtn = screen.getByTestId('section-remix-btn');
        fireEvent.click(remixBtn);
        expect(mockLoginOpen).toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });
});
