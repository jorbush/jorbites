import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChefCard from '@/app/components/chefs/ChefCard';
import { SafeUser } from '@/app/types';
import React from 'react';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                level: 'Level',
                anonymous: 'Anonymous',
                recipe: 'Recipe',
                recipes: 'Recipes',
                likes: 'Likes',
                recipes_this_year: 'this year',
                likes_per_recipe: 'likes/recipe',
                italian: 'Italiano',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock Avatar component
vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src, size }: { src?: string | null; size: number }) => (
        <div
            data-testid="avatar"
            data-src={src}
            data-size={size}
        >
            Avatar
        </div>
    ),
}));

// Mock VerificationBadge component
vi.mock('@/app/components/VerificationBadge', () => ({
    default: ({ size, className }: { size: number; className?: string }) => (
        <div
            data-testid="verification-badge"
            data-size={size}
            className={className}
        >
            Verified
        </div>
    ),
}));

describe('<ChefCard />', () => {
    const mockChef: SafeUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
        level: 5,
        verified: true,
        hashedPassword: null,
        favoriteIds: [],
        emailNotifications: false,
        badges: [],
        resetToken: null,
        resetTokenExpiry: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        emailVerified: null,
        recipeCount: 15,
        likesReceived: 250,
        recipesLastMonth: 8,
        totalCookingTime: 500,
        avgLikesPerRecipe: 17,
        mostUsedCategory: 'Italian',
    };

    beforeEach(() => {
        mockPush.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders chef name', () => {
        render(<ChefCard chef={mockChef} />);
        expect(screen.getByText('John Doe')).toBeDefined();
    });

    it('renders chef level', () => {
        render(<ChefCard chef={mockChef} />);
        expect(screen.getByText(/Level 5/)).toBeDefined();
    });

    it('renders recipe count', () => {
        render(<ChefCard chef={mockChef} />);
        const recipeCountElement = screen.getByTestId('chef-card-recipes');
        expect(recipeCountElement.textContent).toBe('15');
    });

    it('renders likes received', () => {
        render(<ChefCard chef={mockChef} />);
        const likesElement = screen.getByTestId('chef-card-likes');
        expect(likesElement.textContent).toBe('250');
    });

    it('navigates to profile when clicked', () => {
        render(<ChefCard chef={mockChef} />);
        const card = screen.getByTestId('chef-card');
        fireEvent.click(card);
        expect(mockPush).toHaveBeenCalledWith('/profile/1');
    });

    it('displays verification badge when chef is verified', () => {
        render(<ChefCard chef={mockChef} />);
        expect(screen.getByTestId('verification-badge')).toBeDefined();
    });

    it('does not display verification badge when chef is not verified', () => {
        const unverifiedChef = { ...mockChef, verified: false };
        render(<ChefCard chef={unverifiedChef} />);
        expect(screen.queryByTestId('verification-badge')).toBeNull();
    });

    it('renders most used category', () => {
        render(<ChefCard chef={mockChef} />);
        expect(screen.getByText('Italiano')).toBeDefined();
    });

    it('renders most used category with case-insensitivity', () => {
        const chefWithLowercaseCategory = {
            ...mockChef,
            mostUsedCategory: 'italian',
        };
        render(<ChefCard chef={chefWithLowercaseCategory} />);
        expect(screen.getByText('Italiano')).toBeDefined();
    });

    it('renders recent activity indicator when chef has recipes last month', () => {
        render(<ChefCard chef={mockChef} />);
        expect(screen.getByText(/8 recipes_last_month/)).toBeDefined();
    });

    it('does not render recent activity indicator when chef has no recipes last month', () => {
        const chefWithoutRecentRecipes = { ...mockChef, recipesLastMonth: 0 };
        render(<ChefCard chef={chefWithoutRecentRecipes} />);
        expect(screen.queryByText(/recipes_last_month/)).toBeNull();
    });

    it('renders average likes per recipe', () => {
        render(<ChefCard chef={mockChef} />);
        expect(screen.getByText(/~17 likes\/recipe/)).toBeDefined();
    });

    it('handles chef without name (anonymous)', () => {
        const anonymousChef = { ...mockChef, name: null };
        render(<ChefCard chef={anonymousChef} />);
        expect(screen.getByText('Anonymous')).toBeDefined();
    });

    it('renders Avatar component with correct props', () => {
        render(<ChefCard chef={mockChef} />);
        const avatar = screen.getByTestId('avatar');
        expect(avatar.getAttribute('data-src')).toBe(
            'https://example.com/avatar.jpg'
        );
        expect(avatar.getAttribute('data-size')).toBe('96');
    });

    it('displays correct singular text for 1 recipe', () => {
        const chefWithOneRecipe = { ...mockChef, recipeCount: 1 };
        render(<ChefCard chef={chefWithOneRecipe} />);
        expect(screen.getByText('Recipe')).toBeDefined();
    });

    it('displays correct plural text for multiple recipes', () => {
        render(<ChefCard chef={mockChef} />);
        expect(screen.getByText('Recipes')).toBeDefined();
    });

    it('applies cursor-pointer class', () => {
        render(<ChefCard chef={mockChef} />);
        const card = screen.getByTestId('chef-card');
        expect(card.className).toContain('cursor-pointer');
    });

    it('renders without category if not provided', () => {
        const chefWithoutCategory = {
            ...mockChef,
            mostUsedCategory: undefined,
        };
        render(<ChefCard chef={chefWithoutCategory} />);
        expect(screen.queryByText('Italian')).toBeNull();
    });

    it('renders with zero likes', () => {
        const chefWithNoLikes = { ...mockChef, likesReceived: 0 };
        render(<ChefCard chef={chefWithNoLikes} />);
        const likesElement = screen.getByTestId('chef-card-likes');
        expect(likesElement.textContent).toBe('0');
    });

    it('renders with zero recipes', () => {
        const chefWithNoRecipes = { ...mockChef, recipeCount: 0 };
        render(<ChefCard chef={chefWithNoRecipes} />);
        const recipeCountElement = screen.getByTestId('chef-card-recipes');
        expect(recipeCountElement.textContent).toBe('0');
    });
});
