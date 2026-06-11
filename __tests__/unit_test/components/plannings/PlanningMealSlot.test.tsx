import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { PlanningMealSlot } from '@/app/components/plannings/PlanningMealSlot';

describe('PlanningMealSlot', () => {
    const t = (key: string) => key;
    const push = vi.fn();
    const onAddRecipeClick = vi.fn();
    const onRemoveRecipe = vi.fn();
    const slotMeals = [
        {
            id: 'meal-1',
            recipe: {
                id: 'recipe-1',
                title: 'Pancakes',
                imageSrc: 'pancakes.png',
                user: { name: 'Chef Bob' },
            },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders scheduled meals and remove button if owner', () => {
        render(
            <PlanningMealSlot
                day="monday"
                mealType="breakfast"
                slotMeals={slotMeals}
                isOwner={true}
                onAddRecipeClick={onAddRecipeClick}
                onRemoveRecipe={onRemoveRecipe}
                push={push}
                t={t}
            />
        );

        expect(screen.getByText('Pancakes')).toBeDefined();
        expect(screen.getByText('by Chef Bob')).toBeDefined();
        expect(screen.getByRole('button', { name: 'delete' })).toBeDefined();
    });

    it('renders add recipe button if owner and space available', () => {
        render(
            <PlanningMealSlot
                day="monday"
                mealType="breakfast"
                slotMeals={[]}
                isOwner={true}
                onAddRecipeClick={onAddRecipeClick}
                onRemoveRecipe={onRemoveRecipe}
                push={push}
                t={t}
            />
        );

        expect(screen.getByTestId('add-recipe-button')).toBeDefined();
    });

    it('renders empty slot text if not owner and slot empty', () => {
        render(
            <PlanningMealSlot
                day="monday"
                mealType="breakfast"
                slotMeals={[]}
                isOwner={false}
                onAddRecipeClick={onAddRecipeClick}
                onRemoveRecipe={onRemoveRecipe}
                push={push}
                t={t}
            />
        );

        expect(screen.getByText('empty_slot')).toBeDefined();
    });
});
