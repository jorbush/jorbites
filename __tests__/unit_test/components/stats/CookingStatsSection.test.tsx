import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import CookingStatsSection from '@/app/components/stats/CookingStatsSection';
import { SafeUser } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                cooking_statistics: 'Cooking Statistics',
                recipes: 'Recipes',
                favorites: 'Favorites',
                cooking_time: 'Cooking Time',
                this_year: 'this year',
                avg: 'Avg',
                per_recipe: 'per recipe',
                minutes_total: 'minutes total',
                of_all_recipes: 'of all recipes',
            };
            return translations[key] || key;
        },
    }),
}));

const mockUser: SafeUser = {
    id: 'user-1',
    name: 'Chef John',
    recipeCount: 20,
    recipesThisYear: 5,
    likesReceived: 1500,
    avgLikesPerRecipe: 75,
    totalCookingTime: 120,
} as unknown as SafeUser;

describe('CookingStatsSection', () => {
    it('renders the cooking statistics header and stat cards', () => {
        render(
            <CookingStatsSection
                user={mockUser}
                recipeCount={20}
            />
        );

        expect(screen.getByText('Cooking Statistics')).toBeInTheDocument();
        expect(screen.getByText('Recipes')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();

        expect(screen.getByText('Favorites')).toBeInTheDocument();
        expect(screen.getByText('1.5k')).toBeInTheDocument();

        expect(screen.getByText('Cooking Time')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('h')).toBeInTheDocument();

        expect(screen.getByText('This year')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('handles zero or missing values gracefully', () => {
        const emptyUser: SafeUser = {
            id: 'user-empty',
        } as unknown as SafeUser;

        render(
            <CookingStatsSection
                user={emptyUser}
                recipeCount={0}
            />
        );

        expect(screen.getByText('Cooking Statistics')).toBeInTheDocument();
        const zeroes = screen.getAllByText('0');
        expect(zeroes.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('h')).toBeInTheDocument();
    });
});
