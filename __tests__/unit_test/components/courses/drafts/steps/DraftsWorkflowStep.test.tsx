import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DraftsWorkflowStep from '@/app/components/courses/drafts/steps/DraftsWorkflowStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('DraftsWorkflowStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the workflow step title and advances through all 5 steps to completion', () => {
        const onCompleteMock = vi.fn();
        render(<DraftsWorkflowStep onComplete={onCompleteMock} />);

        expect(
            screen.getByText('drafts_course_details.workflow_title')
        ).toBeDefined();

        // Advance through steps 1 to 4 using "next_step"
        for (let i = 0; i < 4; i++) {
            const nextBtn = screen.getByRole('button', {
                name: /contest_manager_course_details.next_step/i,
            });
            fireEvent.click(nextBtn);
        }

        // On step 5 (final step), click "mark_completed"
        const markCompletedBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.mark_completed/i,
        });
        fireEvent.click(markCompletedBtn);

        expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
});
