import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WorkshopsWhitelistStep from '@/app/courses/workshops/WorkshopsWhitelistStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('WorkshopsWhitelistStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders CourseInfoStep with whitelist descriptions and triggers onComplete', () => {
        const onCompleteMock = vi.fn();
        render(<WorkshopsWhitelistStep onComplete={onCompleteMock} />);

        expect(
            screen.getByText('workshops_course_details.whitelist_info_title')
        ).toBeDefined();
        expect(
            screen.getByText('workshops_course_details.whitelist_desc1')
        ).toBeDefined();
        expect(
            screen.getByText('workshops_course_details.whitelist_desc2')
        ).toBeDefined();

        const completeBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.mark_completed',
        });
        fireEvent.click(completeBtn);

        expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
});
