import React from 'react';
import {
    render,
    screen,
    cleanup,
    fireEvent,
    waitFor,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import DeleteAccount from '@/app/components/settings/DeleteAccount';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { signOut } from 'next-auth/react';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                delete_account: 'Delete Account',
                delete_account_warning:
                    'This action cannot be undone. All your recipes and data will be permanently deleted.',
                action_cannot_be_undone: 'This action cannot be undone.',
                account_deleted_successfully: 'Account deleted successfully',
                deleting: 'Deleting...',
                delete: 'Delete',
                something_went_wrong: 'Something went wrong',
            };
            return translations[key] || key;
        },
    }),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('next-auth/react', () => ({
    signOut: vi.fn(),
}));

vi.mock('axios');

vi.mock('@/app/components/modals/ConfirmModal', () => ({
    default: ({ open, setIsOpen, onConfirm }: any) => (
        <div
            data-testid="confirm-modal"
            style={{ display: open ? 'block' : 'none' }}
        >
            <button
                data-testid="confirm-modal-confirm"
                onClick={onConfirm}
            >
                Confirm
            </button>
            <button
                data-testid="confirm-modal-cancel"
                onClick={() => setIsOpen(false)}
            >
                Cancel
            </button>
        </div>
    ),
}));

const mockAxios = axios as any;
const mockSignOut = signOut as any;

const mockCurrentUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    emailNotifications: true,
    favoriteIds: [],
    hashedPassword: null,
    level: 1,
    resetToken: null,
    resetTokenExpiry: null,
    verified: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    emailVerified: null,
} as unknown as SafeUser;

describe('DeleteAccount', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the delete account section correctly', () => {
        render(<DeleteAccount currentUser={mockCurrentUser} />);

        expect(screen.getByTestId('delete-account-selector')).toBeDefined();
        expect(screen.getByText('Delete Account')).toBeDefined();
        expect(screen.getByText('This action cannot be undone.')).toBeDefined();
        expect(screen.getByTestId('delete-account-button')).toBeDefined();
    });

    it('shows delete button with correct styling', () => {
        render(<DeleteAccount currentUser={mockCurrentUser} />);

        const deleteButton = screen.getByTestId('delete-account-button');
        expect(deleteButton).toBeDefined();
        expect(deleteButton.textContent).toBe('Delete');
        expect(deleteButton.className).toContain('bg-red-50');
        expect(deleteButton.className).toContain('text-red-700');
    });

    it('opens confirm modal when delete button is clicked', () => {
        render(<DeleteAccount currentUser={mockCurrentUser} />);

        const confirmModal = screen.getByTestId('confirm-modal');
        expect(confirmModal.style.display).toBe('none');

        const deleteButton = screen.getByTestId('delete-account-button');
        fireEvent.click(deleteButton);

        expect(confirmModal.style.display).toBe('block');
    });

    it('closes confirm modal when cancel is clicked', () => {
        render(<DeleteAccount currentUser={mockCurrentUser} />);

        // Open modal
        const deleteButton = screen.getByTestId('delete-account-button');
        fireEvent.click(deleteButton);

        const confirmModal = screen.getByTestId('confirm-modal');
        expect(confirmModal.style.display).toBe('block');

        // Close modal
        const cancelButton = screen.getByTestId('confirm-modal-cancel');
        fireEvent.click(cancelButton);

        expect(confirmModal.style.display).toBe('none');
    });

    it('calls delete API and signs out user on confirmation', async () => {
        mockAxios.delete.mockResolvedValue({ data: { success: true } });
        mockSignOut.mockResolvedValue({});

        render(<DeleteAccount currentUser={mockCurrentUser} />);

        // Open modal and confirm
        const deleteButton = screen.getByTestId('delete-account-button');
        fireEvent.click(deleteButton);

        const confirmButton = screen.getByTestId('confirm-modal-confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockAxios.delete).toHaveBeenCalledWith('/api/user/1');
            expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
        });
    });

    it('shows loading state during deletion', async () => {
        mockAxios.delete.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<DeleteAccount currentUser={mockCurrentUser} />);

        // Open modal and confirm
        const deleteButton = screen.getByTestId('delete-account-button');
        fireEvent.click(deleteButton);

        const confirmButton = screen.getByTestId('confirm-modal-confirm');
        fireEvent.click(confirmButton);

        // Check loading state
        expect(screen.getByText('Deleting...')).toBeDefined();
        expect((deleteButton as HTMLButtonElement).disabled).toBe(true);
    });

    it('handles API error gracefully', async () => {
        const errorMessage = 'Failed to delete account';
        mockAxios.delete.mockRejectedValue({
            response: { data: { error: errorMessage } },
        });

        const { toast } = await import('react-hot-toast');

        render(<DeleteAccount currentUser={mockCurrentUser} />);

        // Open modal and confirm
        const deleteButton = screen.getByTestId('delete-account-button');
        fireEvent.click(deleteButton);

        const confirmButton = screen.getByTestId('confirm-modal-confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(errorMessage);
        });
    });

    it('handles API error without specific message', async () => {
        mockAxios.delete.mockRejectedValue(new Error('Network error'));

        const { toast } = await import('react-hot-toast');

        render(<DeleteAccount currentUser={mockCurrentUser} />);

        // Open modal and confirm
        const deleteButton = screen.getByTestId('delete-account-button');
        fireEvent.click(deleteButton);

        const confirmButton = screen.getByTestId('confirm-modal-confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Something went wrong');
        });
    });

    it('does not render when no current user is provided', () => {
        render(<DeleteAccount currentUser={null} />);

        expect(screen.getByTestId('delete-account-selector')).toBeDefined();
        expect(screen.getByTestId('delete-account-button')).toBeDefined();
    });

    it('prevents deletion when already loading', async () => {
        mockAxios.delete.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<DeleteAccount currentUser={mockCurrentUser} />);

        // Open modal and confirm
        const deleteButton = screen.getByTestId('delete-account-button');
        fireEvent.click(deleteButton);

        const confirmButton = screen.getByTestId('confirm-modal-confirm');

        // Click confirm button multiple times
        fireEvent.click(confirmButton);
        fireEvent.click(confirmButton);
        fireEvent.click(confirmButton);

        await waitFor(() => {
            // Should only be called once despite multiple clicks
            expect(mockAxios.delete).toHaveBeenCalledTimes(1);
        });
    });

    it('shows success message after successful deletion', async () => {
        mockAxios.delete.mockResolvedValue({ data: { success: true } });
        mockSignOut.mockResolvedValue({});

        const { toast } = await import('react-hot-toast');

        render(<DeleteAccount currentUser={mockCurrentUser} />);

        // Open modal and confirm
        const deleteButton = screen.getByTestId('delete-account-button');
        fireEvent.click(deleteButton);

        const confirmButton = screen.getByTestId('confirm-modal-confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith(
                'Account deleted successfully'
            );
        });
    });
});
