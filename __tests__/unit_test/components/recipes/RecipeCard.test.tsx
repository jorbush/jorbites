// @ts-nocheck
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import { SafeRecipe, SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

// Mock the HeartButton component
vi.mock('@/app/components/HeartButton', () => ({
    default: () => <button data-testid="heart-button">Heart</button>,
}));

// Mock the Avatar component
vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src, size }: { src: string | null; size: number }) => (
        <div
            data-testid="avatar"
            data-src={src}
            data-size={size}
        >
            Avatar
        </div>
    ),
}));

describe('<RecipeCard />', () => {
    const mockRecipe: SafeRecipe = {
        id: '1',
        title: 'Test Recipe',
        imageSrc: '/test-image.jpg',
        minutes: 30,
        description: 'Test Description',
        category: 'Test Category',
        method: 'Test Method',
        numLikes: 0,
        ingredients: [],
        steps: [],
        extraImages: [],
        userId: '1',
        createdAt: '2022-01-01',
        coCooksIds: [],
        linkedRecipeIds: [],
    };

    const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: null,
        language: null,
        favoriteIds: [],
        image: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailNotifications: false,
        level: 0,
        verified: false,
        badges: [],
    };

    const mockRouter = {
        back: vi.fn(),
        push: vi.fn(),
    };

    beforeEach(() => {
        render(
            <RecipeCard
                data={mockRecipe}
                currentUser={mockUser as any}
            />
        );
        (useRouter as any).mockReturnValue(mockRouter);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the recipe title', () => {
        expect(screen.getByText('Test Recipe')).toBeDefined();
    });

    it('renders the recipe cooking time', () => {
        expect(screen.getByText('30 min')).toBeDefined();
    });

    it('renders the recipe image', () => {
        const image = screen.getByAltText('recipe') as HTMLImageElement;
        expect(image).toBeDefined();
        expect(image.src).toContain('test-image.jpg');
    });

    it('renders the HeartButton component', () => {
        expect(screen.getByTestId('heart-button')).toBeDefined();
    });

    it('navigates to the recipe page when clicked', () => {
        fireEvent.click(screen.getByText('Test Recipe'));
        expect(mockRouter.push).toHaveBeenCalledWith('/recipes/1');
    });

    describe('user parameter logic', () => {
        const mockRecipeUser = {
            id: '2',
            name: 'Recipe Author',
            email: 'author@example.com',
            emailVerified: null,
            language: null,
            favoriteIds: [],
            image: '/author-image.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            emailNotifications: false,
            level: 5,
            verified: true,
            badges: [],
        };

        beforeEach(() => {
            cleanup();
        });

        it('shows user avatar and name when user prop is provided', () => {
            render(
                <RecipeCard
                    data={mockRecipe}
                    currentUser={mockUser as any}
                    user={mockRecipeUser}
                />
            );

            // Should show avatar and user name
            expect(screen.getByTestId('avatar')).toBeDefined();
            expect(screen.getByText('Recipe Author')).toBeDefined();

            // Should NOT show cooking time
            expect(screen.queryByText('30 min')).toBeNull();
        });

        it('shows cooking time when user prop is not provided', () => {
            render(
                <RecipeCard
                    data={mockRecipe}
                    currentUser={mockUser as any}
                />
            );

            // Should show cooking time
            expect(screen.getByText('30 min')).toBeDefined();

            // Should NOT show avatar or user name
            expect(screen.queryByTestId('avatar')).toBeNull();
            expect(screen.queryByText('Recipe Author')).toBeNull();
        });

        it('shows cooking time when user prop is null', () => {
            render(
                <RecipeCard
                    data={mockRecipe}
                    currentUser={mockUser as any}
                    user={null}
                />
            );

            // Should show cooking time
            expect(screen.getByText('30 min')).toBeDefined();

            // Should NOT show avatar
            expect(screen.queryByTestId('avatar')).toBeNull();
        });
    });
});
