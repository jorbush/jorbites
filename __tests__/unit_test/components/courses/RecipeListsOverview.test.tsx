import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeListsOverview from '@/app/courses/recipe-lists/RecipeListsOverview';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('RecipeListsOverview', () => {
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
            <RecipeListsOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        expect(
            screen.getByText('recipe_lists_course_details.requirements_title')
        ).toBeDefined();
        expect(
            screen.getByText('recipe_lists_course_details.req_auto_label')
        ).toBeDefined();
        expect(
            screen.getByText('recipe_lists_course_details.req_custom_label')
        ).toBeDefined();
        expect(
            screen.getByText('recipe_lists_course_details.req_privacy_label')
        ).toBeDefined();
        expect(
            screen.getByText('recipe_lists_course_details.req_multi_label')
        ).toBeDefined();
    });

    it('enables the next step button only when the module is completed', () => {
        const { rerender } = render(
            <RecipeListsOverview
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

        // Rerender with overview completed
        rerender(
            <RecipeListsOverview
                completedModules={{ overview: true }}
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
            <RecipeListsOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        const checkAuto = screen.getByLabelText(
            'recipe_lists_course_details.checklist_auto'
        );
        const checkCustom = screen.getByLabelText(
            'recipe_lists_course_details.checklist_custom'
        );
        const checkPrivacy = screen.getByLabelText(
            'recipe_lists_course_details.checklist_privacy'
        );
        const checkMulti = screen.getByLabelText(
            'recipe_lists_course_details.checklist_multi'
        );

        // Check first 3 boxes -> should not complete
        fireEvent.click(checkAuto);
        fireEvent.click(checkCustom);
        fireEvent.click(checkPrivacy);
        expect(markModuleCompletedMock).not.toHaveBeenCalled();

        // Check the final box -> should complete overview module
        fireEvent.click(checkMulti);
        expect(markModuleCompletedMock).toHaveBeenCalledWith('overview');
    });
});
