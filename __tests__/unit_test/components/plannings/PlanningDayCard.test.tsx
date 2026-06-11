import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
});
