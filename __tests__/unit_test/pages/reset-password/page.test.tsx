import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResetPasswordPage from '@/app/reset-password/[token]/page';

// Mock the components used in the page
vi.mock('@/app/components/utils/EmptyState', () => ({
    default: () => <div data-testid="empty-state">Empty State</div>,
}));

vi.mock('@/app/reset-password/[token]/ResetPasswordClient', () => ({
    default: ({ token }: { token: string }) => (
        <div data-testid="reset-password-client">
            Reset Password Client: {token}
        </div>
    ),
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        query: {},
    })),
}));

describe('ResetPasswordPage', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders ResetPasswordClient when token is provided', async () => {
        const mockToken = 'valid-token';
        const { getByTestId, getByText } = render(
            await ResetPasswordPage({
                params: Promise.resolve({ token: mockToken }),
            })
        );

        await waitFor(() => {
            expect(getByTestId('reset-password-client')).toBeTruthy();
            expect(
                getByText(`Reset Password Client: ${mockToken}`)
            ).toBeTruthy();
        });
    });

    it('renders EmptyState when no token is provided', async () => {
        const { getByTestId, getByText } = render(
            await ResetPasswordPage({
                params: Promise.resolve({ token: undefined }),
            })
        );

        await waitFor(() => {
            expect(getByTestId('empty-state')).toBeTruthy();
            expect(getByText('Empty State')).toBeTruthy();
        });
    });

    it('handles null props gracefully', async () => {
        const { getByTestId } = render(
            await ResetPasswordPage({ params: Promise.resolve({}) })
        );

        await waitFor(() => {
            expect(getByTestId('empty-state')).toBeTruthy();
        });
    });

    it('handles promise rejection gracefully', async () => {
        // Mock console.error to avoid polluting test output
        const originalConsoleError = console.error;
        console.error = vi.fn();

        try {
            const rejectedPromise = Promise.reject(
                new Error('Failed to get params')
            );

            // We expect this to throw an error
            await expect(async () => {
                render(await ResetPasswordPage({ params: rejectedPromise }));
            }).rejects.toThrow();
        } finally {
            // Restore console.error
            console.error = originalConsoleError;
        }
    });
});
