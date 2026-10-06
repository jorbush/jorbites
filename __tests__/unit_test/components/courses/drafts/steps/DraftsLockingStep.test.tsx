import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DraftsLockingStep from '@/app/components/courses/drafts/steps/DraftsLockingStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock LockSimulator to verify composition
vi.mock('@/app/components/courses/drafts/simulators/LockSimulator', () => ({
    default: () => (
        <div data-testid="mock-lock-simulator">MockLockSimulator</div>
    ),
}));

describe('DraftsLockingStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the locking step title, paragraphs, and simulator', () => {
        const onCompleteMock = vi.fn();
        render(<DraftsLockingStep onComplete={onCompleteMock} />);

        expect(
            screen.getByText('drafts_course_details.locking_title')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.locking_desc1')
        ).toBeDefined();
        expect(screen.getByTestId('mock-lock-simulator')).toBeDefined();

        const completeBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.mark_completed/i,
        });
        fireEvent.click(completeBtn);
        expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
});
