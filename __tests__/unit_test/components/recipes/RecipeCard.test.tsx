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
    default: ({}: { recipeId: string; currentUser?: SafeUser | null }) => (
        <button data-testid="heart-button">Heart</button>
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
    };

    const mockUser: SafeUser = {
        id: '1',
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
    };

    const mockRouter = {
        back: vi.fn(),
        push: vi.fn(),
    };

    beforeEach(() => {
        render(
            <RecipeCard
                data={mockRecipe}
                currentUser={mockUser}
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
});
