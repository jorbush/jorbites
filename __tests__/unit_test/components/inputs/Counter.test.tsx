import React from 'react';
import {
    render,
    screen,
    fireEvent,
    cleanup,
} from '@testing-library/react';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from 'vitest';
import Counter from '@/app/components/inputs/Counter';

describe('Counter', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with provided props', () => {
        render(
            <Counter
                title="Guests"
                subtitle="How many guests are coming?"
                value={2}
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText('Guests')).toBeDefined();
        expect(
            screen.getByText('How many guests are coming?')
        ).toBeDefined();
        expect(screen.getByText('2')).toBeDefined();
    });

    it('calls onChange with increased value when plus button is clicked', () => {
        render(
            <Counter
                title="Guests"
                subtitle="How many guests are coming?"
                value={2}
                onChange={mockOnChange}
            />
        );

        const plusButton =
            screen.getByTestId('AiOutlinePlus');
        fireEvent.click(plusButton.parentElement!);

        expect(mockOnChange).toHaveBeenCalledWith(3);
    });

    it('calls onChange with decreased value when minus button is clicked', () => {
        render(
            <Counter
                title="Guests"
                subtitle="How many guests are coming?"
                value={2}
                onChange={mockOnChange}
            />
        );

        const minusButton = screen.getByTestId(
            'AiOutlineMinus'
        );
        fireEvent.click(minusButton.parentElement!);

        expect(mockOnChange).toHaveBeenCalledWith(1);
    });

    it('does not call onChange when minus button is clicked and value is 1', () => {
        render(
            <Counter
                title="Guests"
                subtitle="How many guests are coming?"
                value={1}
                onChange={mockOnChange}
            />
        );

        const minusButton = screen.getByTestId(
            'AiOutlineMinus'
        );
        fireEvent.click(minusButton.parentElement!);

        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('displays the correct value', () => {
        render(
            <Counter
                title="Guests"
                subtitle="How many guests are coming?"
                value={5}
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText('5')).toBeDefined();
    });
});
