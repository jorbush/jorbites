import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '@/app/components/inputs/SearchBar';

describe('<SearchBar />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders input with accessible label, placeholder, and mobile zoom prevention classes', () => {
        render(
            <SearchBar
                value=""
                onChange={vi.fn()}
                placeholder="Search items..."
                dataTestId="test-search"
            />
        );

        const input = screen.getByTestId('test-search') as HTMLInputElement;
        expect(input.placeholder).toBe('Search items...');
        expect(input.getAttribute('aria-label')).toBe('Search items...');
        expect(input.classList.contains('text-base')).toBe(true);
        expect(input.classList.contains('md:text-sm')).toBe(true);
    });

    it('calls onChange when user types', () => {
        const handleChange = vi.fn();
        render(
            <SearchBar
                value=""
                onChange={handleChange}
                placeholder="Search items..."
                dataTestId="test-search"
            />
        );

        const input = screen.getByTestId('test-search');
        fireEvent.change(input, { target: { value: 'pasta' } });
        expect(handleChange).toHaveBeenCalledWith('pasta');
    });

    it('shows clear button only when value is non-empty and invokes onChange and onClear on click', () => {
        const handleChange = vi.fn();
        const handleClear = vi.fn();

        const { rerender } = render(
            <SearchBar
                value=""
                onChange={handleChange}
                onClear={handleClear}
                placeholder="Search items..."
                clearLabel="Clear"
                dataTestId="test-search"
            />
        );

        expect(screen.queryByTestId('test-search-clear')).toBeNull();

        rerender(
            <SearchBar
                value="pasta"
                onChange={handleChange}
                onClear={handleClear}
                placeholder="Search items..."
                clearLabel="Clear"
                dataTestId="test-search"
            />
        );

        const clearButton = screen.getByTestId('test-search-clear');
        expect(clearButton.getAttribute('aria-label')).toBe('Clear');
        fireEvent.click(clearButton);

        expect(handleChange).toHaveBeenCalledWith('');
        expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it('wraps in a form and calls onSubmit when submitted', () => {
        const handleSubmit = vi.fn();

        render(
            <SearchBar
                value="tacos"
                onChange={vi.fn()}
                onSubmit={handleSubmit}
                placeholder="Search items..."
                showSubmitButton
                submitLabel="Go"
                dataTestId="test-search"
            />
        );

        const submitButton = screen.getByTestId('test-search-submit');
        expect(submitButton.textContent).toBe('Go');
        fireEvent.submit(submitButton.closest('form')!);

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
});
