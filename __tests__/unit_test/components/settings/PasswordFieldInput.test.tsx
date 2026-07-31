import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { PasswordFieldInput } from '@/app/components/settings/PasswordFieldInput';
import { UseFormRegisterReturn } from 'react-hook-form';

describe('PasswordFieldInput', () => {
    const mockRegisterProps: UseFormRegisterReturn = {
        name: 'testPassword',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
    };

    const defaultProps = {
        id: 'test-password-id',
        label: 'Test Password Label',
        placeholder: 'Enter test password',
        registerProps: mockRegisterProps,
        showPassword: false,
        onToggleShowPassword: vi.fn(),
        disabled: false,
        testId: 'test-password-input',
        toggleTestId: 'toggle-test-password',
        hidePasswordLabel: 'Hide password',
        showPasswordLabel: 'Show password',
    };

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders label, input, and toggle button correctly', () => {
        render(<PasswordFieldInput {...defaultProps} />);
        const label = screen.getByText('Test Password Label');
        const input = screen.getByTestId(
            'test-password-input'
        ) as HTMLInputElement;
        const toggleButton = screen.getByTestId('toggle-test-password');

        expect(label).toBeDefined();
        expect(input).toBeDefined();
        expect(input.type).toBe('password');
        expect(input.placeholder).toBe('Enter test password');
        expect(toggleButton.getAttribute('aria-label')).toBe('Show password');
    });

    it('renders text input type and correct aria-label when showPassword is true', () => {
        render(
            <PasswordFieldInput
                {...defaultProps}
                showPassword={true}
            />
        );
        const input = screen.getByTestId(
            'test-password-input'
        ) as HTMLInputElement;
        const toggleButton = screen.getByTestId('toggle-test-password');

        expect(input.type).toBe('text');
        expect(toggleButton.getAttribute('aria-label')).toBe('Hide password');
    });

    it('calls onToggleShowPassword when toggle button is clicked', () => {
        render(<PasswordFieldInput {...defaultProps} />);
        const toggleButton = screen.getByTestId('toggle-test-password');

        fireEvent.click(toggleButton);
        expect(defaultProps.onToggleShowPassword).toHaveBeenCalledTimes(1);
    });

    it('displays error messages when provided', () => {
        render(
            <PasswordFieldInput
                {...defaultProps}
                errorText="Password too short"
                secondaryErrorText="Must be different from current"
            />
        );

        expect(screen.getByText('Password too short')).toBeDefined();
        expect(
            screen.getByText('Must be different from current')
        ).toBeDefined();
    });

    it('disables input when disabled prop is true', () => {
        render(
            <PasswordFieldInput
                {...defaultProps}
                disabled={true}
            />
        );
        const input = screen.getByTestId(
            'test-password-input'
        ) as HTMLInputElement;

        expect(input.disabled).toBe(true);
    });
});
