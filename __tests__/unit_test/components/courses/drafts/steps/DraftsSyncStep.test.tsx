import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DraftsSyncStep from '@/app/components/courses/drafts/steps/DraftsSyncStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('DraftsSyncStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the sync step title and descriptive paragraphs', () => {
        const onCompleteMock = vi.fn();
        render(<DraftsSyncStep onComplete={onCompleteMock} />);

        expect(
            screen.getByText('drafts_course_details.sync_title')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.sync_desc1')
        ).toBeDefined();

        const completeBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.mark_completed/i,
        });
        fireEvent.click(completeBtn);
        expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
});
