import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HeartButton from '@/app/components/buttons/HeartButton';
import { SafeUser } from '@/app/types';

// Mock the useFavorite hook
const mockToggleFavorite = vi.fn();
vi.mock('@/app/hooks/useFavorite', () => ({
    default: vi.fn(({ likes }) => ({
        hasFavorited: false,
        optimisticLikes: likes ?? 0,
        toggleFavorite: mockToggleFavorite,
    })),
}));

// Mock the react-icons
vi.mock('react-icons/ai', () => ({
    AiFillHeart: ({ className }: { className: string }) => (
        <div
            data-testid="filled-heart"
            className={className}
        />
    ),
    AiOutlineHeart: () => <div data-testid="outline-heart" />,
}));

describe('<HeartButton />', () => {
    const mockRecipeId = '123';
    const mockCurrentUser: SafeUser = {
        id: '456',
        name: 'Test User',
        email: null,
        emailVerified: null,
        image: null,
        hashedPassword: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        emailNotifications: false,
        level: 0,
        verified: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders both heart icons', () => {
        render(
            <HeartButton
                recipeId={mockRecipeId}
                currentUser={mockCurrentUser}
            />
        );
        expect(screen.getByTestId('filled-heart')).toBeDefined();
        expect(screen.getByTestId('outline-heart')).toBeDefined();
    });

    it('renders the like count when provided', () => {
        render(
            <HeartButton
                recipeId={mockRecipeId}
                currentUser={mockCurrentUser}
                likes={10}
            />
        );
        expect(screen.getByText('10')).toBeDefined();
        expect(screen.getByTestId('recipe-num-likes')).toBeDefined();
    });

    it('does not render the like count when likes is undefined', () => {
        render(
            <HeartButton
                recipeId={mockRecipeId}
                currentUser={mockCurrentUser}
            />
        );
        expect(screen.queryByTestId('recipe-num-likes')).toBeNull();
    });

    it('does not render the like count when showLikes is false', () => {
        render(
            <HeartButton
                recipeId={mockRecipeId}
                currentUser={mockCurrentUser}
                likes={10}
                showLikes={false}
            />
        );
        expect(screen.queryByTestId('recipe-num-likes')).toBeNull();
    });
});
