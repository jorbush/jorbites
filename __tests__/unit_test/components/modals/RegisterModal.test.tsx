import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import RegisterModal from '@/app/components/modals/RegisterModal';
import { signIn } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('next-auth/react', () => ({
    signIn: vi.fn(),
}));

vi.mock('axios');
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

const mockRegisterModalClose = vi.fn();
const mockLoginModalOpen = vi.fn();

vi.mock('@/app/hooks/useRegisterModal', () => ({
    default: () => ({
        isOpen: true,
        onClose: mockRegisterModalClose,
    }),
}));

vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({
        onOpen: mockLoginModalOpen,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('RegisterModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the register modal', () => {
        render(<RegisterModal />);
        expect(screen.getByText('welcome_jorbites')).toBeDefined();
        expect(screen.getByRole('textbox', { name: /email/i })).toBeDefined();
        expect(screen.getByRole('textbox', { name: /name/i })).toBeDefined();
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
        (axios.post as any).mockResolvedValue({});

        render(<RegisterModal />);

        fireEvent.change(screen.getByLabelText('email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByLabelText('password'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByText('continue'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/register', {
                email: 'test@example.com',
                name: 'testuser',
                password: 'password123',
            });
            expect(toast.success).toHaveBeenCalledWith('Registered!');
            expect(mockRegisterModalClose).toHaveBeenCalled();
        });
    });

    it('displays error toast on failed registration', async () => {
        (axios.post as any).mockRejectedValue('Registration error');

        render(<RegisterModal />);

        fireEvent.change(screen.getByLabelText('email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByLabelText('password'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByText('continue'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Registration error');
        });
    });

    it('calls signIn with Google provider when Google button is clicked', async () => {
        render(<RegisterModal />);

        fireEvent.click(screen.getByText('login_google'));

        expect(signIn).toHaveBeenCalledWith('google');
    });

    it('calls signIn with GitHub provider when GitHub button is clicked', async () => {
        render(<RegisterModal />);

        fireEvent.click(screen.getByText('login_github'));

        expect(signIn).toHaveBeenCalledWith('github');
    });

    it('toggles to login modal when "login" is clicked', async () => {
        render(<RegisterModal />);

        fireEvent.click(screen.getByText('login'));

        await waitFor(() => {
            expect(mockRegisterModalClose).toHaveBeenCalled();
            expect(mockLoginModalOpen).toHaveBeenCalled();
        });
    });
});
