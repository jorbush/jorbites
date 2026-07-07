import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MealPlannerOverview from '@/app/courses/meal-planner/MealPlannerOverview';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('MealPlannerOverview', () => {
    let markModuleCompletedMock: any;
    let onNextMock: any;

    beforeEach(() => {
        markModuleCompletedMock = vi.fn();
        onNextMock = vi.fn();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders labels and description texts correctly', () => {
        render(
            <MealPlannerOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        expect(
            screen.getByText('meal_planner_course_details.requirements_title')
        ).toBeDefined();
        expect(
            screen.getByText('meal_planner_course_details.req_privacy_label')
        ).toBeDefined();
        expect(
            screen.getByText('meal_planner_course_details.req_slots_label')
        ).toBeDefined();
        expect(
            screen.getByText('meal_planner_course_details.req_shopping_label')
        ).toBeDefined();
        expect(
            screen.getByText('meal_planner_course_details.req_calendar_label')
        ).toBeDefined();
    });

    it('enables the next step button only when the module is completed', () => {
        const { rerender } = render(
            <MealPlannerOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        // Next button is disabled initially
        const nextBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.next_step',
        });
        expect(nextBtn).toBeDefined();
        expect((nextBtn as HTMLButtonElement).disabled).toBe(true);

        // Rerender with requirements completed
        rerender(
            <MealPlannerOverview
                completedModules={{ requirements: true }}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        // Next button should now be enabled
        expect((nextBtn as HTMLButtonElement).disabled).toBe(false);

        // Clicking it triggers onNext callback
        fireEvent.click(nextBtn);
        expect(onNextMock).toHaveBeenCalled();
    });

    it('marks the module completed when all checkboxes are checked', () => {
        render(
            <MealPlannerOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        const checkPrivacy = screen.getByLabelText(
            'meal_planner_course_details.checklist_privacy'
        );
        const checkSlots = screen.getByLabelText(
            'meal_planner_course_details.checklist_slots'
        );
        const checkShopping = screen.getByLabelText(
            'meal_planner_course_details.checklist_shopping'
        );
        const checkCalendar = screen.getByLabelText(
            'meal_planner_course_details.checklist_calendar'
        );

        // Check first 3 boxes -> should not complete
        fireEvent.click(checkPrivacy);
        fireEvent.click(checkSlots);
        fireEvent.click(checkShopping);
        expect(markModuleCompletedMock).not.toHaveBeenCalled();

        // Check the final box -> should complete requirements module
        fireEvent.click(checkCalendar);
        expect(markModuleCompletedMock).toHaveBeenCalledWith('requirements');
    });
});
