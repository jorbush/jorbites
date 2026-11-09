import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MealPlannerSlotsStep from '@/app/courses/meal-planner/steps/MealPlannerSlotsStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('MealPlannerSlotsStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the slots step title, descriptions, and calls onComplete when completed', () => {
        const onCompleteMock = vi.fn();
        render(<MealPlannerSlotsStep onComplete={onCompleteMock} />);

        expect(
            screen.getByText('meal_planner_course_details.slots_info_title')
        ).toBeDefined();
        expect(
            screen.getByText('meal_planner_course_details.slots_desc1')
        ).toBeDefined();
        expect(
            screen.getByText('meal_planner_course_details.slots_desc2')
        ).toBeDefined();

        const completeBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.mark_completed/i,
        });
        fireEvent.click(completeBtn);

        expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
});
