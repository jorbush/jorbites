import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ProfileContributionGraph from '@/app/components/profile/ProfileContributionGraph';

vi.mock('@/app/components/stats/RecipeContributionGraph', () => ({
    default: ({ recipes }: { recipes: any[] }) => (
        <div data-testid="recipe-contribution-graph">
            Graph items: {recipes.length}
        </div>
    ),
}));

describe('ProfileContributionGraph', () => {
    it('renders null when recipes list is empty', () => {
        const { container } = render(<ProfileContributionGraph recipes={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders RecipeContributionGraph when recipes are present', async () => {
        const mockRecipes = [
            { id: 'recipe-1', createdAt: '2026-01-01T00:00:00.000Z' },
        ];

        render(<ProfileContributionGraph recipes={mockRecipes} />);

        await waitFor(() => {
            expect(
                screen.getByTestId('recipe-contribution-graph')
            ).toBeDefined();
            expect(screen.getByText('Graph items: 1')).toBeDefined();
        });
    });
});
