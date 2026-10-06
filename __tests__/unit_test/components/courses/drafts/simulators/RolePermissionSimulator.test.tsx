import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RolePermissionSimulator } from '@/app/components/courses/drafts/simulators/RolePermissionSimulator';
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

describe('RolePermissionSimulator', () => {
    const mockInteracted = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with Owner role by default and allows role switching', () => {
        render(<RolePermissionSimulator onInteracted={mockInteracted} />);

        const ownerBtn = screen.getByRole('button', {
            name: /drafts_course_details.role_owner/i,
        });
        const editorBtn = screen.getByRole('button', {
            name: /drafts_course_details.role_editor/i,
        });
        const viewerBtn = screen.getByRole('button', {
            name: /drafts_course_details.role_viewer/i,
        });

        // Default role is owner
        expect(ownerBtn.getAttribute('aria-pressed')).toBe('true');
        expect(editorBtn.getAttribute('aria-pressed')).toBe('false');
        expect(viewerBtn.getAttribute('aria-pressed')).toBe('false');

        // Owner action buttons
        expect(
            screen.getByText('drafts_course_details.invite_friends')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.save_draft')
        ).toBeDefined();

        // Switch to Editor role
        fireEvent.click(editorBtn);
        expect(editorBtn.getAttribute('aria-pressed')).toBe('true');
        expect(ownerBtn.getAttribute('aria-pressed')).toBe('false');
        expect(mockInteracted).toHaveBeenCalled();

        // Editor sees Leave Draft button instead of Invite
        expect(
            screen.getByText('drafts_course_details.leave_draft')
        ).toBeDefined();
        expect(
            screen.queryByText('drafts_course_details.invite_friends')
        ).toBeNull();
    });

    it('enforces read-only permissions when Viewer role is selected', () => {
        render(<RolePermissionSimulator onInteracted={mockInteracted} />);

        const viewerBtn = screen.getByRole('button', {
            name: /drafts_course_details.role_viewer/i,
        });

        fireEvent.click(viewerBtn);
        expect(mockInteracted).toHaveBeenCalled();

        // Viewer Mode banner is displayed
        expect(
            screen.getAllByText('drafts_course_details.viewer_banner_text')
                .length
        ).toBeGreaterThan(0);

        // Prep time and Ingredients inputs are readOnly
        const prepTimeInput = screen.getByLabelText(
            'drafts_course_details.prep_time_label'
        ) as HTMLInputElement;
        const ingredientsInput = screen.getByLabelText(
            'drafts_course_details.ingredients_label'
        ) as HTMLTextAreaElement;

        expect(prepTimeInput.readOnly).toBe(true);
        expect(ingredientsInput.readOnly).toBe(true);

        // Save button is disabled
        const saveDisabledBtn = screen.getByRole('button', {
            name: /drafts_course_details.save_disabled/i,
        });
        expect((saveDisabledBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it('triggers toasts when clicking Leave Draft and Save Draft', () => {
        render(<RolePermissionSimulator onInteracted={mockInteracted} />);

        // In Owner mode, save draft works
        const saveBtn = screen.getByRole('button', {
            name: /drafts_course_details.save_draft/i,
        });
        fireEvent.click(saveBtn);
        expect(toast.success).toHaveBeenCalledWith(
            'drafts_course_details.toast_draft_saved'
        );

        // Switch to Editor and leave draft
        const editorBtn = screen.getByRole('button', {
            name: /drafts_course_details.role_editor/i,
        });
        fireEvent.click(editorBtn);

        const leaveBtn = screen.getByRole('button', {
            name: /drafts_course_details.leave_draft/i,
        });
        fireEvent.click(leaveBtn);
        expect(toast.success).toHaveBeenCalledWith(
            'drafts_course_details.toast_left_draft'
        );
    });
});
