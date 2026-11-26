import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { PlanningDayCard } from '@/app/components/plannings/PlanningDayCard';

describe('PlanningDayCard', () => {
    const t = (key: string) => key;
    const push = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders day title and meal slots', () => {
        render(
            <PlanningDayCard
                day="monday"
                groupedMeals={{}}
                isOwner={false}
                onAddRecipeClick={vi.fn()}
                onRemoveRecipe={vi.fn()}
                push={push}
                t={t}
            />
        );

        expect(screen.getByText('monday')).toBeDefined();
        expect(screen.getAllByTestId('meal-slot')).toHaveLength(4);
    });

    it('calculates and renders total daily calories when recipes have calories', () => {
        const groupedMeals = {
            'monday-breakfast': [
                {
                    id: 'meal-1',
                    recipe: { id: 'rec-1', title: 'Eggs', calories: 250 },
                },
            ],
            'monday-lunch': [
                {
                    id: 'meal-2',
                    recipe: { id: 'rec-2', title: 'Salad', calories: 350 },
                },
            ],
            'monday-dinner': [
                {
                    id: 'meal-3',
                    recipe: { id: 'rec-3', title: 'Steak', calories: 600 },
                },
            ],
            'monday-snack': [
                {
                    id: 'meal-4',
                    recipe: { id: 'rec-4', title: 'Apple', calories: 80 },
                },
            ],
        };

        render(
            <PlanningDayCard
                day="monday"
                groupedMeals={groupedMeals}
                isOwner={false}
                onAddRecipeClick={vi.fn()}
                onRemoveRecipe={vi.fn()}
                push={push}
                t={t}
            />
        );

        // 250 + 350 + 600 + 80 = 1280
        const caloriesBadge = screen.getByTestId('day-calories');
        expect(caloriesBadge).toBeDefined();
        expect(caloriesBadge.textContent).toContain('1280');
    });

    it('does not render calories badge if total calories is 0 or recipes have no calories', () => {
        const groupedMeals = {
            'monday-breakfast': [
                {
                    id: 'meal-1',
                    recipe: { id: 'rec-1', title: 'Eggs', calories: null },
                },
            ],
            'monday-lunch': [
                {
                    id: 'meal-2',
                    recipe: { id: 'rec-2', title: 'Salad' },
                },
            ],
        };

        render(
            <PlanningDayCard
                day="monday"
                groupedMeals={groupedMeals}
                isOwner={false}
                onAddRecipeClick={vi.fn()}
                onRemoveRecipe={vi.fn()}
                push={push}
                t={t}
            />
        );

        const caloriesBadge = screen.queryByTestId('day-calories');
        expect(caloriesBadge).toBeNull();
        expect(screen.queryByTestId('day-macro-summary')).toBeNull();
    });

    it('renders compact daily macro summary with calories, protein, carbs, fat, and fiber', () => {
        const groupedMeals = {
            'monday-breakfast': [
                {
                    id: 'meal-1',
                    recipe: {
                        id: 'rec-1',
                        title: 'Oats',
                        calories: 450,
                        protein: 25,
                        carbohydrates: 60,
                        fat: 12,
                        fiber: 8,
                    },
                },
            ],
            'monday-lunch': [
                {
                    id: 'meal-2',
                    recipe: {
                        id: 'rec-2',
                        title: 'Bowl',
                        calories: 700,
                        protein: 50,
                        carbohydrates: 75,
                        fat: 20,
                        fiber: 10,
                    },
                },
            ],
        };

        render(
            <PlanningDayCard
                day="monday"
                groupedMeals={groupedMeals}
                isOwner={false}
                onAddRecipeClick={vi.fn()}
                onRemoveRecipe={vi.fn()}
                push={push}
                t={t}
            />
        );

        expect(screen.getByTestId('day-macro-summary')).toBeDefined();
        expect(screen.getByTestId('day-calories').textContent).toContain(
            '1150 kcal'
        );
        expect(screen.getByTestId('day-protein').textContent).toContain(
            '75g P'
        );
        expect(screen.getByTestId('day-carbohydrates').textContent).toContain(
            '135g C'
        );
        expect(screen.getByTestId('day-fat').textContent).toContain('32g F');
        expect(screen.getByTestId('day-fiber').textContent).toContain(
            '18g Fib'
        );
    });

    it('renders explicit 0 macro values and omits unaudited null fields', () => {
        const groupedMeals = {
            'monday-dinner': [
                {
                    id: 'meal-1',
                    recipe: {
                        id: 'rec-1',
                        title: 'Grilled Steak',
                        calories: 400,
                        protein: 42,
                        carbohydrates: 0,
                        fat: 24,
                        fiber: null,
                    },
                },
                {
                    id: 'meal-2',
                    recipe: {
                        id: 'rec-2',
                        title: 'Unaudited Side',
                        calories: null,
                        protein: null,
                        carbohydrates: null,
                        fat: null,
                        fiber: undefined,
                    },
                },
            ],
        };

        render(
            <PlanningDayCard
                day="monday"
                groupedMeals={groupedMeals}
                isOwner={false}
                onAddRecipeClick={vi.fn()}
                onRemoveRecipe={vi.fn()}
                push={push}
                t={t}
            />
        );

        expect(screen.getByTestId('day-calories').textContent).toContain(
            '400 kcal'
        );
        expect(screen.getByTestId('day-protein').textContent).toContain(
            '42g P'
        );
        expect(screen.getByTestId('day-carbohydrates').textContent).toContain(
            '0g C'
        );
        expect(screen.getByTestId('day-fat').textContent).toContain('24g F');
        expect(screen.queryByTestId('day-fiber')).toBeNull();
    });

    it('renders progress bars and triggers Fill Remaining Macros when daily targets are configured', () => {
        const onFillRemainingMacros = vi.fn();
        const groupedMeals = {
            'monday-breakfast': [
                {
                    id: 'meal-1',
                    recipe: {
                        id: 'rec-1',
                        title: 'Oats',
                        calories: 500,
                        protein: 35,
                        carbohydrates: 60,
                        fat: 15,
                    },
                },
            ],
            'monday-lunch': [
                {
                    id: 'meal-2',
                    recipe: {
                        id: 'rec-2',
                        title: 'Chicken Bowl',
                        calories: 1000,
                        protein: 70,
                        carbohydrates: 80,
                        fat: 30,
                    },
                },
            ],
        };

        render(
            <PlanningDayCard
                day="monday"
                groupedMeals={groupedMeals}
                isOwner={true}
                onAddRecipeClick={vi.fn()}
                onRemoveRecipe={vi.fn()}
                dailyTargets={{
                    targetCalories: 2000,
                    targetProtein: 140,
                    targetCarbohydrates: 200,
                    targetFat: 65,
                }}
                onFillRemainingMacros={onFillRemainingMacros}
                push={push}
                t={t}
            />
        );

        expect(screen.getByTestId('day-goal-progress')).toBeDefined();

        const caloriesBar = screen.getByTestId('day-goal-bar-calories');
        expect(caloriesBar.getAttribute('aria-valuenow')).toBe('1500');
        expect(caloriesBar.getAttribute('aria-valuemax')).toBe('2000');

        const proteinBar = screen.getByTestId('day-goal-bar-protein');
        expect(proteinBar.getAttribute('aria-valuenow')).toBe('105');
        expect(proteinBar.getAttribute('aria-valuemax')).toBe('140');

        // Hint mentions remaining 35g P & 500 kcal for dinner
        const hint = screen.getByTestId('day-remaining-hint');
        expect(hint.textContent).toContain('≥35g P');
        expect(hint.textContent).toContain('≤500 kcal');
        expect(hint.textContent).toContain('dinner');

        const fillButton = screen.getByTestId('fill-remaining-macros-button');
        fireEvent.click(fillButton);

        expect(onFillRemainingMacros).toHaveBeenCalledWith(
            'monday',
            'dinner',
            expect.objectContaining({
                hasRemaining: true,
                initialFilters: { maxCalories: 500, minProtein: 35 },
                optionalFilters: { maxCarbohydrates: 60, maxFat: 20 },
            })
        );
    });

    it('shows daily goal reached badge and hides fill button when calories target is met or exceeded', () => {
        const groupedMeals = {
            'monday-dinner': [
                {
                    id: 'meal-1',
                    recipe: {
                        id: 'rec-1',
                        title: 'Feast',
                        calories: 2150,
                        protein: 150,
                    },
                },
            ],
        };

        render(
            <PlanningDayCard
                day="monday"
                groupedMeals={groupedMeals}
                isOwner={true}
                onAddRecipeClick={vi.fn()}
                onRemoveRecipe={vi.fn()}
                dailyTargets={{
                    targetCalories: 2000,
                    targetProtein: 140,
                }}
                onFillRemainingMacros={vi.fn()}
                push={push}
                t={t}
            />
        );

        expect(screen.getByTestId('day-goal-reached')).toBeDefined();
        expect(screen.queryByTestId('fill-remaining-macros-button')).toBeNull();
        expect(
            screen.getByTestId('day-goal-item-calories').textContent
        ).toContain('(+150)');
    });
});
