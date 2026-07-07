import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import QuestsOverview from '@/app/courses/quests/QuestsOverview';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('QuestsOverview', () => {
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
            <QuestsOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        expect(
            screen.getByText('quests_course_details.requirements_title')
        ).toBeDefined();
        expect(
            screen.getByText('quests_course_details.req_open_label')
        ).toBeDefined();
        expect(
            screen.getByText('quests_course_details.req_fulfill_label')
        ).toBeDefined();
        expect(
            screen.getByText('quests_course_details.req_status_label')
        ).toBeDefined();
        expect(
            screen.getByText('quests_course_details.req_likes_label')
        ).toBeDefined();
    });

    it('enables the next step button only when the module is completed', () => {
        const { rerender } = render(
            <QuestsOverview
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
            <QuestsOverview
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
            <QuestsOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        const checkOpen = screen.getByLabelText(
            'quests_course_details.checklist_open'
        );
        const checkFulfill = screen.getByLabelText(
            'quests_course_details.checklist_fulfill'
        );
        const checkStatus = screen.getByLabelText(
            'quests_course_details.checklist_status'
        );
        const checkLikes = screen.getByLabelText(
            'quests_course_details.checklist_likes'
        );

        // Check first 3 boxes -> should not complete
        fireEvent.click(checkOpen);
        fireEvent.click(checkFulfill);
        fireEvent.click(checkStatus);
        expect(markModuleCompletedMock).not.toHaveBeenCalled();

        // Check the final box -> should complete requirements module
        fireEvent.click(checkLikes);
        expect(markModuleCompletedMock).toHaveBeenCalledWith('requirements');
    });
});
