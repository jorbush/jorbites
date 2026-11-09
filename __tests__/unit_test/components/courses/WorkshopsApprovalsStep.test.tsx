import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WorkshopsApprovalsStep from '@/app/courses/workshops/WorkshopsApprovalsStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('WorkshopsApprovalsStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders CourseInfoStep with approvals descriptions and triggers onComplete', () => {
        const onCompleteMock = vi.fn();
        render(<WorkshopsApprovalsStep onComplete={onCompleteMock} />);

        expect(
            screen.getByText('workshops_course_details.approval_info_title')
        ).toBeDefined();
        expect(
            screen.getByText('workshops_course_details.approval_desc1')
        ).toBeDefined();
        expect(
            screen.getByText('workshops_course_details.approval_desc2')
        ).toBeDefined();

        const completeBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.mark_completed',
        });
        fireEvent.click(completeBtn);

        expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
});
