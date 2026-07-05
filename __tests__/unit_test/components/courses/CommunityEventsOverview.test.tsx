import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CommunityEventsOverview from '@/app/courses/community-events/CommunityEventsOverview';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('CommunityEventsOverview', () => {
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
            <CommunityEventsOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        expect(
            screen.getByText('community_events_course_details.overview_title')
        ).toBeDefined();
        expect(
            screen.getByText(
                'community_events_course_details.evt_challenge_label'
            )
        ).toBeDefined();
        expect(
            screen.getByText(
                'community_events_course_details.evt_contest_label'
            )
        ).toBeDefined();
        expect(
            screen.getByText('community_events_course_details.evt_temp_label')
        ).toBeDefined();
        expect(
            screen.getByText('community_events_course_details.evt_voting_label')
        ).toBeDefined();
    });

    it('enables the next step button only when the module is completed', () => {
        const { rerender } = render(
            <CommunityEventsOverview
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
            <CommunityEventsOverview
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
            <CommunityEventsOverview
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        const checkChallenge = screen.getByLabelText(
            'community_events_course_details.checklist_challenge'
        );
        const checkContest = screen.getByLabelText(
            'community_events_course_details.checklist_contest'
        );
        const checkTemp = screen.getByLabelText(
            'community_events_course_details.checklist_temp'
        );
        const checkVoting = screen.getByLabelText(
            'community_events_course_details.checklist_voting'
        );

        // Check first 3 boxes -> should not complete
        fireEvent.click(checkChallenge);
        fireEvent.click(checkContest);
        fireEvent.click(checkTemp);
        expect(markModuleCompletedMock).not.toHaveBeenCalled();

        // Check the final box -> should complete overview module
        fireEvent.click(checkVoting);
        expect(markModuleCompletedMock).toHaveBeenCalledWith('overview');
    });
});
