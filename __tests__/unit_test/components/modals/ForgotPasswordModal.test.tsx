import React from 'react';
import {
    render,
    fireEvent,
    waitFor,
    screen,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ForgotPasswordModal from '@/app/components/modals/ForgotPasswordModal';
import axios from 'axios';

// Mocks
vi.mock('axios');
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock the hooks
vi.mock('@/app/hooks/useForgotPasswordModal', () => ({
    default: () => ({
        isOpen: true,
        onOpen: vi.fn(),
        onClose: vi.fn(),
    }),
}));

vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({
        isOpen: false,
        onOpen: vi.fn(),
        onClose: vi.fn(),
    }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock utils/validation
vi.mock('@/app/utils/validation', () => ({
    validateEmail: vi.fn((email) => email.includes('@')),
}));

// Mock the components used in the modal
vi.mock('@/app/components/modals/Modal', () => {
    return {
        default: ({
            isOpen,
            title,
            body,
            actionLabel,
            onSubmit,
            disabled,
        }: any) =>
            isOpen ? (
                <div data-testid="modal">
                    <h2>{title}</h2>
                    <div data-testid="modal-body">{body}</div>
                    <button
                        data-testid="action-button"
                        onClick={onSubmit}
                        disabled={disabled}
                    >
                        {actionLabel}
                    </button>
                </div>
            ) : null,
    };
});

vi.mock('@/app/components/inputs/Input', () => {
    return {
        default: ({ id, label, register, disabled, errors, required }: any) => (
            <div data-testid={`input-${id}`}>
                <label>{label}</label>
                <input
                    {...register(id, { required })}
                    disabled={disabled}
                    data-testid={id}
                />
                {errors[id] && <span>Error</span>}
            </div>
        ),
    };
});

vi.mock('@/app/components/navigation/Heading', () => {
    return {
        default: ({ title, subtitle }: any) => (
            <div data-testid="heading">
                <h3>{title}</h3>
                {subtitle && <p>{subtitle}</p>}
            </div>
        ),
    };
});

// Mock useForm functionality
vi.mock('react-hook-form', () => {
    const registerMock = vi.fn();
    let formValues: Record<string, any> = {};

    return {
        useForm: () => ({
            register: (name: string) => {
                registerMock(name);
                return {
                    name,
                    onChange: (e: { target: { value: any } }) => {
                        formValues[name] = e.target.value;
                    },
                    onBlur: vi.fn(),
                    ref: vi.fn(),
                };
            },
            handleSubmit: (callback: any) => (e?: any) => {
                if (e?.preventDefault) e.preventDefault();
                return callback(formValues);
            },
            formState: { errors: {} },
            getValues: () => formValues,
        }),
        FieldValues: class {},
        SubmitHandler: class {},
    };
});

describe('ForgotPasswordModal', () => {
    afterEach(() => {
        cleanup();
    });
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(axios.post).mockClear();
    });

    it('renders correctly when open', () => {
        render(<ForgotPasswordModal />);

        expect(screen.getByTestId('modal')).toBeDefined();
        expect(screen.getByText('forgot_password')).toBeDefined();
        expect(screen.getByTestId('input-email')).toBeDefined();
        expect(screen.getByText('send_reset_link')).toBeDefined();
    });

    it('validates email before submission', async () => {
        const { validateEmail } = await import('@/app/utils/validation');
        const toast = await import('react-hot-toast');

        render(<ForgotPasswordModal />);

        const actionButton = screen.getByTestId('action-button');

        // Test with invalid email
        vi.mocked(validateEmail).mockReturnValueOnce(false);

        fireEvent.click(actionButton);

        await waitFor(() => {
            expect(toast.toast.error).toHaveBeenCalledWith(
                'error_validate_email'
            );
            expect(axios.post).not.toHaveBeenCalled();
        });
    });

    it('shows loading state while submitting', async () => {
        const { validateEmail } = await import('@/app/utils/validation');

        // Email validation passes
        vi.mocked(validateEmail).mockReturnValue(true);

        // Create a delayed promise to test loading state
        let resolvePromise: Function;
        const delayedPromise = new Promise((resolve) => {
            resolvePromise = resolve;
        });

        vi.mocked(axios.post).mockImplementationOnce(
            () => delayedPromise as any
        );

        render(<ForgotPasswordModal />);
        const actionButton = screen.getByTestId('action-button');

        // Submit form
        fireEvent.click(actionButton);

        // Should be in loading state
        await waitFor(() => {
            expect(actionButton).toHaveProperty('disabled', true);
        });

        // Resolve the promise to complete test
        // @ts-ignore
        resolvePromise({});
    });

    it('shows success state after email is sent', async () => {
        const { validateEmail } = await import('@/app/utils/validation');
        const toast = await import('react-hot-toast');

        // Email validation passes
        vi.mocked(validateEmail).mockReturnValue(true);
        vi.mocked(axios.post).mockResolvedValueOnce({});

        render(<ForgotPasswordModal />);

        const actionButton = screen.getByTestId('action-button');
        fireEvent.click(actionButton);

        await waitFor(() => {
            expect(toast.toast.success).toHaveBeenCalledWith('reset_link_sent');
            expect(screen.getByText('check_your_email')).toBeDefined();
            expect(screen.getByText('back_to_login')).toBeDefined();
            expect(screen.getByText('ok')).toBeDefined();
        });
    });

    it('shows error toast when API call fails', async () => {
        const { validateEmail } = await import('@/app/utils/validation');
        const toast = await import('react-hot-toast');

        // Email validation passes
        vi.mocked(validateEmail).mockReturnValue(true);
        vi.mocked(axios.post).mockRejectedValueOnce(new Error('API Error'));

        render(<ForgotPasswordModal />);

        const actionButton = screen.getByTestId('action-button');
        fireEvent.click(actionButton);

        await waitFor(() => {
            expect(toast.toast.error).toHaveBeenCalledWith(
                'error_sending_email'
            );
            // Should still be on the email input screen, not success screen
            expect(screen.queryByText('check_your_email')).toBeNull();
        });
    });
});
