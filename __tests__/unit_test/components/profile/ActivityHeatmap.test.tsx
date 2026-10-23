import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ActivityHeatmap, {
    getActivityDayColor,
} from '@/app/components/profile/ActivityHeatmap';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => key || fallback,
        i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    }),
}));

describe('ActivityHeatmap', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders null when total activities count is 0', () => {
        const { container } = render(
            <ActivityHeatmap
                recipes={[]}
                comments={[]}
                challengeSubmissions={[]}
                activities={[]}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders correctly when recipes are provided', () => {
        const todayIso = new Date().toISOString();
        const mockRecipes = [{ id: 'rec-1', createdAt: todayIso }];

        render(<ActivityHeatmap recipes={mockRecipes} />);

        expect(screen.getByTestId('activity-heatmap')).toBeDefined();
        expect(screen.getByTestId('activity-heatmap-legend')).toBeDefined();
        const cells = screen.getAllByTestId('activity-heatmap-cell');
        expect(cells.length).toBeGreaterThan(0);
    });

    it('aggregates comments, cooksnaps, reviews, and challenge submissions', () => {
        const todayIso = new Date().toISOString();
        const mockRecipes = [{ id: 'r1', createdAt: todayIso }];
        const mockComments = [
            { id: 'c1', createdAt: todayIso, isCooked: true, rating: 5 },
            {
                id: 'c2',
                createdAt: todayIso,
                isCooked: false,
                rating: null,
                comment: 'Nice!',
            },
        ];
        const mockChallenges = [{ id: 'ch1', createdAt: todayIso }];

        const { container } = render(
            <ActivityHeatmap
                recipes={mockRecipes}
                comments={mockComments}
                challengeSubmissions={mockChallenges}
            />
        );

        expect(screen.getByTestId('activity-heatmap')).toBeDefined();
        const activeCell = container.querySelector('[data-count="4"]');
        expect(activeCell).not.toBeNull();
        expect(activeCell?.getAttribute('data-level')).toBe('3'); // count 4 -> level 3
    });

    it('does not double count quest recipes that are also in challengeSubmissions', () => {
        const todayIso = new Date().toISOString();
        const mockRecipes = [
            { id: 'quest-recipe-1', createdAt: todayIso, questId: 'quest-99' },
        ];
        const mockChallenges = [{ id: 'quest-recipe-1', createdAt: todayIso }];

        const { container } = render(
            <ActivityHeatmap
                recipes={mockRecipes}
                challengeSubmissions={mockChallenges}
            />
        );

        const activeCell = container.querySelector('[data-count="1"]');
        expect(activeCell).not.toBeNull();
        expect(container.querySelector('[data-count="2"]')).toBeNull();
    });

    it('computes correct day color based on level', () => {
        expect(getActivityDayColor(0)).toContain('bg-neutral-100');
        expect(getActivityDayColor(1)).toContain('bg-green-450/30');
        expect(getActivityDayColor(2)).toContain('bg-green-450/50');
        expect(getActivityDayColor(3)).toContain('bg-green-450/70');
        expect(getActivityDayColor(4)).toBe('bg-green-450 dark:bg-green-450');
        expect(getActivityDayColor(99)).toContain('bg-neutral-100');
    });

    it('displays and dismisses tooltip on hover and mouse leave', () => {
        const todayIso = new Date().toISOString();
        const mockRecipes = [{ id: 'r1', createdAt: todayIso }];

        const { container } = render(<ActivityHeatmap recipes={mockRecipes} />);

        const activeCell = container.querySelector('[data-count="1"]');
        expect(activeCell).not.toBeNull();

        if (activeCell) {
            fireEvent.mouseEnter(activeCell);
            expect(
                screen.getByTestId('activity-heatmap-tooltip')
            ).toBeDefined();

            fireEvent.mouseLeave(activeCell);
            expect(screen.queryByTestId('activity-heatmap-tooltip')).toBeNull();
        }
    });

    it('supports custom title and showTitle prop', () => {
        const todayIso = new Date().toISOString();
        const mockRecipes = [{ id: 'r1', createdAt: todayIso }];

        const { rerender } = render(
            <ActivityHeatmap
                recipes={mockRecipes}
                title="My Custom Culinary Heatmap"
            />
        );

        expect(screen.getByText('My Custom Culinary Heatmap')).toBeDefined();

        rerender(
            <ActivityHeatmap
                recipes={mockRecipes}
                showTitle={false}
            />
        );

        expect(screen.queryByText('My Custom Culinary Heatmap')).toBeNull();
    });
});
