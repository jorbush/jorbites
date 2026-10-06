import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
    type Mock,
} from 'vitest';
import DraftsCourseOverview from '@/app/courses/drafts/DraftsCourseOverview';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('DraftsCourseOverview', () => {
    let markModuleCompletedMock: Mock;
    let onNextMock: Mock;

    beforeEach(() => {
        markModuleCompletedMock = vi.fn();
        onNextMock = vi.fn();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders labels and description texts correctly', () => {
        render(
            <DraftsCourseOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        expect(
            screen.getByText('drafts_course_details.requirements_title')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.req_solo_label')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.req_retention_label')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.req_cocooks_label')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.req_navigation_label')
        ).toBeDefined();
    });

    it('enables the next step button only when the module is completed', () => {
        const { rerender } = render(
            <DraftsCourseOverview
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
            <DraftsCourseOverview
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

    it('marks the module completed when all 4 checkboxes are checked', () => {
        render(
            <DraftsCourseOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        const checkSolo = screen.getByLabelText(
            'drafts_course_details.checklist_solo'
        );
        const checkRetention = screen.getByLabelText(
            'drafts_course_details.checklist_retention'
        );
        const checkCoCooks = screen.getByLabelText(
            'drafts_course_details.checklist_cocooks'
        );
        const checkNavigation = screen.getByLabelText(
            'drafts_course_details.checklist_navigation'
        );

        // Check first 3 boxes -> should not complete
        fireEvent.click(checkSolo);
        fireEvent.click(checkRetention);
        fireEvent.click(checkCoCooks);
        expect(markModuleCompletedMock).not.toHaveBeenCalled();

        // Check the 4th box -> should complete requirements module
        fireEvent.click(checkNavigation);
        expect(markModuleCompletedMock).toHaveBeenCalledWith('requirements');
    });
});
