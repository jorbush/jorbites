import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DraftsInvitesStep from '@/app/components/courses/drafts/steps/DraftsInvitesStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock DraftQuotaSimulator to verify composition
vi.mock(
    '@/app/components/courses/drafts/simulators/DraftQuotaSimulator',
    () => ({
        default: () => (
            <div data-testid="mock-quota-simulator">MockQuotaSimulator</div>
        ),
    })
);

describe('DraftsInvitesStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the step title, descriptive paragraphs, and child simulator', () => {
        const onCompleteMock = vi.fn();
        render(<DraftsInvitesStep onComplete={onCompleteMock} />);

        expect(
            screen.getByText('drafts_course_details.invites_title')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.invites_desc1')
        ).toBeDefined();
        expect(screen.getByTestId('mock-quota-simulator')).toBeDefined();

        const completeBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.mark_completed/i,
        });
        fireEvent.click(completeBtn);
        expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
});
