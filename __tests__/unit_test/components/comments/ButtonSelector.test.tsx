import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ButtonSelector from '@/app/components/comments/ButtonSelector';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<
                'oldest_first' | 'newest_first',
                string
            > = {
                oldest_first: 'Oldest First',
                newest_first: 'Newest First',
            };
            return translations[key as 'oldest_first' | 'newest_first'] || key;
        },
    }),
}));

// Mock react-icons to avoid rendering actual icons
vi.mock('react-icons/fa', () => ({
    FaSortAmountDown: vi.fn(() => null),
    FaSortAmountUp: vi.fn(() => null),
}));

describe('<ButtonSelector />', () => {
    const mockOnSortChange = vi.fn();

    beforeEach(() => {
        mockOnSortChange.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with initial ascending sort order', () => {
        render(
            <ButtonSelector
                sortOrder="asc"
                onSortChange={mockOnSortChange}
            />
        );

        // Check if the button displays 'Oldest First'
        expect(screen.getByText('Oldest First')).toBeDefined();

        // Verify the ascending icon is used
        expect(FaSortAmountUp).toHaveBeenCalled();
    });

    it('renders with initial descending sort order', () => {
        render(
            <ButtonSelector
                sortOrder="desc"
                onSortChange={mockOnSortChange}
            />
        );

        // Check if the button displays 'Newest First'
        expect(screen.getByText('Newest First')).toBeDefined();

        // Verify the descending icon is used
        expect(FaSortAmountDown).toHaveBeenCalled();
    });

    it('toggles sort order when button is clicked', () => {
        render(
            <ButtonSelector
                sortOrder="asc"
                onSortChange={mockOnSortChange}
            />
        );

        // Initially in ascending order
        expect(screen.getByText('Oldest First')).toBeDefined();

        // Click to toggle
        fireEvent.click(screen.getByRole('button'));

        // Verify onSortChange was called with descending order
        expect(mockOnSortChange).toHaveBeenCalledWith('desc');

        // Verify the button now shows 'Newest First'
        expect(screen.getByText('Newest First')).toBeDefined();
    });

    it('updates internal state when sortOrder prop changes', () => {
        const { rerender } = render(
            <ButtonSelector
                sortOrder="asc"
                onSortChange={mockOnSortChange}
            />
        );

        // Initially in ascending order
        expect(screen.getByText('Oldest First')).toBeDefined();

        // Rerender with new sortOrder
        rerender(
            <ButtonSelector
                sortOrder="desc"
                onSortChange={mockOnSortChange}
            />
        );

        // Verify the button now shows 'Newest First'
        expect(screen.getByText('Newest First')).toBeDefined();
    });
});
