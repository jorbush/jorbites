import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import CookingPreferencesSection from '@/app/components/stats/CookingPreferencesSection';
import { SafeUser } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                cooking_preferences: 'Cooking Preferences',
                most_used_category: 'Most Used Category',
                most_used_method: 'Most Used Method',
                pasta: 'Pasta',
                baking: 'Baking',
            };
            return translations[key] || '';
        },
    }),
}));

describe('CookingPreferencesSection', () => {
    it('renders preferences header and preference cards with values', () => {
        const user: SafeUser = {
            id: 'user-1',
            mostUsedCategory: 'pasta',
            mostUsedMethod: 'baking',
        } as unknown as SafeUser;

        render(<CookingPreferencesSection user={user} />);

        expect(screen.getByText('Cooking Preferences')).toBeInTheDocument();
        expect(screen.getByText('Most Used Category')).toBeInTheDocument();
        expect(screen.getByText('Pasta')).toBeInTheDocument();
        expect(screen.getByText('Most Used Method')).toBeInTheDocument();
        expect(screen.getByText('Baking')).toBeInTheDocument();
    });

    it('renders fallback hyphens when preferences are missing', () => {
        const user: SafeUser = {
            id: 'user-2',
        } as unknown as SafeUser;

        render(<CookingPreferencesSection user={user} />);

        const hyphens = screen.getAllByText('-');
        expect(hyphens).toHaveLength(2);
    });

    it('uses single column below md and two columns on md and larger screens', () => {
        const user: SafeUser = {
            id: 'user-3',
            mostUsedCategory: 'pasta',
            mostUsedMethod: 'baking',
        } as unknown as SafeUser;

        const { container } = render(<CookingPreferencesSection user={user} />);
        const grid = container.querySelector('.grid');

        expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2');
        expect(grid).not.toHaveClass('sm:grid-cols-2');
    });
});
