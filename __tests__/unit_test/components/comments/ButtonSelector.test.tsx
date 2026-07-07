import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ButtonSelector from '@/app/components/comments/ButtonSelector';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<
                'oldest_first' | 'newest_first' | 'most_liked',
                string
            > = {
                oldest_first: 'Oldest First',
                newest_first: 'Newest First',
                most_liked: 'Most Liked',
            };
            return (
                translations[
                    key as 'oldest_first' | 'newest_first' | 'most_liked'
                ] || key
            );
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

    it('renders with initial most_liked sort order', () => {
        render(
            <ButtonSelector
                sortOrder="most_liked"
                onSortChange={mockOnSortChange}
            />
        );

        // Check if the button displays 'Most Liked'
        expect(screen.getByText('Most Liked')).toBeDefined();

        // Verify the descending icon is used
        expect(FaSortAmountDown).toHaveBeenCalled();
    });

    it('calls onSortChange when an option is selected from dropdown', () => {
        render(
            <ButtonSelector
                sortOrder="asc"
                onSortChange={mockOnSortChange}
            />
        );

        // Initially in ascending order
        expect(screen.getByText('Oldest First')).toBeDefined();

        // Click button to open dropdown
        fireEvent.click(screen.getByRole('button'));

        // Click the "Most Liked" option
        fireEvent.click(screen.getByRole('option', { name: 'Most Liked' }));

        // Verify onSortChange was called with 'most_liked'
        expect(mockOnSortChange).toHaveBeenCalledWith('most_liked');
    });

    it('updates display when sortOrder prop changes', () => {
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

    it('should have cursor-pointer style', () => {
        render(
            <ButtonSelector
                sortOrder="asc"
                onSortChange={mockOnSortChange}
            />
        );
        const buttonElement = screen.getByRole('button');
        expect(buttonElement).toHaveProperty(
            'className',
            expect.stringContaining('cursor-pointer')
        );
    });
});
