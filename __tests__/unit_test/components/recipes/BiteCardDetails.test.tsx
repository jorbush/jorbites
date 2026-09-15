import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import BiteCardDetails from '@/app/components/recipes/BiteCardDetails';
import { SafeRecipe } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/components/utils/Avatar', () => ({
    default: () => <div data-testid="avatar-mock" />,
}));

const mockRecipe: SafeRecipe & {
    user?: { id?: string; name?: string | null; image?: string | null } | null;
} = {
    id: 'test-recipe',
    title: 'Tortilla de Patatas',
    description: 'Classic Spanish potato omelette',
    imageSrc: '/tortilla.jpg',
    createdAt: '2026-01-01T00:00:00.000Z',
    categories: ['Breakfast'],
    method: 'Stove',
    recipeCuisine: 'Spanish',
    minutes: 30,
    numLikes: 10,
    averageRating: 5.0,
    ratingCount: 1,
    ingredients: ['Egg', 'Potato', 'Onion'],
    steps: ['Fry potatoes', 'Mix with egg', 'Flip tortilla'],
    userId: 'user-1',
    user: {
        id: 'user-1',
        name: 'Chef Jordi',
        image: '/jordi.jpg',
    },
};

describe('<BiteCardDetails />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders category chip, title, description, and author', () => {
        render(<BiteCardDetails recipe={mockRecipe} />);

        expect(screen.getByText('Tortilla de Patatas')).toBeDefined();
        expect(
            screen.getByText('Classic Spanish potato omelette')
        ).toBeDefined();
        expect(screen.getByText('Chef Jordi')).toBeDefined();
        expect(screen.getByText('breakfast')).toBeDefined();
    });
});
