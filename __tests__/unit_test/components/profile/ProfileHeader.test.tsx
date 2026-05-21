import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProfileHeader from '@/app/profile/[userId]/ProfileHeader';

// Mock useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

// Mock useShare
vi.mock('@/app/hooks/useShare', () => ({
    default: () => ({
        share: vi.fn(),
    }),
}));

// Mock useMediaQuery
vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: () => false,
}));

// Mock confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

// Mock RecipeBookButton
vi.mock('@/app/components/profile/RecipeBookButton', () => ({
    RecipeBookButton: ({ userId, userName }: any) => (
        <button
            data-testid="recipe-book-button-mock"
            data-user-id={userId}
            data-user-name={userName}
        >
            Generate Book
        </button>
    ),
    default: ({ userId, userName }: any) => (
        <button
            data-testid="recipe-book-button-mock"
            data-user-id={userId}
            data-user-name={userName}
        >
            Generate Book
        </button>
    ),
}));

describe('ProfileHeader Component - Recipe Book Button Visibility', () => {
    const mockUser = {
        id: 'user-123',
        name: 'Alice Cooper',
        image: '/alice.jpg',
        level: 5,
        createdAt: '2026-05-21T00:00:00.000Z',
        verified: true,
        badges: ['b1', 'b2'],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('does NOT render RecipeBookButton when currentUser is not logged in', () => {
        render(
            <ProfileHeader
                user={mockUser}
                currentUser={null}
            />
        );

        expect(screen.queryByTestId('recipe-book-button-mock')).toBeNull();
    });

    it('does NOT render RecipeBookButton when currentUser views another user profile', () => {
        const anotherUser = { id: 'user-456', name: 'Bob' };
        render(
            <ProfileHeader
                user={mockUser}
                currentUser={anotherUser as any}
            />
        );

        expect(screen.queryByTestId('recipe-book-button-mock')).toBeNull();
    });

    it('renders RecipeBookButton when currentUser views their own profile page', () => {
        render(
            <ProfileHeader
                user={mockUser}
                currentUser={mockUser as any}
            />
        );

        const button = screen.getByTestId('recipe-book-button-mock');
        expect(button).toBeDefined();
        expect(button.getAttribute('data-user-id')).toBe('user-123');
        expect(button.getAttribute('data-user-name')).toBe('Alice Cooper');
    });
});
