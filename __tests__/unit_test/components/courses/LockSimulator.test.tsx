import {
    render,
    screen,
    fireEvent,
    cleanup,
    act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LockSimulator } from '@/app/courses/drafts/simulators/LockSimulator';
import React from 'react';
import toast from 'react-hot-toast';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (params?.seconds) return `${key} (${params.seconds}s)`;
            return key;
        },
    }),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => {
    const fn = vi.fn();
    (fn as any).success = vi.fn();
    (fn as any).error = vi.fn();
    return { default: fn };
});

describe('LockSimulator', () => {
    const mockInteracted = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('renders with step locked by default, countdown runs, and input is disabled', () => {
        render(<LockSimulator onInteracted={mockInteracted} />);

        // Locked banner with countdown
        expect(
            screen.getByText(/drafts_course_details.locked_by_chef/)
        ).toBeDefined();

        // Textarea disabled while locked
        const textarea = screen.getByLabelText(
            'drafts_course_details.ingredients_list_label'
        ) as HTMLTextAreaElement;
        expect(textarea.disabled).toBe(true);

        // Advance timer by 5 seconds
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        // Countdown decremented
        expect(screen.getAllByText(/25s/).length).toBeGreaterThan(0);
    });

    it('releases lock on button click, enables input, and allows typing', () => {
        render(<LockSimulator onInteracted={mockInteracted} />);

        const releaseBtn = screen.getByRole('button', {
            name: /drafts_course_details.release_lock_btn/i,
        });

        // Click release lock
        fireEvent.click(releaseBtn);
        expect(toast.success).toHaveBeenCalledWith(
            'drafts_course_details.toast_lock_released'
        );
        expect(mockInteracted).toHaveBeenCalled();

        // Step unlocked banner is shown
        expect(
            screen.getByText('drafts_course_details.unlocked_message')
        ).toBeDefined();

        // Textarea is enabled and allows input
        const textarea = screen.getByLabelText(
            'drafts_course_details.ingredients_list_label'
        ) as HTMLTextAreaElement;
        expect(textarea.disabled).toBe(false);

        fireEvent.change(textarea, {
            target: { value: 'Updated recipe ingredients' },
        });
        expect(textarea.value).toBe('Updated recipe ingredients');

        // Toggle lock back on
        const lockAgainBtn = screen.getByRole('button', {
            name: /drafts_course_details.simulate_lock_btn/i,
        });
        fireEvent.click(lockAgainBtn);
        expect(textarea.disabled).toBe(true);
    });
});
