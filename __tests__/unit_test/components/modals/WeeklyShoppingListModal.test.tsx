import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WeeklyShoppingListModal from '@/app/components/modals/WeeklyShoppingListModal';
import { SafePlanningMeal } from '@/app/types';

describe('WeeklyShoppingListModal', () => {
    afterEach(() => {
        cleanup();
    });

    const mockMeals: SafePlanningMeal[] = [
        {
            id: 'meal-1',
            planningId: 'plan-1',
            day: 'monday',
            mealType: 'breakfast',
            recipeId: 'recipe-1',
            recipe: {
                id: 'recipe-1',
                title: 'Oatmeal',
                description: 'Healthy morning oats',
                imageSrc: '/oatmeal.jpg',
                createdAt: '2026-05-25',
                categories: ['Breakfast'],
                method: 'no-cook',
                minutes: 5,
                numLikes: 3,
                ingredients: ['1 cup oats', '1 cup milk'],
                steps: ['Mix together'],
                userId: 'user-1',
            },
        },
    ];

    it('renders empty message when no meals are provided', () => {
        render(
            <WeeklyShoppingListModal
                isOpen={true}
                onClose={vi.fn()}
                meals={[]}
                planningName="Empty Plan"
            />
        );

        expect(screen.getByText('weekly_shopping_list')).toBeDefined();
        expect(screen.getByText('no_recipes_yet')).toBeDefined();
    });

    it('renders recipes and ingredients lists correctly', () => {
        render(
            <WeeklyShoppingListModal
                isOpen={true}
                onClose={vi.fn()}
                meals={mockMeals}
                planningName="My Oats Week"
            />
        );

        expect(screen.getByText('Oatmeal')).toBeDefined();
        expect(screen.getByText('1 cup oats')).toBeDefined();
        expect(screen.getByText('1 cup milk')).toBeDefined();
    });

    it('toggles ingredient checked state on click', () => {
        render(
            <WeeklyShoppingListModal
                isOpen={true}
                onClose={vi.fn()}
                meals={mockMeals}
                planningName="My Oats Week"
            />
        );

        const ingredientItem = screen.getByText('1 cup oats');

        // Assert checked class is initially NOT there
        expect(ingredientItem.className).not.toContain('line-through');

        // Click to toggle checked
        fireEvent.click(ingredientItem);
        expect(ingredientItem.className).toContain('line-through');

        // Click to toggle unchecked
        fireEvent.click(ingredientItem);
        expect(ingredientItem.className).not.toContain('line-through');
    });

    it('triggers clipboard copy when copy button clicked', () => {
        const writeTextMock = vi.fn();
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock,
            },
        });

        render(
            <WeeklyShoppingListModal
                isOpen={true}
                onClose={vi.fn()}
                meals={mockMeals}
                planningName="My Oats Week"
            />
        );

        const copyButton = screen.getByText('copy_list');
        fireEvent.click(copyButton);

        expect(writeTextMock).toHaveBeenCalled();
        expect(writeTextMock.mock.calls[0][0]).toContain(
            'My Oats Week - shopping_list'
        );
    });

    it('calls onClose when Done button is clicked', () => {
        const mockClose = vi.fn();
        render(
            <WeeklyShoppingListModal
                isOpen={true}
                onClose={mockClose}
                meals={mockMeals}
                planningName="My Oats Week"
            />
        );

        const doneButton = screen.getByText('done');
        fireEvent.click(doneButton);

        expect(mockClose).toHaveBeenCalledTimes(1);
    });
});
