import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { PlanningHeader } from '@/app/components/plannings/PlanningHeader';

vi.mock('@/app/components/utils/Avatar', () => ({
    default: () => <div data-testid="avatar" />,
}));

vi.mock('@/app/utils/date-utils', () => ({
    formatDate: (date: any, lang: string) => `formatted-date-${lang}`,
}));

describe('PlanningHeader', () => {
    const mockPlanning = {
        id: 'plan-123',
        name: 'Weekly Keto',
        description: 'Low carb plan',
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        user: {
            id: 'user-1',
            name: 'John Doe',
            image: 'john.png',
        },
    } as any;

    const t = (key: string) => key;
    const push = vi.fn();
    const togglePrivacy = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders name, description, date and avatar correctly', () => {
        render(
            <PlanningHeader
                editedName="Weekly Keto"
                editedDesc="Low carb plan"
                planning={mockPlanning}
                language="en"
                isOwner={true}
                isPrivate={false}
                isSaving={false}
                togglePrivacy={togglePrivacy}
                push={push}
                t={t}
            />
        );

        expect(screen.getByText('Weekly Keto')).toBeDefined();
        expect(screen.getByText('Low carb plan')).toBeDefined();
        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('formatted-date-en')).toBeDefined();
        expect(screen.getByTestId('avatar')).toBeDefined();
    });

    it('triggers togglePrivacy when lock button clicked', () => {
        render(
            <PlanningHeader
                editedName="Weekly Keto"
                editedDesc="Low carb plan"
                planning={mockPlanning}
                language="en"
                isOwner={true}
                isPrivate={true}
                isSaving={false}
                togglePrivacy={togglePrivacy}
                push={push}
                t={t}
            />
        );

        const lockBtn = screen.getByRole('button', { name: 'private' });
        fireEvent.click(lockBtn);
        expect(togglePrivacy).toHaveBeenCalledTimes(1);
    });

    it('hides nutrition and allergen summary when plan has no meals', () => {
        render(
            <PlanningHeader
                editedName="Weekly Keto"
                editedDesc="Low carb plan"
                planning={{ ...mockPlanning, meals: [] }}
                language="en"
                isOwner={true}
                isPrivate={false}
                isSaving={false}
                togglePrivacy={togglePrivacy}
                push={push}
                t={t}
            />
        );

        expect(screen.queryByTestId('planning-nutrition-summary')).toBeNull();
        expect(screen.queryByTestId('weekly-macro-averages')).toBeNull();
        expect(screen.queryByTestId('plan-allergens-summary')).toBeNull();
    });

    it('renders weekly daily macro averages and plan-wide EU-14 allergens', () => {
        const meals = [
            {
                id: 'm1',
                day: 'monday',
                mealType: 'breakfast',
                recipe: {
                    id: 'r1',
                    title: 'Oatmeal',
                    calories: 400,
                    protein: 20,
                    carbohydrates: 60,
                    fat: 8,
                    fiber: 10,
                    allergens: ['gluten', 'milk'],
                },
            },
            {
                id: 'm2',
                day: 'monday',
                mealType: 'dinner',
                recipe: {
                    id: 'r2',
                    title: 'Salmon Bowl',
                    calories: 800,
                    protein: 60,
                    carbohydrates: 40,
                    fat: 32,
                    fiber: 6,
                    allergens: ['fish'],
                },
            },
            {
                id: 'm3',
                day: 'tuesday',
                mealType: 'lunch',
                recipe: {
                    id: 'r3',
                    title: 'Egg Omelette',
                    calories: 600,
                    protein: 40,
                    carbohydrates: 0,
                    fat: 40,
                    fiber: null,
                    ingredients: ['3 eggs', '50g cheddar cheese'],
                },
            },
        ];

        render(
            <PlanningHeader
                editedName="Weekly Keto"
                editedDesc="Low carb plan"
                planning={mockPlanning}
                meals={meals}
                mealsCount={meals.length}
                language="en"
                isOwner={true}
                isPrivate={false}
                isSaving={false}
                togglePrivacy={togglePrivacy}
                push={push}
                t={t}
            />
        );

        expect(screen.getByTestId('planning-nutrition-summary')).toBeDefined();
        expect(screen.getByTestId('weekly-macro-averages')).toBeDefined();

        // Calories: mon=1200, tue=600 -> avg 900
        expect(screen.getByTestId('weekly-avg-calories').textContent).toContain(
            '900 kcal'
        );
        // Protein: mon=80, tue=40 -> avg 60
        expect(screen.getByTestId('weekly-avg-protein').textContent).toContain(
            '60g'
        );
        // Carbs: mon=100, tue=0 -> avg 50
        expect(
            screen.getByTestId('weekly-avg-carbohydrates').textContent
        ).toContain('50g');
        // Fat: mon=40, tue=40 -> avg 40
        expect(screen.getByTestId('weekly-avg-fat').textContent).toContain(
            '40g'
        );
        // Fiber: mon=16, tue=null -> avg 16 (unaudited day ignored)
        expect(screen.getByTestId('weekly-avg-fiber').textContent).toContain(
            '16g'
        );

        // Plan allergens: gluten, eggs (from ingredients), fish, milk (from stored + ingredients)
        expect(screen.getByTestId('plan-allergens-summary')).toBeDefined();
        expect(screen.getByTestId('plan-allergen-badge-gluten')).toBeDefined();
        expect(screen.getByTestId('plan-allergen-badge-eggs')).toBeDefined();
        expect(screen.getByTestId('plan-allergen-badge-fish')).toBeDefined();
        const milkBadge = screen.getByTestId('plan-allergen-badge-milk');
        expect(milkBadge.getAttribute('title')).toContain('Oatmeal');
        expect(milkBadge.getAttribute('title')).toContain('Egg Omelette');
        expect(screen.getByTestId('plan-allergen-disclaimer')).toBeDefined();
    });

    it('renders configured daily nutrition goals in the summary even before meals are added', () => {
        render(
            <PlanningHeader
                editedName="Weekly Keto"
                editedDesc="Low carb plan"
                planning={{ ...mockPlanning, meals: [] }}
                dailyTargets={{
                    targetCalories: 2000,
                    targetProtein: 140,
                    targetCarbohydrates: 180,
                    targetFat: 65,
                }}
                language="en"
                isOwner={true}
                isPrivate={false}
                isSaving={false}
                togglePrivacy={togglePrivacy}
                push={push}
                t={t}
            />
        );

        expect(screen.getByTestId('planning-nutrition-summary')).toBeDefined();
        expect(screen.getByTestId('plan-daily-targets-summary')).toBeDefined();
        expect(
            screen.getByTestId('plan-target-calories').textContent
        ).toContain('2000 kcal');
        expect(screen.getByTestId('plan-target-protein').textContent).toContain(
            '140g'
        );
        expect(
            screen.getByTestId('plan-target-carbohydrates').textContent
        ).toContain('180g');
        expect(screen.getByTestId('plan-target-fat').textContent).toContain(
            '65g'
        );
    });
});
