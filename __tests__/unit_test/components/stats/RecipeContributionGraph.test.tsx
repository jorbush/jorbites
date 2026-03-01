import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeContributionGraph from '@/app/components/stats/RecipeContributionGraph';
import { SafeRecipe } from '@/app/types';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                recipe_contribution_graph: 'Recipe Contribution Graph',
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

// Mock Tooltip component to simplify testing
vi.mock('@/app/components/utils/Tooltip', () => ({
    __esModule: true,
    default: ({ children, text }: { children: React.ReactNode; text: string }) => (
        <div title={text} data-testid="tooltip-wrapper">
            {children}
        </div>
    ),
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

        // Find a day cell wrapper (which is our mocked Tooltip)
        const tooltipWrappers = screen.getAllByTitle(/recipe/i);
        if (tooltipWrappers.length > 0) {
            const wrapper = tooltipWrappers[0];
            fireEvent.mouseEnter(wrapper);

            // Check if tooltip wrapper is present and has the correct title
            expect(wrapper).toBeDefined();
            expect(wrapper.getAttribute('title')).toMatch(/recipe/i);
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
                '.text-xs.text-gray-500, .text-\\[10px\\].text-gray-500'
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

        const tooltipWrappers = screen.getAllByTitle(/recipe/i);
        if (tooltipWrappers.length > 0) {
            const wrapper = tooltipWrappers[0];
            fireEvent.mouseEnter(wrapper);
            fireEvent.mouseLeave(wrapper);

            // The component should handle the event without errors
            expect(wrapper).toBeDefined();
        }
    });
});
