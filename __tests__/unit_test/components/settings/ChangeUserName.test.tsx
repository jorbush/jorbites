import React from 'react';
import {
    render,
    screen,
    cleanup,
    fireEvent,
    waitFor,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ChangeUserNameSelector from '@/app/components/settings/ChangeUserName';
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

describe('ChangeUserNameSelector', () => {
    const mockOnSave = vi.fn();
    const mockSetSaveUserName = vi.fn();

    const mockUser: SafeUser = {
        id: '1',
        name: 'TestUser',
        email: 'test@example.com',
        image: null,
        emailVerified: null,
        hashedPassword: null,
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
        saveUserName: false,
        setSaveUserName: mockSetSaveUserName,
        onSave: mockOnSave,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockedAxios.put.mockResolvedValue({
            data: { ...mockUser, name: 'NewUser' },
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with current username', () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        expect(screen.getByText('update_username')).toBeDefined();
        expect(screen.getByText('username_requirements')).toBeDefined();
        expect(screen.getByText('TestUser')).toBeDefined();
        expect(screen.getByTestId('edit-username-icon')).toBeDefined();
    });

    it('renders correctly when user has no name', () => {
        render(
            <ChangeUserNameSelector
                {...defaultProps}
                currentUser={{ ...mockUser, name: null }}
            />
        );

        expect(screen.getByText('no_username')).toBeDefined();
        expect(screen.getByTestId('edit-username-icon')).toBeDefined();
    });

    it('enters edit mode when edit icon is clicked', () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));

        expect(screen.getByTestId('username-input')).toBeDefined();
        expect(screen.getByTestId('cancel-edit-button')).toBeDefined();
        expect(screen.getByText('8/10')).toBeDefined(); // Character counter shows length of "TestUser"
    });

    it('populates input with current username when editing', () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));

        const input = screen.getByTestId('username-input') as HTMLInputElement;
        expect(input.value).toBe('TestUser');
    });

    it('removes non-alphanumeric characters from input automatically', () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        const input = screen.getByTestId('username-input') as HTMLInputElement;

        // Test spaces
        fireEvent.change(input, { target: { value: 'Test User' } });
        expect(input.value).toBe('TestUser');

        // Test special characters
        fireEvent.change(input, { target: { value: 'User@123' } });
        expect(input.value).toBe('User123');

        // Test hyphens and underscores
        fireEvent.change(input, { target: { value: 'User-Name_123' } });
        expect(input.value).toBe('UserName12'); // Truncated to 10 chars

        // Test dots and other symbols
        fireEvent.change(input, { target: { value: 'User.Name!#$' } });
        expect(input.value).toBe('UserName');
    });

    it('preserves alphanumeric characters', () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        const input = screen.getByTestId('username-input') as HTMLInputElement;

        // Test mixed letters and numbers
        fireEvent.change(input, { target: { value: 'User123' } });
        expect(input.value).toBe('User123');

        // Test only letters
        fireEvent.change(input, { target: { value: 'UserName' } });
        expect(input.value).toBe('UserName');

        // Test only numbers
        fireEvent.change(input, { target: { value: '123456' } });
        expect(input.value).toBe('123456');

        // Test uppercase and lowercase
        fireEvent.change(input, { target: { value: 'UserNAME123' } });
        expect(input.value).toBe('UserNAME12'); // Truncated to 10 chars
    });

    it('limits input to maximum length', () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        const input = screen.getByTestId('username-input') as HTMLInputElement;

        fireEvent.change(input, {
            target: { value: 'ThisIsAVeryLongUsername' },
        });

        expect(input.value).toBe('ThisIsAVer'); // Should be truncated to 10 characters
        expect(screen.getByText('10/10')).toBeDefined();
    });

    it('shows save icon when username is changed', () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        const input = screen.getByTestId('username-input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: 'NewUser' } });

        expect(screen.getByTestId('save-username-icon')).toBeDefined();
    });

    it('does not show save icon when username is unchanged', () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        const input = screen.getByTestId('username-input') as HTMLInputElement;

        // Clear and retype the same name
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.change(input, { target: { value: 'TestUser' } });

        expect(screen.queryByTestId('save-username-icon')).toBeNull();
    });

    it('does not show save icon when input is empty', () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        const input = screen.getByTestId('username-input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: '' } });

        expect(screen.queryByTestId('save-username-icon')).toBeNull();
    });

    it('cancels editing when cancel button is clicked', () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        fireEvent.change(screen.getByTestId('username-input'), {
            target: { value: 'NewUser' },
        });

        fireEvent.click(screen.getByTestId('cancel-edit-button'));

        expect(screen.queryByTestId('username-input')).toBeNull();
        expect(screen.getByText('TestUser')).toBeDefined();
        expect(screen.getByTestId('edit-username-icon')).toBeDefined();
    });

    it('updates username when save icon is clicked', async () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        fireEvent.change(screen.getByTestId('username-input'), {
            target: { value: 'NewUser' },
        });

        fireEvent.click(screen.getByTestId('save-username-icon'));

        await waitFor(() => {
            expect(mockedAxios.put).toHaveBeenCalledWith('/api/userName/1', {
                userName: 'NewUser',
            });
        });

        expect(mockRouter.refresh).toHaveBeenCalled();
    });

    it('handles API error gracefully', async () => {
        const errorResponse = {
            response: {
                data: {
                    error: 'Username is already taken',
                },
            },
        };
        mockedAxios.put.mockRejectedValueOnce(errorResponse);

        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        fireEvent.change(screen.getByTestId('username-input'), {
            target: { value: 'TakenUser' },
        });

        fireEvent.click(screen.getByTestId('save-username-icon'));

        await waitFor(() => {
            expect(mockedAxios.put).toHaveBeenCalled();
        });

        // Should reset to original username on error
        const input = screen.getByTestId('username-input') as HTMLInputElement;
        expect(input.value).toBe('TestUser');
    });

    it('triggers save when saveUserName prop changes', async () => {
        const { rerender } = render(
            <ChangeUserNameSelector {...defaultProps} />
        );

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        fireEvent.change(screen.getByTestId('username-input'), {
            target: { value: 'NewUser' },
        });

        // Trigger save via prop change
        rerender(
            <ChangeUserNameSelector
                {...defaultProps}
                saveUserName={true}
            />
        );

        await waitFor(() => {
            expect(mockedAxios.put).toHaveBeenCalledWith('/api/userName/1', {
                userName: 'NewUser',
            });
        });

        expect(mockSetSaveUserName).toHaveBeenCalledWith(false);
        expect(mockOnSave).toHaveBeenCalled();
    });

    it('handles save trigger when no changes made', () => {
        const { rerender } = render(
            <ChangeUserNameSelector {...defaultProps} />
        );

        // Trigger save without making changes
        rerender(
            <ChangeUserNameSelector
                {...defaultProps}
                saveUserName={true}
            />
        );

        expect(mockedAxios.put).not.toHaveBeenCalled();
        expect(mockSetSaveUserName).toHaveBeenCalledWith(false);
        expect(mockOnSave).toHaveBeenCalled();
    });

    it('disables input and buttons during loading', async () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        fireEvent.change(screen.getByTestId('username-input'), {
            target: { value: 'NewUser' },
        });

        // Mock a delayed response
        let resolvePromise: (value: any) => void;
        const delayedPromise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        mockedAxios.put.mockReturnValueOnce(delayedPromise);

        fireEvent.click(screen.getByTestId('save-username-icon'));

        // Should be in loading state immediately after clicking save
        await waitFor(() => {
            const input = screen.getByTestId(
                'username-input'
            ) as HTMLInputElement;
            const cancelButton = screen.getByTestId(
                'cancel-edit-button'
            ) as HTMLButtonElement;
            expect(input.disabled).toBe(true);
            expect(cancelButton.disabled).toBe(true);
        });

        // Resolve the promise
        resolvePromise!({ data: { ...mockUser, name: 'NewUser' } });

        await waitFor(() => {
            // After the promise resolves, component should exit edit mode
            expect(screen.queryByTestId('username-input')).toBeNull();
            expect(screen.getByTestId('edit-username-icon')).toBeDefined();
        });
    });

    it('updates character counter correctly', () => {
        render(<ChangeUserNameSelector {...defaultProps} />);

        fireEvent.click(screen.getByTestId('edit-username-icon'));
        const input = screen.getByTestId('username-input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: 'Test' } });
        expect(screen.getByText('4/10')).toBeDefined();

        fireEvent.change(input, { target: { value: 'TestUser1' } });
        expect(screen.getByText('9/10')).toBeDefined();
    });
});
