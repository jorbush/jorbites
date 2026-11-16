import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar, {
    EmptySearchResults,
} from '@/app/components/utils/SearchBar';

describe('<SearchBar />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders search input with placeholder and mobile tap-zoom prevention font sizing', () => {
        render(
            <SearchBar
                id="test-search"
                value=""
                onChange={vi.fn()}
                placeholder="Search items..."
                dataTestId="test-search-input"
            />
        );

        const input = screen.getByTestId('test-search-input');
        expect(input).toBeDefined();
        expect(input.getAttribute('placeholder')).toBe('Search items...');
        expect(input.getAttribute('aria-label')).toBe('Search items...');
        expect(input.classList.contains('text-base')).toBe(true);
        expect(input.classList.contains('md:text-sm')).toBe(true);
    });

    it('calls onChange when typing', () => {
        const handleChange = vi.fn();
        render(
            <SearchBar
                value=""
                onChange={handleChange}
                placeholder="Search..."
                dataTestId="test-search-input"
            />
        );

        fireEvent.change(screen.getByTestId('test-search-input'), {
            target: { value: 'pasta' },
        });
        expect(handleChange).toHaveBeenCalledWith('pasta');
    });

    it('hides clear button when value is empty and shows it when non-empty', () => {
        const handleChange = vi.fn();
        const { rerender } = render(
            <SearchBar
                value=""
                onChange={handleChange}
                placeholder="Search..."
                clearDataTestId="test-search-clear"
            />
        );

        expect(screen.queryByTestId('test-search-clear')).toBeNull();

        rerender(
            <SearchBar
                value="pasta"
                onChange={handleChange}
                placeholder="Search..."
                clearDataTestId="test-search-clear"
            />
        );

        const clearButton = screen.getByTestId('test-search-clear');
        expect(clearButton).toBeDefined();
        fireEvent.click(clearButton);
        expect(handleChange).toHaveBeenCalledWith('');
    });

    it('calls custom onClear handler when provided', () => {
        const handleChange = vi.fn();
        const handleClear = vi.fn();
        render(
            <SearchBar
                value="pasta"
                onChange={handleChange}
                onClear={handleClear}
                placeholder="Search..."
                clearDataTestId="test-search-clear"
            />
        );

        fireEvent.click(screen.getByTestId('test-search-clear'));
        expect(handleClear).toHaveBeenCalledTimes(1);
        expect(handleChange).not.toHaveBeenCalled();
    });
});

describe('<EmptySearchResults />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders message and clear button when onClearSearch is provided', () => {
        const onClearSearch = vi.fn();
        render(
            <EmptySearchResults
                message="No items match your search"
                onClearSearch={onClearSearch}
                dataTestId="empty-search"
                clearDataTestId="empty-search-clear"
            />
        );

        expect(screen.getByTestId('empty-search')).toBeDefined();
        expect(screen.getByText('No items match your search')).toBeDefined();
        fireEvent.click(screen.getByTestId('empty-search-clear'));
        expect(onClearSearch).toHaveBeenCalledTimes(1);
    });

    it('omits clear button when onClearSearch is not provided', () => {
        render(<EmptySearchResults message="No results" />);
        expect(screen.queryByRole('button')).toBeNull();
    });
});
