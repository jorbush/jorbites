import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HeartButton from '@/app/components/buttons/HeartButton';
import { SafeUser } from '@/app/types';

// Mock the useFavorite hook
vi.mock('@/app/hooks/useFavorite', () => ({
    default: vi.fn((params) => ({
        hasFavorited: false,
        toggleFavorite: vi.fn(),
        likesCount: params.likes || 0,
        isLoading: false,
    })),
}));

// Mock the react-icons
vi.mock('react-icons/ai', () => ({
    AiFillHeart: () => <div data-testid="filled-heart" />,
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

    it('renders likes count when showLikes is true', () => {
        render(
            <HeartButton
                recipeId={mockRecipeId}
                currentUser={mockCurrentUser}
                likes={10}
                showLikes={true}
            />
        );
        expect(screen.getByText('10')).toBeDefined();
    });

    it('does not render likes count when showLikes is false', () => {
        render(
            <HeartButton
                recipeId={mockRecipeId}
                currentUser={mockCurrentUser}
                likes={10}
                showLikes={false}
            />
        );
        expect(screen.queryByText('10')).toBeNull();
    });
});
