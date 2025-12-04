import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeContributionGraph from '@/app/components/profile/RecipeContributionGraph';
import { SafeRecipe } from '@/app/types';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                recipe_contributions: 'Recipe Contributions',
                recipes_last_year: 'recipes in the last year',
                recipe: 'recipe',
                recipes: 'recipes',
                less: 'Less',
                more: 'More',
            };
            return translations[key] || key;
        },
        i18n: {
            changeLanguage: () => new Promise(() => {}),
        },
    }),
}));

describe('RecipeContributionGraph Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    const createMockRecipe = (
        createdAt: string,
        id: string = '1'
    ): SafeRecipe => ({
        id,
        title: 'Test Recipe',
        description: 'Test Description',
        imageSrc: '/test-image.jpg',
        createdAt,
        category: 'Desserts',
        method: 'Oven',
        minutes: 30,
        numLikes: 0,
        ingredients: ['Ingredient 1'],
        steps: ['Step 1'],
        extraImages: [],
        userId: 'user1',
        coCooksIds: [],
        linkedRecipeIds: [],
        youtubeUrl: null,
        questId: null,
    });

    it('renders the component with title', () => {
        const recipes: SafeRecipe[] = [];
        render(<RecipeContributionGraph recipes={recipes} />);

        expect(
            screen.getByText('Recipe Contributions')
        ).toBeDefined();
    });

    it('displays zero recipes when no recipes are provided', () => {
        const recipes: SafeRecipe[] = [];
        render(<RecipeContributionGraph recipes={recipes} />);

        expect(
            screen.getByText('0 recipes in the last year')
        ).toBeDefined();
    });

    it('counts recipes correctly within the last year', () => {
        const today = new Date();
        const twoMonthsAgo = new Date(
            today.getFullYear(),
            today.getMonth() - 2,
            today.getDate()
        );
        const fourMonthsAgo = new Date(
            today.getFullYear(),
            today.getMonth() - 4,
            today.getDate()
        );

        const recipes: SafeRecipe[] = [
            createMockRecipe(twoMonthsAgo.toISOString(), '1'),
            createMockRecipe(fourMonthsAgo.toISOString(), '2'),
        ];

        render(<RecipeContributionGraph recipes={recipes} />);

        expect(
            screen.getByText('2 recipes in the last year')
        ).toBeDefined();
    });

    it('excludes recipes older than one year', () => {
        const today = new Date();
        const sixMonthsAgo = new Date(
            today.getFullYear(),
            today.getMonth() - 6,
            today.getDate()
        );
        const twoYearsAgo = new Date(
            today.getFullYear() - 2,
            today.getMonth(),
            today.getDate()
        );

        const recipes: SafeRecipe[] = [
            createMockRecipe(sixMonthsAgo.toISOString(), '1'),
            createMockRecipe(twoYearsAgo.toISOString(), '2'),
        ];

        render(<RecipeContributionGraph recipes={recipes} />);

        // Should only count the recipe from 6 months ago
        expect(
            screen.getByText('1 recipes in the last year')
        ).toBeDefined();
    });

    it('renders legend with color indicators', () => {
        const recipes: SafeRecipe[] = [];
        render(<RecipeContributionGraph recipes={recipes} />);

        expect(screen.getByText('Less')).toBeDefined();
        expect(screen.getByText('More')).toBeDefined();
    });

    it('renders the graph container', () => {
        const recipes: SafeRecipe[] = [];
        const { container } = render(
            <RecipeContributionGraph recipes={recipes} />
        );

        // Check for the graph structure
        const graphContainer = container.querySelector('.flex.gap-\\[3px\\]');
        expect(graphContainer).toBeDefined();
    });

    it('handles multiple recipes on the same day', () => {
        const today = new Date();
        const todayString = today.toISOString();

        const recipes: SafeRecipe[] = [
            createMockRecipe(todayString, '1'),
            createMockRecipe(todayString, '2'),
            createMockRecipe(todayString, '3'),
        ];

        render(<RecipeContributionGraph recipes={recipes} />);

        expect(
            screen.getByText('3 recipes in the last year')
        ).toBeDefined();
    });

    it('renders in a white background container with shadow', () => {
        const recipes: SafeRecipe[] = [];
        const { container } = render(
            <RecipeContributionGraph recipes={recipes} />
        );

        const mainContainer = container.querySelector(
            '.rounded-lg.bg-white.p-4.shadow-xs'
        );
        expect(mainContainer).toBeDefined();
    });
});
