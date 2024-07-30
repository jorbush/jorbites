import React from 'react';
import {
    render,
    screen,
    cleanup,
} from '@testing-library/react';
import {
    describe,
    it,
    expect,
    vi,
    afterEach,
} from 'vitest';
import Input from '@/app/components/inputs/Input';
import {
    UseFormRegister,
    FieldValues,
    FieldErrors,
} from 'react-hook-form';

describe('Input', () => {
    const mockRegister: UseFormRegister<FieldValues> =
        vi.fn();
    const mockErrors: FieldErrors = {};

    afterEach(() => {
        cleanup();
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

        expect(
            screen.getByLabelText('Test Input')
        ).toBeDefined();
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
        expect(
            screen.getByTestId('BiDollar')
        ).toBeDefined();
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
        expect(input.className).toContain(
            'border-rose-500'
        );
        expect(input.className).toContain(
            'focus:border-rose-500'
        );
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
});
