import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { RecipeLinkedRecipes } from '@/app/components/recipes/RecipeLinkedRecipes';

vi.mock('@/app/components/recipes/RecipeCard', () => ({
    default: ({ data }: any) => (
        <div data-testid="recipe-card">{data.title}</div>
    ),
}));

describe('RecipeLinkedRecipes', () => {
    const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        image: 'john.jpg',
        level: 5,
        verified: true,
    } as any;

    const t = (key: string) => key;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders recipes list when loaded', () => {
        const recipes = [{ id: 'recipe-1', title: 'Pasta', user: mockUser }];
        render(
            <RecipeLinkedRecipes
                isLoadingRelatedData={false}
                linkedRecipes={recipes}
                mounted={true}
                t={t}
            />
        );
        expect(screen.getByText('Pasta')).toBeDefined();
    });
});
