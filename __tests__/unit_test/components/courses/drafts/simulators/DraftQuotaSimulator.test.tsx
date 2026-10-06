import {
    render,
    screen,
    fireEvent,
    cleanup,
    act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DraftQuotaSimulator } from '@/app/components/courses/drafts/simulators/DraftQuotaSimulator';
import React from 'react';
import toast from 'react-hot-toast';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('DraftQuotaSimulator', () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    const mockInteracted = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        vi.stubGlobal('navigator', {
            ...navigator,
            clipboard: {
                writeText: mockWriteText,
            },
        });
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('renders initial drafts and displays slot counter', () => {
        render(<DraftQuotaSimulator onInteracted={mockInteracted} />);

        expect(screen.getByText("Grandma's Fresh Lasagna")).toBeDefined();
        expect(screen.getByText('Creamy Lemon Risotto')).toBeDefined();
        expect(screen.getByText('Matcha Soufflé Pancakes')).toBeDefined();
        expect(screen.getByText(/3 \/ 5/)).toBeDefined();

        // Screen reader text for progress
        const srElements = screen.getAllByText(
            'drafts_course_details.steps_progress_sr'
        );
        expect(srElements.length).toBeGreaterThan(0);
    });

    it('adds new drafts and enforces maximum 5 draft quota limit', () => {
        render(<DraftQuotaSimulator onInteracted={mockInteracted} />);

        const addBtn = screen.getByRole('button', {
            name: /drafts_course_details.add_draft_btn/i,
        });

        // Add 4th draft
        fireEvent.click(addBtn);
        expect(screen.getByText(/4 \/ 5/)).toBeDefined();
        expect(mockInteracted).toHaveBeenCalledTimes(1);

        // Add 5th draft (max slots)
        fireEvent.click(addBtn);
        expect(screen.getByText(/5 \/ 5/)).toBeDefined();
        expect(mockInteracted).toHaveBeenCalledTimes(2);

        // Attempt to add 6th draft -> should be blocked and show error message
        fireEvent.click(addBtn);
        expect(
            screen.getByText(/drafts_course_details\.max_slots_reached/)
        ).toBeDefined();
        // Count remains 5/5
        expect(screen.getByText(/5 \/ 5/)).toBeDefined();
        expect(mockInteracted).toHaveBeenCalledTimes(2);
    });

    it('deletes a draft and frees up a slot', () => {
        render(<DraftQuotaSimulator onInteracted={mockInteracted} />);

        const deleteButtons = screen.getAllByRole('button', {
            name: /drafts_course_details.delete_draft_btn/i,
        });
        expect(deleteButtons.length).toBe(3);

        fireEvent.click(deleteButtons[0]);
        expect(screen.getByText(/2 \/ 5/)).toBeDefined();
        expect(toast.success).toHaveBeenCalledWith(
            'drafts_course_details.toast_draft_removed'
        );
        expect(mockInteracted).toHaveBeenCalled();
    });

    it('copies invite link to clipboard and resets status after 2s', async () => {
        render(<DraftQuotaSimulator onInteracted={mockInteracted} />);

        const copyBtn = screen.getByRole('button', {
            name: /drafts_course_details.copy_link_btn/i,
        });

        fireEvent.click(copyBtn);
        expect(mockWriteText).toHaveBeenCalledWith(
            expect.stringContaining(
                'https://jorbites.com/recipes/draft/share?token='
            )
        );
        expect(toast.success).toHaveBeenCalledWith(
            'drafts_course_details.link_copied'
        );
        expect(screen.getByText('drafts_course_details.copied')).toBeDefined();

        // Fast-forward 2 seconds
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(
            screen.getByText('drafts_course_details.copy_link_btn')
        ).toBeDefined();
    });

    it('regenerates invite link with a new token', () => {
        render(<DraftQuotaSimulator onInteracted={mockInteracted} />);

        const regenBtn = screen.getByRole('button', {
            name: /drafts_course_details.regenerate_link_tooltip/i,
        });

        fireEvent.click(regenBtn);
        expect(toast.success).toHaveBeenCalledWith(
            'drafts_course_details.link_regenerated'
        );
        expect(mockInteracted).toHaveBeenCalled();
    });
});
