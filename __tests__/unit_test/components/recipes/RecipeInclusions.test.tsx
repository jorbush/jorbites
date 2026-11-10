import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeInclusions from '@/app/components/recipes/RecipeInclusions';
import { useRecipeInclusions } from '@/app/hooks/useRecipeInclusions';
import { SafeList, SafePlanning, SafeQuest } from '@/app/types';

vi.mock('@/app/hooks/useRecipeInclusions');

vi.mock('@/app/components/recipes/RecipeListsSection', () => ({
    default: ({ lists }: { lists: SafeList[] }) => (
        <div data-testid="mock-lists-section">Lists: {lists.length}</div>
    ),
}));

vi.mock('@/app/components/recipes/RecipePlanningsSection', () => ({
    default: ({ plannings }: { plannings: SafePlanning[] }) => (
        <div data-testid="mock-plannings-section">
            Plannings: {plannings.length}
        </div>
    ),
}));

vi.mock('@/app/components/recipes/RecipeQuestsSection', () => ({
    default: ({ quests }: { quests: SafeQuest[] }) => (
        <div data-testid="mock-quests-section">Quests: {quests.length}</div>
    ),
}));

describe('RecipeInclusions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null when all inclusions are empty', () => {
        vi.mocked(useRecipeInclusions).mockReturnValue({
            lists: [],
            plannings: [],
            quests: [],
            isLoading: false,
            error: null,
            mutate: vi.fn(),
        });

        const { container } = render(<RecipeInclusions recipeId="recipe-1" />);
        expect(container.firstChild).toBeNull();
    });

    it('renders sections when items are present', () => {
        vi.mocked(useRecipeInclusions).mockReturnValue({
            lists: [{ id: 'list-1' } as any],
            plannings: [{ id: 'plan-1' } as any],
            quests: [{ id: 'quest-1' } as any],
            isLoading: false,
            error: null,
            mutate: vi.fn(),
        });

        render(<RecipeInclusions recipeId="recipe-1" />);

        expect(screen.getByTestId('mock-lists-section')).toBeInTheDocument();
        expect(
            screen.getByTestId('mock-plannings-section')
        ).toBeInTheDocument();
        expect(screen.getByTestId('mock-quests-section')).toBeInTheDocument();
    });
});
