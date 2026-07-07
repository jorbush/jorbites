import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import JorbitesBasicsOverview from '@/app/courses/jorbites-basics/JorbitesBasicsOverview';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('JorbitesBasicsOverview', () => {
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
            <JorbitesBasicsOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        expect(
            screen.getByText(
                'jorbites_basics_course_details.requirements_title'
            )
        ).toBeDefined();
        expect(
            screen.getByText('jorbites_basics_course_details.req_recipes_label')
        ).toBeDefined();
        expect(
            screen.getByText(
                'jorbites_basics_course_details.req_interactions_label'
            )
        ).toBeDefined();
        expect(
            screen.getByText('jorbites_basics_course_details.req_lists_label')
        ).toBeDefined();
        expect(
            screen.getByText(
                'jorbites_basics_course_details.req_settings_label'
            )
        ).toBeDefined();
    });

    it('enables the next step button only when the module is completed', () => {
        const { rerender } = render(
            <JorbitesBasicsOverview
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
            <JorbitesBasicsOverview
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
            <JorbitesBasicsOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        const checkRecipes = screen.getByLabelText(
            'jorbites_basics_course_details.checklist_recipes'
        );
        const checkInteractions = screen.getByLabelText(
            'jorbites_basics_course_details.checklist_interactions'
        );
        const checkLists = screen.getByLabelText(
            'jorbites_basics_course_details.checklist_lists'
        );
        const checkSettings = screen.getByLabelText(
            'jorbites_basics_course_details.checklist_settings'
        );

        // Check first 3 boxes -> should not complete
        fireEvent.click(checkRecipes);
        fireEvent.click(checkInteractions);
        fireEvent.click(checkLists);
        expect(markModuleCompletedMock).not.toHaveBeenCalled();

        // Check the final box -> should complete requirements module
        fireEvent.click(checkSettings);
        expect(markModuleCompletedMock).toHaveBeenCalledWith('requirements');
    });
});
