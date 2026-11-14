import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import UserStats from '@/app/components/stats/UserStats';
import { SafeUser } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                cooking_statistics: 'Cooking Statistics',
                recipes: 'Recipes',
                favorites: 'Favorites',
                cooking_time: 'Cooking Time',
                this_year: 'This Year',
                cooking_preferences: 'Cooking Preferences',
                most_used_category: 'Most Used Category',
                most_used_method: 'Most Used Method',
                italian: 'Italian',
                grilling: 'Grilling',
            };
            return translations[key] || key;
        },
    }),
}));

describe('UserStats', () => {
    it('returns null if user is null or undefined', () => {
        const { container: cNull } = render(<UserStats user={null} />);
        expect(cNull.firstChild).toBeNull();

        const { container: cUndef } = render(<UserStats user={undefined} />);
        expect(cUndef.firstChild).toBeNull();
    });

    it('does not render content if user has 0 recipes', () => {
        const userWithNoRecipes: SafeUser = {
            id: 'user-0',
            recipeCount: 0,
        } as unknown as SafeUser;

        const { container } = render(<UserStats user={userWithNoRecipes} />);
        expect(
            screen.queryByText('Cooking Statistics')
        ).not.toBeInTheDocument();
        expect(container.firstChild).toBeInTheDocument(); // Container exists
    });

    it('renders cooking statistics and cooking preferences when user has recipes', () => {
        const user: SafeUser = {
            id: 'user-1',
            recipeCount: 15,
            recipesThisYear: 3,
            likesReceived: 300,
            avgLikesPerRecipe: 20,
            totalCookingTime: 90,
            mostUsedCategory: 'Italian',
            mostUsedMethod: 'Grilling',
        } as unknown as SafeUser;

        render(<UserStats user={user} />);

        expect(screen.getByText('Cooking Statistics')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('Cooking Preferences')).toBeInTheDocument();
        expect(screen.getByText('Italian')).toBeInTheDocument();
        expect(screen.getByText('Grilling')).toBeInTheDocument();
    });
});
