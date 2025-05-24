import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResetPasswordClient from '@/app/reset-password/[token]/ResetPasswordClient';
import axios from 'axios';

vi.mock('axios');
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

// Mock the react-i18next module
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('ResetPasswordClient', () => {
    const mockToken = 'valid-token';

    beforeEach(() => {
        vi.clearAllMocks();
        // Default behavior for token validation
        vi.mocked(axios.get).mockResolvedValue({ data: { valid: true } });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders reset password form correctly', async () => {
        const { getByText, getByLabelText } = render(
            <ResetPasswordClient token={mockToken} />
        );

        await waitFor(() => {
            expect(getByText('reset_your_password')).toBeDefined();
            expect(getByLabelText('new_password')).toBeDefined();
            expect(getByLabelText('confirm_password')).toBeDefined();
            expect(getByText('update_password')).toBeDefined();
        });
    });

    it('validates token on mount', async () => {
        render(<ResetPasswordClient token={mockToken} />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/password-reset/validate/${mockToken}`
            );
        });
    });

    it('shows invalid token message when token is invalid', async () => {
        // Mock invalid token response
        vi.mocked(axios.get).mockResolvedValue({ data: { valid: false } });

        const { getByText } = render(
            <ResetPasswordClient token="invalid-token" />
        );

        await waitFor(() => {
            expect(getByText('invalid_link')).toBeDefined();
            expect(getByText('link_expired_or_used')).toBeDefined();
            expect(getByText('back_to_home')).toBeDefined();
        });
    });

    it('shows error when API validation fails', async () => {
        // Mock API error
        vi.mocked(axios.get).mockRejectedValue(new Error('API Error'));
        const toast = await import('react-hot-toast');

        render(<ResetPasswordClient token="error-token" />);

        await waitFor(() => {
            expect(toast.toast.error).toHaveBeenCalledWith(
                'invalid_or_expired_link'
            );
        });
    });

    it('shows error when password reset fails', async () => {
        vi.mocked(axios.post).mockRejectedValue({
            response: { data: { error: 'Reset failed' } },
        });
        const toast = await import('react-hot-toast');

        const { getByText, getByLabelText } = render(
            <ResetPasswordClient token={mockToken} />
        );

        await waitFor(() => {
            const passwordInput = getByLabelText('new_password');
            const confirmInput = getByLabelText('confirm_password');
            const submitButton = getByText('update_password');

            fireEvent.change(passwordInput, {
                target: { value: 'newPassword123' },
            });
            fireEvent.change(confirmInput, {
                target: { value: 'newPassword123' },
            });
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
            expect(toast.toast.error).toHaveBeenCalledWith('Reset failed');
        });
    });

    it('disables form inputs while loading', async () => {
        // Mock a slow response to test loading state
        vi.mocked(axios.post).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
        );

        const { getByText, getByLabelText } = render(
            <ResetPasswordClient token={mockToken} />
        );

        await waitFor(() => {
            const passwordInput = getByLabelText('new_password');
            const confirmInput = getByLabelText('confirm_password');
            const submitButton = getByText('update_password');

            fireEvent.change(passwordInput, {
                target: { value: 'newPassword123' },
            });
            fireEvent.change(confirmInput, {
                target: { value: 'newPassword123' },
            });
            fireEvent.click(submitButton);
        });

        // Check for loading state
        await waitFor(() => {
            expect(getByText('updating')).toBeDefined();
        });
    });
});
