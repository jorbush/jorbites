import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ChangeProfileDetailsHeader from '@/app/components/settings/ChangeProfileDetailsHeader';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('ChangeProfileDetailsHeader Component', () => {
    afterEach(() => {
        cleanup();
    });

    const defaultProps = {
        isEditing: false,
        isDirty: false,
        isPending: false,
        onEdit: vi.fn(),
        onSave: vi.fn(),
        onCancel: vi.fn(),
    };

    it('renders title and edit button in view mode', () => {
        render(<ChangeProfileDetailsHeader {...defaultProps} />);

        expect(screen.getByText('profile_details')).toBeDefined();
        expect(screen.getByTestId('edit-profile-details')).toBeDefined();
        expect(screen.queryByTestId('save-profile-details')).toBeNull();
        expect(screen.queryByTestId('cancel-profile-details')).toBeNull();
    });

    it('triggers onEdit when edit button is clicked', () => {
        const onEdit = vi.fn();
        render(
            <ChangeProfileDetailsHeader
                {...defaultProps}
                onEdit={onEdit}
            />
        );

        fireEvent.click(screen.getByTestId('edit-profile-details'));
        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('renders cancel button and hides save button when editing but not dirty', () => {
        render(
            <ChangeProfileDetailsHeader
                {...defaultProps}
                isEditing={true}
                isDirty={false}
            />
        );

        expect(screen.queryByTestId('edit-profile-details')).toBeNull();
        expect(screen.getByTestId('cancel-profile-details')).toBeDefined();
        expect(screen.queryByTestId('save-profile-details')).toBeNull();
    });

    it('renders both save and cancel buttons when editing and dirty', () => {
        const onSave = vi.fn();
        const onCancel = vi.fn();

        render(
            <ChangeProfileDetailsHeader
                {...defaultProps}
                isEditing={true}
                isDirty={true}
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const saveButton = screen.getByTestId('save-profile-details');
        const cancelButton = screen.getByTestId('cancel-profile-details');

        expect(saveButton).toBeDefined();
        expect(cancelButton).toBeDefined();

        fireEvent.click(saveButton);
        expect(onSave).toHaveBeenCalledTimes(1);

        fireEvent.click(cancelButton);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('disables buttons when isPending is true', () => {
        render(
            <ChangeProfileDetailsHeader
                {...defaultProps}
                isEditing={true}
                isDirty={true}
                isPending={true}
            />
        );

        expect(
            (screen.getByTestId('save-profile-details') as HTMLButtonElement)
                .disabled
        ).toBe(true);
        expect(
            (screen.getByTestId('cancel-profile-details') as HTMLButtonElement)
                .disabled
        ).toBe(true);
    });
});
