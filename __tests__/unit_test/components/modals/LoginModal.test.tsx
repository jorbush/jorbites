import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import LoginModal from '@/app/components/modals/LoginModal';
import { SignInResponse } from 'next-auth/react';

// Mock dependencies
vi.mock('next-auth/react', () => ({
    signIn: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

const mockRegisterModalOpen = vi.fn();
const mockLoginModalClose = vi.fn();

vi.mock('@/app/hooks/useRegisterModal', () => ({
    default: () => ({
        onOpen: mockRegisterModalOpen,
    }),
}));

vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({
        isOpen: true,
        onClose: mockLoginModalClose,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('LoginModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the login modal', () => {
        render(<LoginModal />);
        expect(screen.getByText('welcome_back')).toBeDefined();
        expect(screen.getByRole('textbox', { name: /email/i })).toBeDefined();
        expect(screen.getByLabelText(/password/i)).toBeDefined();
        expect(
            screen.getByRole('button', {
                name: /login_google/i,
            })
        ).toBeDefined();
        expect(
            screen.getByRole('button', {
                name: /login_github/i,
            })
        ).toBeDefined();
    });

    it('submits the form with valid credentials', async () => {
        const signIn = vi.mocked(await import('next-auth/react')).signIn;
        signIn.mockResolvedValue({
            ok: true,
            error: null,
            status: 200,
            url: null,
        } as SignInResponse);

        render(<LoginModal />);

        fireEvent.change(screen.getByLabelText('email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('password'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByText('continue'));

        await waitFor(() => {
            expect(signIn).toHaveBeenCalledWith('credentials', {
                email: 'test@example.com',
                password: 'password123',
                redirect: false,
            });
        });
    });

    it('displays success toast on successful login', async () => {
        const signIn = vi.mocked(await import('next-auth/react')).signIn;
        const toast = vi.mocked(await import('react-hot-toast')).toast;

        signIn.mockResolvedValue({
            ok: true,
            error: null,
            status: 200,
            url: null,
        } as SignInResponse);

        render(<LoginModal />);

        fireEvent.change(screen.getByLabelText('email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('password'), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByText('continue'));

        await waitFor(() => {
            expect(signIn).toHaveBeenCalledWith('credentials', {
                email: 'test@example.com',
                password: 'password123',
                redirect: false,
            });
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('logged_in');
        });
    });

    it('displays error toast on failed login', async () => {
        const signIn = vi.mocked(await import('next-auth/react')).signIn;
        const toast = vi.mocked(await import('react-hot-toast')).toast;

        signIn.mockResolvedValue({
            ok: false,
            error: 'Invalid credentials',
            status: 401,
            url: null,
        } as SignInResponse);

        render(<LoginModal />);

        fireEvent.change(screen.getByLabelText('email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('password'), {
            target: { value: 'wrongpassword' },
        });

        fireEvent.click(screen.getByText('continue'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
        });
    });

    it('calls signIn with Google provider when Google button is clicked', async () => {
        const signIn = vi.mocked(await import('next-auth/react')).signIn;
        render(<LoginModal />);

        fireEvent.click(screen.getByText('login_google'));

        expect(signIn).toHaveBeenCalledWith('google');
    });

    it('calls signIn with GitHub provider when GitHub button is clicked', async () => {
        const signIn = vi.mocked(await import('next-auth/react')).signIn;
        render(<LoginModal />);

        fireEvent.click(screen.getByText('login_github'));

        expect(signIn).toHaveBeenCalledWith('github');
    });

    it('toggles to register modal when "create account" is clicked', async () => {
        render(<LoginModal />);

        fireEvent.click(screen.getByText('create_account'));

        await waitFor(() => {
            expect(mockRegisterModalOpen).toHaveBeenCalled();
            expect(mockLoginModalClose).toHaveBeenCalled();
        });
    });

    it('shows loading text while logging in', async () => {
        const signIn = vi.mocked(await import('next-auth/react')).signIn;

        // Create a delayed promise to test loading state
        let resolvePromise: Function;
        const delayedPromise = new Promise((resolve) => {
            resolvePromise = resolve;
        });

        signIn.mockImplementationOnce(() => delayedPromise as any);

        render(<LoginModal />);

        fireEvent.change(screen.getByLabelText('email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('password'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByText('continue'));

        // Should show loading text
        await waitFor(() => {
            expect(screen.getByText('logging_in')).toBeDefined();
        });

        // Resolve the promise to complete test
        // @ts-ignore
        resolvePromise({ ok: true });
    });

    it('transitions to 2FA verification step when signIn returns 2FA_REQUIRED and submits twoFactorCode', async () => {
        const signIn = vi.mocked(await import('next-auth/react')).signIn;
        const toast = vi.mocked(await import('react-hot-toast')).toast;

        signIn
            .mockResolvedValueOnce({
                ok: false,
                error: '2FA_REQUIRED',
                status: 401,
                url: null,
            } as SignInResponse)
            .mockResolvedValueOnce({
                ok: true,
                error: null,
                status: 200,
                url: null,
            } as SignInResponse);

        render(<LoginModal />);

        fireEvent.change(screen.getByLabelText('email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('password'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByText('continue'));

        await waitFor(() => {
            expect(screen.getByTestId('login-2fa-step')).toBeDefined();
        });

        fireEvent.change(screen.getByTestId('login-2fa-code-input'), {
            target: { value: '654321' },
        });

        fireEvent.click(screen.getByText('verify'));

        await waitFor(() => {
            expect(signIn).toHaveBeenLastCalledWith('credentials', {
                email: 'test@example.com',
                password: 'password123',
                twoFactorCode: '654321',
                redirect: false,
            });
            expect(toast.success).toHaveBeenCalledWith('logged_in');
        });
    });

    it('displays rate limit error toast when signIn returns TOO_MANY_2FA_ATTEMPTS', async () => {
        const signIn = vi.mocked(await import('next-auth/react')).signIn;
        const toast = vi.mocked(await import('react-hot-toast')).toast;

        signIn
            .mockResolvedValueOnce({
                ok: false,
                error: '2FA_REQUIRED',
                status: 401,
                url: null,
            } as SignInResponse)
            .mockResolvedValueOnce({
                ok: false,
                error: 'TOO_MANY_2FA_ATTEMPTS',
                status: 429,
                url: null,
            } as SignInResponse);

        render(<LoginModal />);

        fireEvent.change(screen.getByLabelText('email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('password'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByText('continue'));

        await waitFor(() => {
            expect(screen.getByTestId('login-2fa-step')).toBeDefined();
        });

        fireEvent.change(screen.getByTestId('login-2fa-code-input'), {
            target: { value: '654321' },
        });

        fireEvent.click(screen.getByText('verify'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('too_many_2fa_attempts');
        });
    });
});
