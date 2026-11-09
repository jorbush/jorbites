import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MealPlannerExportsStep from '@/app/courses/meal-planner/steps/MealPlannerExportsStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('MealPlannerExportsStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the exports step title, descriptions, and calls onComplete when completed', () => {
        const onCompleteMock = vi.fn();
        render(<MealPlannerExportsStep onComplete={onCompleteMock} />);

        expect(
            screen.getByText('meal_planner_course_details.exports_info_title')
        ).toBeDefined();
        expect(
            screen.getByText('meal_planner_course_details.exports_desc1')
        ).toBeDefined();
        expect(
            screen.getByText('meal_planner_course_details.exports_desc2')
        ).toBeDefined();

        const completeBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.mark_completed/i,
        });
        fireEvent.click(completeBtn);

        expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
});
