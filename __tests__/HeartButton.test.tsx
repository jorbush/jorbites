import React from 'react';
import {
    render,
    screen
} from '@testing-library/react';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
} from 'vitest';
import HeartButton from '@/app/components/HeartButton';
import { SafeUser } from '@/app/types';

// Mock the useFavorite hook
vi.mock('@/app/hooks/useFavorite', () => ({
    default: vi.fn(() => ({
        hasFavorited: false,
        toggleFavorite: vi.fn(),
    })),
}));

// Mock the react-icons
vi.mock('react-icons/ai', () => ({
    AiFillHeart: () => <div data-testid="filled-heart" />,
    AiOutlineHeart: () => (
        <div data-testid="outline-heart" />
    ),
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

    it('renders both heart icons', () => {
        render(
            <HeartButton
                recipeId={mockRecipeId}
                currentUser={mockCurrentUser}
            />
        );
        expect(
            screen.getByTestId('filled-heart')
        ).toBeDefined();
        expect(
            screen.getByTestId('outline-heart')
        ).toBeDefined();
    });
});
