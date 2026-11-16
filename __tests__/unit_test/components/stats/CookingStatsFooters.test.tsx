import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import {
    RecipesTrendFooter,
    LikesFooter,
    CookingTimeFooter,
    ThisYearFooter,
} from '@/app/components/stats/CookingStatsFooters';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                this_year: 'This Year',
                avg: 'Avg',
                per_recipe: 'per recipe',
                minutes_total: 'minutes total',
                of_all_recipes: 'of all recipes',
            };
            return translations[key] || key;
        },
    }),
}));

describe('CookingStatsFooters', () => {
    describe('RecipesTrendFooter', () => {
        it('renders nothing when trend is 0 or negative', () => {
            const { container: c0 } = render(<RecipesTrendFooter trend={0} />);
            expect(c0.firstChild).toBeNull();

            const { container: cNeg } = render(
                <RecipesTrendFooter trend={-5} />
            );
            expect(cNeg.firstChild).toBeNull();
        });

        it('renders trend badge and label when trend is positive', () => {
            render(<RecipesTrendFooter trend={45} />);
            expect(screen.getByText('45%')).toBeInTheDocument();
            expect(screen.getByText('This Year')).toBeInTheDocument();
        });
    });

    describe('LikesFooter', () => {
        it('renders average likes correctly', () => {
            render(<LikesFooter avgLikes={12} />);
            expect(screen.getByText(/Avg:/)).toBeInTheDocument();
            expect(screen.getByText('12')).toBeInTheDocument();
            expect(screen.getByText(/per recipe/)).toBeInTheDocument();
        });
    });

    describe('CookingTimeFooter', () => {
        it('renders total cooking minutes correctly', () => {
            render(<CookingTimeFooter totalMinutes={180} />);
            expect(screen.getByText('180')).toBeInTheDocument();
            expect(screen.getByText(/minutes total/)).toBeInTheDocument();
        });
    });

    describe('ThisYearFooter', () => {
        it('renders percentage of all recipes correctly', () => {
            render(<ThisYearFooter percentage={75} />);
            expect(screen.getByText(/75%/)).toBeInTheDocument();
            expect(screen.getByText(/of all recipes/)).toBeInTheDocument();
        });
    });
});
