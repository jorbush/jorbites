import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { RecipeInfoHeader } from '@/app/components/recipes/RecipeInfoHeader';

// mock components
vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ onClick }: any) => (
        <div
            data-testid="avatar"
            onClick={onClick}
        />
    ),
}));
vi.mock('@/app/components/buttons/HeartButton', () => ({
    default: () => <div data-testid="heart-button" />,
}));
vi.mock('@/app/components/buttons/AddToListButton', () => ({
    default: () => <div data-testid="add-to-list-button" />,
}));
vi.mock('@/app/components/VerificationBadge', () => ({
    default: () => <span data-testid="verification-badge" />,
}));
vi.mock('@/app/components/utils/StarRating', () => ({
    default: () => <div data-testid="star-rating" />,
}));
vi.mock('@/app/utils/responsive', () => ({
    default: (user: any) => user.name,
}));

describe('RecipeInfoHeader', () => {
    const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        image: 'john.jpg',
        level: 5,
        verified: true,
    } as any;

    const t = (key: string, options?: { defaultValue?: string }) => {
        if (key === 'cuisine_italian') return 'Italiana';
        if (options?.defaultValue) return options.defaultValue;
        return key;
    };
    const push = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders avatar, name, level, likes, and rating', () => {
        render(
            <RecipeInfoHeader
                user={mockUser}
                id="recipe-1"
                likes={10}
                stepsCount={3}
                ingredientsCount={5}
                averageRating={4.5}
                ratingCount={2}
                mounted={true}
                t={t}
                push={push}
                isMdOrSmaller={false}
                isSmOrSmaller={false}
            />
        );

        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('level 5')).toBeDefined();
        expect(screen.getByText('10')).toBeDefined();
        expect(screen.getByText('3 steps')).toBeDefined();
        expect(screen.getByText('5 ingredients')).toBeDefined();
        expect(screen.getByTestId('verification-badge')).toBeDefined();
        expect(screen.getByTestId('star-rating')).toBeDefined();
    });

    it('calls push with correct URL when likes count is clicked', () => {
        render(
            <RecipeInfoHeader
                user={mockUser}
                id="recipe-1"
                likes={10}
                stepsCount={3}
                ingredientsCount={5}
                averageRating={4.5}
                ratingCount={2}
                mounted={true}
                t={t}
                push={push}
                isMdOrSmaller={false}
                isSmOrSmaller={false}
            />
        );

        const likesButton = screen.getByRole('button', {
            name: 'View users who liked this recipe',
        });
        fireEvent.click(likesButton);

        expect(push).toHaveBeenCalledWith('/recipes/recipe-1/likes');
    });

    it('renders calories, yield, and cuisine when provided', () => {
        render(
            <RecipeInfoHeader
                user={mockUser}
                id="recipe-1"
                likes={10}
                stepsCount={3}
                ingredientsCount={5}
                averageRating={4.5}
                ratingCount={2}
                mounted={true}
                t={t}
                push={push}
                isMdOrSmaller={false}
                isSmOrSmaller={false}
                calories={350}
                recipeCuisine="Italian"
                recipeYield={4}
            />
        );

        expect(screen.getByTestId('recipe-calories')).toBeDefined();
        expect(screen.getByText('350 calories')).toBeDefined();

        expect(screen.getByTestId('recipe-yield')).toBeDefined();
        expect(screen.getByText('4 servings')).toBeDefined();

        expect(screen.getByTestId('recipe-cuisine')).toBeDefined();
        expect(screen.getByText('Italiana')).toBeDefined();
    });

    it('falls back to the original cuisine string if no translation key is matched', () => {
        render(
            <RecipeInfoHeader
                user={mockUser}
                id="recipe-1"
                likes={10}
                stepsCount={3}
                ingredientsCount={5}
                averageRating={4.5}
                ratingCount={2}
                mounted={true}
                t={t}
                push={push}
                isMdOrSmaller={false}
                isSmOrSmaller={false}
                recipeCuisine="Unknown Cuisine"
            />
        );

        expect(screen.getByTestId('recipe-cuisine')).toBeDefined();
        expect(screen.getByText('Unknown Cuisine')).toBeDefined();
    });

    it('does not render calories, yield, and cuisine when not provided', () => {
        render(
            <RecipeInfoHeader
                user={mockUser}
                id="recipe-1"
                likes={10}
                stepsCount={3}
                ingredientsCount={5}
                averageRating={4.5}
                ratingCount={2}
                mounted={true}
                t={t}
                push={push}
                isMdOrSmaller={false}
                isSmOrSmaller={false}
            />
        );

        expect(screen.queryByTestId('recipe-calories')).toBeNull();
        expect(screen.queryByTestId('recipe-yield')).toBeNull();
        expect(screen.queryByTestId('recipe-cuisine')).toBeNull();
    });
});
