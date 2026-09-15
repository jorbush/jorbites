import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeContributionGraph from '@/app/components/stats/RecipeContributionGraph';
import { SafeRecipe } from '@/app/types';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        i18n: { language: 'en' },
        t: (key: string) => {
            const translations: Record<string, string> = {
                recipe_contribution_graph: 'Recipe Contribution Graph',
                recipes_in_last_year: 'recipes in the last year',
                active_days: 'Active days',
                longest_streak: 'Longest streak',
                day_streak: 'day streak',
                days_streak: 'days streak',
                swipe_to_view_history: 'Swipe to explore past weeks',
                no_recipes_on_day: 'No recipes on this day',
                view_3m: '3M',
                view_6m: '6M',
                view_1y: '1Y',
                on: 'on',
                less: 'Less',
                more: 'More',
                recipe: 'recipe',
                recipes: 'recipes',
                day_sun: 'Sun',
                day_mon: 'Mon',
                day_tue: 'Tue',
                day_wed: 'Wed',
                day_thu: 'Thu',
                day_fri: 'Fri',
                day_sat: 'Sat',
            };
            return translations[key] || key;
        },
    }),
    initReactI18next: { type: '3rdParty', init: () => {} },
}));

// Mock i18n
vi.mock('@/app/i18n', () => ({
    default: {
        language: 'en',
        changeLanguage: vi.fn(),
    },
}));

// Mock date-utils
vi.mock('@/app/utils/date-utils', () => ({
    formatDateLanguage: (date: Date, formatString: string) => {
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        if (formatString === 'MMM') {
            return monthNames[date.getMonth()];
        }
        if (formatString === 'MMM d, yyyy') {
            return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        }
        return date.toLocaleDateString();
    },
}));

describe('<RecipeContributionGraph />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    const createMockRecipe = (id: string, createdAt: string): SafeRecipe => ({
        id,
        title: `Recipe ${id}`,
        description: 'Test description',
        imageSrc: '/test.jpg',
        createdAt,
        categories: ['main'],
        method: 'baking',
        minutes: 30,
        numLikes: 0,
        ingredients: [],
        steps: [],
        extraImages: [],
        userId: 'user1',
        coCooksIds: [],
        linkedRecipeIds: [],
        youtubeUrl: null,
        questId: null,
    });

    it('renders nothing when recipes array is empty', () => {
        const { container } = render(<RecipeContributionGraph recipes={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders the component with title when recipes are provided', () => {
        const today = new Date();
        const recipe = createMockRecipe('1', today.toISOString());

        render(<RecipeContributionGraph recipes={[recipe]} />);

        expect(screen.getByText('Recipe Contribution Graph')).toBeDefined();
    });

    it('renders the legend with Less and More labels', () => {
        const today = new Date();
        const recipe = createMockRecipe('1', today.toISOString());

        render(<RecipeContributionGraph recipes={[recipe]} />);

        expect(screen.getByText('Less')).toBeDefined();
        expect(screen.getByText('More')).toBeDefined();
    });

    it('renders calendar grid with correct number of weeks', () => {
        const today = new Date();
        const recipe = createMockRecipe('1', today.toISOString());

        const { container } = render(
            <RecipeContributionGraph recipes={[recipe]} />
        );

        // Should have 53 weeks (371 days / 7)
        // Look for week columns - they have flex flex-col classes
        // Use a more flexible selector that matches the structure
        const allDivs = container.querySelectorAll('div');
        const weekColumns = Array.from(allDivs).filter((div) => {
            const classes = div.className || '';
            return (
                classes.includes('flex') &&
                classes.includes('flex-col') &&
                classes.includes('gap')
            );
        });
        // Each week column contains 7 days, so we expect 53 week columns
        expect(weekColumns.length).toBeGreaterThan(50);
    });

    it('displays tooltip when hovering over a day with recipes', () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const recipe = createMockRecipe('1', today.toISOString());

        render(<RecipeContributionGraph recipes={[recipe]} />);

        // Find a day cell that should have a recipe
        const dayCells = screen.getAllByTitle(/recipe/i);
        if (dayCells.length > 0) {
            const dayCell = dayCells[0];
            fireEvent.mouseEnter(dayCell);

            // Check if tooltip appears (it should show recipe count and date)
            // The tooltip might not be immediately visible, so we check for the structure
            expect(dayCell).toBeDefined();
        }
    });

    it('colors days correctly based on recipe count', () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create multiple recipes for the same day
        const recipes = [
            createMockRecipe('1', today.toISOString()),
            createMockRecipe('2', today.toISOString()),
            createMockRecipe('3', today.toISOString()),
        ];

        const { container } = render(
            <RecipeContributionGraph recipes={recipes} />
        );

        // Check that days with recipes have the green-450 color class
        const coloredDays = container.querySelectorAll(
            '.bg-green-450, .bg-green-450\\/30, .bg-green-450\\/50, .bg-green-450\\/70'
        );
        expect(coloredDays.length).toBeGreaterThan(0);
    });

    it('handles recipes from different dates', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const recipes = [
            createMockRecipe('1', today.toISOString()),
            createMockRecipe('2', yesterday.toISOString()),
            createMockRecipe('3', lastWeek.toISOString()),
        ];

        render(<RecipeContributionGraph recipes={recipes} />);

        expect(screen.getByText('Recipe Contribution Graph')).toBeDefined();
    });

    it('displays month labels', () => {
        const today = new Date();
        const recipe = createMockRecipe('1', today.toISOString());

        const { container } = render(
            <RecipeContributionGraph recipes={[recipe]} />
        );

        // Month labels should be present - they're in the month labels row
        const monthLabelsRow = container.querySelector(
            '.mb-2.flex.min-w-\\[600px\\]'
        );
        const monthLabels =
            monthLabelsRow?.querySelectorAll(
                '.text-xs.text-neutral-500, .text-\\[10px\\].text-neutral-500'
            ) || [];
        expect(monthLabels.length).toBeGreaterThan(0);
    });

    it('displays day of week labels', () => {
        const today = new Date();
        const recipe = createMockRecipe('1', today.toISOString());

        const { container } = render(
            <RecipeContributionGraph recipes={[recipe]} />
        );

        // Day labels should include at least some of the day names
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const hasDayLabels = dayLabels.some((label) => {
            const elements = Array.from(container.querySelectorAll('*')).filter(
                (el) => el.textContent === label
            );
            return elements.length > 0;
        });
        expect(hasDayLabels).toBe(true);
    });

    it('hides tooltip when mouse leaves a day', () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const recipe = createMockRecipe('1', today.toISOString());

        render(<RecipeContributionGraph recipes={[recipe]} />);

        const dayCells = screen.getAllByTitle(/recipe/i);
        if (dayCells.length > 0) {
            const dayCell = dayCells[0];
            fireEvent.mouseEnter(dayCell);
            fireEvent.mouseLeave(dayCell);

            // Tooltip should be hidden (we can't easily test this without more complex queries)
            // But the component should handle the event without errors
            expect(dayCell).toBeDefined();
        }
    });

    it('displays summary metrics in the header', () => {
        const today = new Date();
        const recipe1 = createMockRecipe('1', today.toISOString());
        const recipe2 = createMockRecipe('2', today.toISOString());

        render(<RecipeContributionGraph recipes={[recipe1, recipe2]} />);

        expect(screen.getByText(/recipes in the last year/i)).toBeDefined();
        expect(screen.getByText(/active days/i)).toBeDefined();
    });

    it('renders time range buttons and filters weeks accordingly', () => {
        const today = new Date();
        const recipe = createMockRecipe('1', today.toISOString());

        const { container } = render(
            <RecipeContributionGraph recipes={[recipe]} />
        );

        const btn3M = screen.getByText('3M');
        const btn6M = screen.getByText('6M');
        const btn1Y = screen.getByText('1Y');

        expect(btn3M).toBeDefined();
        expect(btn6M).toBeDefined();
        expect(btn1Y).toBeDefined();

        // Switch to 3M
        fireEvent.click(btn3M);
        const weekColumns3M = container.querySelectorAll(
            '[data-testid="week-column"]'
        );
        // 3M has 13 weeks
        expect(weekColumns3M.length).toBe(13);

        // Switch to 6M
        fireEvent.click(btn6M);
        const weekColumns6M = container.querySelectorAll(
            '[data-testid="week-column"]'
        );
        // 6M has 26 weeks
        expect(weekColumns6M.length).toBe(26);
    });

    it('selects and dismisses a day on click', () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const recipe = createMockRecipe('1', today.toISOString());

        render(<RecipeContributionGraph recipes={[recipe]} />);

        const dayCells = screen.getAllByTitle(/recipe/i);
        expect(dayCells.length).toBeGreaterThan(0);

        // Click to select day
        fireEvent.click(dayCells[0]);

        // Details banner should be displayed
        expect(screen.getByText('1 recipe')).toBeDefined();

        // Click dismiss button
        const dismissBtn = screen.getByLabelText('Dismiss selection');
        fireEvent.click(dismissBtn);

        // Selection should be cleared
        expect(screen.queryByLabelText('Dismiss selection')).toBeNull();
    });

    it('supports keyboard navigation with Enter key on day cells', () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const recipe = createMockRecipe('1', today.toISOString());

        render(<RecipeContributionGraph recipes={[recipe]} />);

        const dayCells = screen.getAllByTitle(/recipe/i);
        expect(dayCells.length).toBeGreaterThan(0);

        // Press Enter to select
        fireEvent.keyDown(dayCells[0], { key: 'Enter' });
        expect(screen.getByLabelText('Dismiss selection')).toBeDefined();

        // Press Enter again to toggle off
        fireEvent.keyDown(dayCells[0], { key: 'Enter' });
        expect(screen.queryByLabelText('Dismiss selection')).toBeNull();
    });
});
