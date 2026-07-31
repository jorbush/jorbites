import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ChangePasswordHeader } from '@/app/components/settings/ChangePasswordHeader';

describe('ChangePasswordHeader', () => {
    const defaultProps = {
        title: 'Change Password',
        requirementsText: 'Password must be at least 8 characters long',
        isEditing: false,
        isPending: false,
        onEditClick: vi.fn(),
        onCancelEdit: vi.fn(),
        changePasswordLabel: 'Change Password',
        cancelLabel: 'Cancel',
    };

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders title and requirements text correctly', () => {
        render(<ChangePasswordHeader {...defaultProps} />);
        expect(screen.getByText('Change Password')).toBeDefined();
        expect(
            screen.getByText('Password must be at least 8 characters long')
        ).toBeDefined();
    });

    it('renders edit button when not in edit mode and triggers onEditClick', () => {
        render(
            <ChangePasswordHeader
                {...defaultProps}
                isEditing={false}
            />
        );
        const editButton = screen.getByTestId('edit-password-button');
        expect(editButton).toBeDefined();
        expect(screen.queryByTestId('cancel-edit-button')).toBeNull();

        fireEvent.click(editButton);
        expect(defaultProps.onEditClick).toHaveBeenCalledTimes(1);
    });

    it('renders cancel button when in edit mode and triggers onCancelEdit', () => {
        render(
            <ChangePasswordHeader
                {...defaultProps}
                isEditing={true}
            />
        );
        const cancelButton = screen.getByTestId('cancel-edit-button');
        expect(cancelButton).toBeDefined();
        expect(screen.queryByTestId('edit-password-button')).toBeNull();

        fireEvent.click(cancelButton);
        expect(defaultProps.onCancelEdit).toHaveBeenCalledTimes(1);
    });

    it('disables cancel button when request is pending', () => {
        render(
            <ChangePasswordHeader
                {...defaultProps}
                isEditing={true}
                isPending={true}
            />
        );
        const cancelButton = screen.getByTestId(
            'cancel-edit-button'
        ) as HTMLButtonElement;
        expect(cancelButton.disabled).toBe(true);
    });
});
