import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EmptySearchResults from '@/app/components/utils/EmptySearchResults';

describe('<EmptySearchResults />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders title, subtitle, and clear button when onClearSearch is provided', () => {
        const handleClear = vi.fn();
        render(
            <EmptySearchResults
                title="No results found"
                subtitle="Try another keyword"
                clearLabel="Reset search"
                onClearSearch={handleClear}
                dataTestId="empty-results"
                clearTestId="empty-results-clear"
            />
        );

        expect(screen.getByTestId('empty-results')).toBeDefined();
        expect(screen.getByText('No results found')).toBeDefined();
        expect(screen.getByText('Try another keyword')).toBeDefined();

        const clearButton = screen.getByTestId('empty-results-clear');
        expect(clearButton.textContent).toBe('Reset search');
        fireEvent.click(clearButton);
        expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it('omits clear button when onClearSearch is not provided', () => {
        render(<EmptySearchResults title="Nothing here" />);
        expect(screen.getByText('Nothing here')).toBeDefined();
        expect(screen.queryByRole('button')).toBeNull();
    });
});
