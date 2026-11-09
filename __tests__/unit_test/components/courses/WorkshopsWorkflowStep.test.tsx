import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WorkshopsWorkflowStep from '@/app/courses/workshops/WorkshopsWorkflowStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('WorkshopsWorkflowStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders CourseWorkflowStep and calls onComplete when completed', () => {
        const onCompleteMock = vi.fn();
        render(<WorkshopsWorkflowStep onComplete={onCompleteMock} />);

        expect(
            screen.getByText('workshops_course_details.workflow_title')
        ).toBeDefined();

        // Advance through steps
        for (let i = 1; i <= 4; i++) {
            const nextBtn = screen.getByRole('button', {
                name: 'contest_manager_course_details.next_step',
            });
            fireEvent.click(nextBtn);
        }

        const completeBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.mark_completed',
        });
        fireEvent.click(completeBtn);

        expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
});
