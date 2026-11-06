import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LikesClient from '@/app/recipes/[recipeId]/likes/LikesClient';
import { SafeRecipe, SafeUser } from '@/app/types';

vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: () => false,
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src, onClick }: any) => (
        <div
            data-testid="avatar"
            onClick={onClick}
        >
            <img
                src={src}
                alt="avatar"
            />
        </div>
    ),
}));

describe('LikesClient', () => {
    const mockRecipe: SafeRecipe & { user: SafeUser } = {
        id: '1',
        title: 'Delicious Pasta',
        minutes: 30,
        imageSrc: '/pasta.jpg',
        extraImages: [],
        categories: ['Dinner'],
        method: 'Boiling',
        description: 'Tasty pasta',
        ingredients: ['Pasta', 'Water'],
        steps: ['Boil water', 'Cook pasta'],
        numLikes: 2,
        userId: 'user1',
        createdAt: '2022-01-01',
        user: { id: 'user1', name: 'Chef Mario' } as SafeUser,
    };

    const mockLikedUsers: SafeUser[] = [
        {
            id: 'user2',
            name: 'Luigi Mario',
            image: '/luigi.jpg',
            level: 3,
            verified: true,
            badges: ['chef_hat'],
        } as SafeUser,
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders recipe title, likes count, and back button', () => {
        render(
            <LikesClient
                recipe={mockRecipe}
                likedUsers={mockLikedUsers}
            />
        );

        expect(screen.getByText('Delicious Pasta')).toBeDefined();
        expect(screen.getByText('back_to_recipe')).toBeDefined();
        expect(screen.getByText('Luigi Mario')).toBeDefined();
    });

    it('renders empty state when no likes are present', () => {
        render(
            <LikesClient
                recipe={mockRecipe}
                likedUsers={[]}
            />
        );

        expect(screen.getByText('no_likes_yet')).toBeDefined();
    });
});
