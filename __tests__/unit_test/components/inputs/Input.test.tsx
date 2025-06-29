import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Input from '@/app/components/inputs/Input';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';
import {
    RECIPE_TITLE_MAX_LENGTH,
    CHAR_COUNT_WARNING_THRESHOLD,
} from '@/app/utils/constants';

describe('Input', () => {
    const mockOnChange = vi.fn();
    const mockRegister: UseFormRegister<FieldValues> = vi
        .fn()
        .mockImplementation((id: string) => ({
            onChange: mockOnChange,
            onBlur: vi.fn(),
            name: id,
            ref: vi.fn(),
        }));
    const mockErrors: FieldErrors = {};

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders correctly with basic props', () => {
        render(
            <Input
                id="test"
                label="Test Input"
                register={mockRegister}
                errors={mockErrors}
            />
        );

        expect(screen.getByLabelText('Test Input')).toBeDefined();
        expect(screen.getByRole('textbox')).toBeDefined();
    });

    it('applies formatPrice styling when formatPrice is true', () => {
        render(
            <Input
                id="price"
                label="Price"
                formatPrice
                register={mockRegister}
                errors={mockErrors}
            />
        );

        const input = screen.getByRole('textbox');
        expect(input.className).toContain('pl-9');
        expect(screen.getByTestId('BiDollar')).toBeDefined();
    });

    it('shows error styling when there is an error', () => {
        const errorsWithTestError = {
            test: {
                type: 'required',
                message: 'This field is required',
            },
        };
        render(
            <Input
                id="test"
                label="Test Input"
                register={mockRegister}
                errors={errorsWithTestError}
            />
        );

        const input = screen.getByRole('textbox');
        expect(input.className).toContain('border-rose-500');
        expect(input.className).toContain('focus:border-rose-500');
    });

    it('disables the input when disabled prop is true', () => {
        render(
            <Input
                id="test"
                label="Test Input"
                disabled
                register={mockRegister}
                errors={mockErrors}
            />
        );

        const input = screen.getByRole('textbox');
        expect(input.className).include('disabled');
    });

    it('uses the correct input type', () => {
        render(
            <Input
                id="test"
                label="Test Input"
                type="number"
                register={mockRegister}
                errors={mockErrors}
            />
        );

        const input = screen.getByRole('spinbutton');
        expect(input).toHaveProperty('type', 'number');
    });

    it('registers the input with react-hook-form', () => {
        render(
            <Input
                id="test"
                label="Test Input"
                register={mockRegister}
                errors={mockErrors}
                required
            />
        );

        expect(mockRegister).toHaveBeenCalledWith('test', {
            required: true,
        });
    });

    it('displays character count when maxLength is provided', () => {
        render(
            <Input
                id="test"
                label="Test Input"
                register={mockRegister}
                errors={mockErrors}
                maxLength={RECIPE_TITLE_MAX_LENGTH}
            />
        );

        const charCount = screen.getByTestId('char-count');
        expect(charCount.textContent).toBe(`0/${RECIPE_TITLE_MAX_LENGTH}`);
    });

    it('hides character count when below 80% threshold', () => {
        render(
            <Input
                id="test"
                label="Test Input"
                register={mockRegister}
                errors={mockErrors}
                maxLength={10}
            />
        );

        const charCount = screen.getByTestId('char-count');
        expect(charCount.className).toContain('opacity-0');
    });

    it('shows character count when at or above 80% threshold', () => {
        const testMaxLength = 10;
        const thresholdValue = Math.ceil(
            testMaxLength * CHAR_COUNT_WARNING_THRESHOLD
        ); // 8 chars = 80% of 10
        const mockRegisterWithValue = vi
            .fn()
            .mockImplementation((id: string) => ({
                onChange: vi.fn(),
                onBlur: vi.fn(),
                name: id,
                ref: vi.fn(),
                value: 'a'.repeat(thresholdValue), // Use threshold value
            }));

        render(
            <Input
                id="test"
                label="Test Input"
                register={mockRegisterWithValue}
                errors={mockErrors}
                maxLength={testMaxLength}
            />
        );

        const charCount = screen.getByTestId('char-count');
        expect(charCount.className).toContain('opacity-100');
    });

    it('updates character count when input changes', () => {
        render(
            <Input
                id="test"
                label="Test Input"
                register={mockRegister}
                errors={mockErrors}
                maxLength={RECIPE_TITLE_MAX_LENGTH}
            />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Hello' } });

        // Call the onChange handler with the new value
        mockOnChange({ target: { value: 'Hello' } });

        const charCount = screen.getByTestId('char-count');
        expect(charCount.textContent).toBe(`5/${RECIPE_TITLE_MAX_LENGTH}`);
    });

    it('enforces maxLength limit', () => {
        render(
            <Input
                id="test"
                label="Test Input"
                register={mockRegister}
                errors={mockErrors}
                maxLength={5}
            />
        );

        const input = screen.getByRole('textbox') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Hello World' } });

        // Call the onChange handler with the truncated value
        mockOnChange({ target: { value: 'Hello' } });

        expect(input.value).toBe('Hello');
    });

    it('initializes character count with existing value', () => {
        const mockRegisterWithValue = vi
            .fn()
            .mockImplementation((id: string) => ({
                onChange: vi.fn(),
                onBlur: vi.fn(),
                name: id,
                ref: vi.fn(),
                value: 'Initial',
            }));

        render(
            <Input
                id="test"
                label="Test Input"
                register={mockRegisterWithValue}
                errors={mockErrors}
                maxLength={RECIPE_TITLE_MAX_LENGTH}
            />
        );

        const charCount = screen.getByTestId('char-count');
        expect(charCount.textContent).toBe(`7/${RECIPE_TITLE_MAX_LENGTH}`);
    });
});
