import React from 'react';
import {
    render,
    screen,
    cleanup,
    fireEvent,
    waitFor,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ChangePassword from '@/app/components/settings/ChangePassword';
import { SafeUser } from '@/app/types';
import axios from 'axios';

// Mock dependencies
vi.mock('axios');
const mockedAxios = axios as any;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockRouter = {
    refresh: vi.fn(),
};

vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
}));

describe('ChangePassword', () => {
    const mockOnSave = vi.fn();
    const mockSetSavePassword = vi.fn();

    const mockUser: SafeUser = {
        id: '1',
        name: 'TestUser',
        email: 'test@example.com',
        image: null,
        emailVerified: null,
        hashedPassword: 'hashedPassword',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        favoriteIds: [],
        emailNotifications: false,
        level: 0,
        verified: false,
        badges: [],
        resetToken: null,
        resetTokenExpiry: null,
    };

    const defaultProps = {
        currentUser: mockUser,
        savePassword: false,
        setSavePassword: mockSetSavePassword,
        onSave: mockOnSave,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockedAxios.patch.mockResolvedValue({
            data: { success: true, message: 'Password updated successfully' },
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly in non-editing mode', () => {
        render(<ChangePassword {...defaultProps} />);

        expect(screen.getByText('change_password')).toBeDefined();
        expect(screen.getByText('password_requirements')).toBeDefined();
        expect(screen.getByTestId('edit-password-icon')).toBeDefined();
        expect(screen.getByTestId('change-password-selector')).toBeDefined();
    });

    it('enters edit mode when edit icon is clicked', () => {
        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        expect(screen.getByTestId('current-password-input')).toBeDefined();
        expect(screen.getByTestId('new-password-input')).toBeDefined();
        expect(screen.getByTestId('confirm-password-input')).toBeDefined();
        expect(screen.getByTestId('cancel-edit-button')).toBeDefined();
        expect(screen.queryByTestId('edit-password-icon')).toBeNull();
    });

    it('shows password toggle buttons in edit mode', () => {
        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        expect(screen.getByTestId('toggle-current-password')).toBeDefined();
        expect(screen.getByTestId('toggle-new-password')).toBeDefined();
        expect(screen.getByTestId('toggle-confirm-password')).toBeDefined();
    });

    it('toggles password visibility when toggle buttons are clicked', () => {
        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        const currentPasswordInput = screen.getByTestId(
            'current-password-input'
        ) as HTMLInputElement;
        const newPasswordInput = screen.getByTestId(
            'new-password-input'
        ) as HTMLInputElement;
        const confirmPasswordInput = screen.getByTestId(
            'confirm-password-input'
        ) as HTMLInputElement;

        // Initially should be password type
        expect(currentPasswordInput.type).toBe('password');
        expect(newPasswordInput.type).toBe('password');
        expect(confirmPasswordInput.type).toBe('password');

        // Toggle visibility
        fireEvent.click(screen.getByTestId('toggle-current-password'));
        fireEvent.click(screen.getByTestId('toggle-new-password'));
        fireEvent.click(screen.getByTestId('toggle-confirm-password'));

        expect(currentPasswordInput.type).toBe('text');
        expect(newPasswordInput.type).toBe('text');
        expect(confirmPasswordInput.type).toBe('text');
    });

    it('cancels edit mode when cancel button is clicked', () => {
        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        // Fill in some data
        fireEvent.change(screen.getByTestId('current-password-input'), {
            target: { value: 'currentpass' },
        });

        fireEvent.click(screen.getByTestId('cancel-edit-button'));

        expect(screen.getByTestId('edit-password-icon')).toBeDefined();
        expect(screen.queryByTestId('current-password-input')).toBeNull();
    });

    it('shows validation error for short new password', () => {
        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: '123' },
        });

        expect(screen.getByText('password_too_short')).toBeDefined();
    });

    it('shows validation error when passwords do not match', () => {
        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.change(screen.getByTestId('confirm-password-input'), {
            target: { value: 'differentpassword' },
        });

        expect(screen.getByText('passwords_dont_match')).toBeDefined();
    });

    it('shows validation error when new password is same as current', () => {
        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('current-password-input'), {
            target: { value: 'currentpass' },
        });

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: 'currentpass' },
        });

        expect(
            screen.getByText('new_password_must_be_different')
        ).toBeDefined();
    });

    it('shows save button when all validations pass', () => {
        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('current-password-input'), {
            target: { value: 'currentpass' },
        });

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.change(screen.getByTestId('confirm-password-input'), {
            target: { value: 'newpassword123' },
        });

        expect(screen.getByTestId('save-password-button')).toBeDefined();
    });

    it('does not show save button when validations fail', () => {
        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('current-password-input'), {
            target: { value: 'currentpass' },
        });

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: '123' }, // Too short
        });

        expect(screen.queryByTestId('save-password-button')).toBeNull();
    });

    it('calls API and shows success message when save button is clicked', async () => {
        const { toast } = await import('react-hot-toast');

        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('current-password-input'), {
            target: { value: 'currentpass' },
        });

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.change(screen.getByTestId('confirm-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.click(screen.getByTestId('save-password-button'));

        await waitFor(() => {
            expect(mockedAxios.patch).toHaveBeenCalledWith('/api/password/1', {
                currentPassword: 'currentpass',
                newPassword: 'newpassword123',
            });
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('password_updated');
        });

        expect(mockRouter.refresh).toHaveBeenCalled();
    });

    it('shows error message when API call fails', async () => {
        const { toast } = await import('react-hot-toast');
        mockedAxios.patch.mockRejectedValue({
            response: { data: { error: 'Current password is incorrect' } },
        });

        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('current-password-input'), {
            target: { value: 'wrongpass' },
        });

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.change(screen.getByTestId('confirm-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.click(screen.getByTestId('save-password-button'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'Current password is incorrect'
            );
        });
    });

    it('triggers save when savePassword prop becomes true and validation passes', async () => {
        const { rerender } = render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('current-password-input'), {
            target: { value: 'currentpass' },
        });

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.change(screen.getByTestId('confirm-password-input'), {
            target: { value: 'newpassword123' },
        });

        // Trigger save via prop
        rerender(
            <ChangePassword
                {...defaultProps}
                savePassword={true}
            />
        );

        await waitFor(() => {
            expect(mockedAxios.patch).toHaveBeenCalled();
        });

        expect(mockSetSavePassword).toHaveBeenCalledWith(false);
        expect(mockOnSave).toHaveBeenCalled();
    });

    it('does not trigger save when savePassword prop becomes true but validation fails', () => {
        const { rerender } = render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('current-password-input'), {
            target: { value: 'currentpass' },
        });

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: '123' }, // Too short
        });

        // Trigger save via prop
        rerender(
            <ChangePassword
                {...defaultProps}
                savePassword={true}
            />
        );

        expect(mockedAxios.patch).not.toHaveBeenCalled();
        expect(mockSetSavePassword).toHaveBeenCalledWith(false);
        expect(mockOnSave).toHaveBeenCalled();
    });

    it('clears form when password is successfully updated', async () => {
        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('current-password-input'), {
            target: { value: 'currentpass' },
        });

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.change(screen.getByTestId('confirm-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.click(screen.getByTestId('save-password-button'));

        await waitFor(() => {
            expect(screen.getByTestId('edit-password-icon')).toBeDefined();
        });
    });

    it('disables inputs during loading state', async () => {
        mockedAxios.patch.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('current-password-input'), {
            target: { value: 'currentpass' },
        });

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.change(screen.getByTestId('confirm-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.click(screen.getByTestId('save-password-button'));

        const currentPasswordInput = screen.getByTestId(
            'current-password-input'
        ) as HTMLInputElement;
        const newPasswordInput = screen.getByTestId(
            'new-password-input'
        ) as HTMLInputElement;
        const confirmPasswordInput = screen.getByTestId(
            'confirm-password-input'
        ) as HTMLInputElement;

        expect(currentPasswordInput.disabled).toBe(true);
        expect(newPasswordInput.disabled).toBe(true);
        expect(confirmPasswordInput.disabled).toBe(true);
    });

    it('shows loading text on save button during API call', async () => {
        mockedAxios.patch.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<ChangePassword {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-password-icon'));

        fireEvent.change(screen.getByTestId('current-password-input'), {
            target: { value: 'currentpass' },
        });

        fireEvent.change(screen.getByTestId('new-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.change(screen.getByTestId('confirm-password-input'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.click(screen.getByTestId('save-password-button'));

        expect(screen.getByText('saving')).toBeDefined();
    });
});
