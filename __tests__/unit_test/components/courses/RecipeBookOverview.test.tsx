import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeBookOverview from '@/app/courses/recipe-book-builder/RecipeBookOverview';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('RecipeBookOverview', () => {
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
            <RecipeBookOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        expect(
            screen.getByText('recipe_book_course_details.requirements_title')
        ).toBeDefined();
        expect(
            screen.getByText('recipe_book_course_details.req_styles_label')
        ).toBeDefined();
        expect(
            screen.getByText('recipe_book_course_details.req_selection_label')
        ).toBeDefined();
        expect(
            screen.getByText('recipe_book_course_details.req_limits_label')
        ).toBeDefined();
        expect(
            screen.getByText('recipe_book_course_details.req_download_label')
        ).toBeDefined();
    });

    it('enables the next step button only when the module is completed', () => {
        const { rerender } = render(
            <RecipeBookOverview
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
            <RecipeBookOverview
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
            <RecipeBookOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        const checkStyles = screen.getByLabelText(
            'recipe_book_course_details.checklist_styles'
        );
        const checkSelection = screen.getByLabelText(
            'recipe_book_course_details.checklist_selection'
        );
        const checkLimits = screen.getByLabelText(
            'recipe_book_course_details.checklist_limits'
        );
        const checkDownload = screen.getByLabelText(
            'recipe_book_course_details.checklist_download'
        );

        // Check first 3 boxes -> should not complete
        fireEvent.click(checkStyles);
        fireEvent.click(checkSelection);
        fireEvent.click(checkLimits);
        expect(markModuleCompletedMock).not.toHaveBeenCalled();

        // Check the final box -> should complete requirements module
        fireEvent.click(checkDownload);
        expect(markModuleCompletedMock).toHaveBeenCalledWith('requirements');
    });
});
