import {
    render,
    screen,
    fireEvent,
    cleanup,
    waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import PeriodFilter from '@/app/components/navbar/PeriodFilter';
import React from 'react';

// Mock the icons
vi.mock('react-icons/fi', () => ({
    FiCalendar: () => <div data-testid="calendar-icon" />,
    FiX: () => <div data-testid="x-icon" />,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                filter_by_date: 'Filter by date',
                clear_date_filter: 'Clear date filter',
                from_date: 'From date',
                to_date: 'To date',
                apply: 'Apply',
                cancel: 'Cancel',
            };
            return translations[key] || key;
        },
    }),
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
const mockPathname = vi.fn(() => '/');

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
    useSearchParams: () => mockSearchParams,
    usePathname: () => mockPathname(),
}));

describe('<PeriodFilter />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear all search params
        Array.from(mockSearchParams.keys()).forEach((key) => {
            mockSearchParams.delete(key);
        });
        // Mock today's date for consistent testing
        vi.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    describe('Basic rendering', () => {
        it('renders filter button with calendar icon', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            expect(button).toBeDefined();
            expect(button.getAttribute('aria-label')).toBe('Filter by date');
            expect(screen.getByTestId('calendar-icon')).toBeDefined();
        });

        it('shows notification circle when date filter is active', () => {
            mockSearchParams.set('startDate', '2024-01-01');

            render(<PeriodFilter />);

            const notificationCircle = screen
                .getByTestId('period-filter-button')
                .querySelector('.bg-rose-500');
            expect(notificationCircle).toBeDefined();
        });

        it('does not show notification circle when no date filter is active', () => {
            render(<PeriodFilter />);

            const notificationCircle = screen
                .getByTestId('period-filter-button')
                .querySelector('.bg-rose-500');
            expect(notificationCircle).toBeNull();
        });

        it('applies active styling when date filter is set', () => {
            mockSearchParams.set('startDate', '2024-01-01');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            expect(button.className).toContain('bg-green-450');
            expect(button.className).toContain('text-white');
        });

        it('applies default styling when no date filter is set', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            expect(button.className).toContain('bg-neutral-100');
            expect(button.className).toContain('text-neutral-600');
        });
    });

    describe('Dropdown interaction', () => {
        it('opens dropdown when button is clicked', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            expect(screen.getByTestId('period-filter-dropdown')).toBeDefined();
            expect(screen.getByText('Filter by date')).toBeDefined();
            expect(screen.getByTestId('start-date-input')).toBeDefined();
            expect(screen.getByTestId('end-date-input')).toBeDefined();
            expect(screen.getByTestId('apply-button')).toBeDefined();
            expect(screen.getByTestId('cancel-button')).toBeDefined();
        });

        it('closes dropdown when clicking outside', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            // Dropdown should be open
            expect(screen.getByTestId('period-filter-dropdown')).toBeDefined();

            // Click outside
            fireEvent.mouseDown(document.body);

            // Dropdown should be closed
            expect(screen.queryByTestId('period-filter-dropdown')).toBeNull();
        });

        it('closes dropdown when cancel button is clicked', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const cancelButton = screen.getByTestId('cancel-button');
            fireEvent.click(cancelButton);

            expect(screen.queryByTestId('period-filter-dropdown')).toBeNull();
        });

        it('updates aria-expanded when dropdown is opened', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            expect(button.getAttribute('aria-expanded')).toBe('false');

            fireEvent.click(button);
            expect(button.getAttribute('aria-expanded')).toBe('true');
        });
    });

    describe('Date input functionality', () => {
        it('allows entering start date', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId('start-date-input');
            fireEvent.change(startDateInput, {
                target: { value: '2024-01-01' },
            });

            expect((startDateInput as HTMLInputElement).value).toBe(
                '2024-01-01'
            );
        });

        it('allows entering end date', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const endDateInput = screen.getByTestId('end-date-input');
            fireEvent.change(endDateInput, { target: { value: '2024-01-10' } });

            expect((endDateInput as HTMLInputElement).value).toBe('2024-01-10');
        });

        it('sets max date constraint on start date input when end date is set', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const endDateInput = screen.getByTestId('end-date-input');
            fireEvent.change(endDateInput, { target: { value: '2024-01-10' } });

            const startDateInput = screen.getByTestId('start-date-input');
            expect(startDateInput.getAttribute('max')).toBe('2024-01-10');
        });

        it('sets min date constraint on end date input when start date is set', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId('start-date-input');
            fireEvent.change(startDateInput, {
                target: { value: '2024-01-01' },
            });

            const endDateInput = screen.getByTestId('end-date-input');
            expect(endDateInput.getAttribute('min')).toBe('2024-01-01');
        });

        it('initializes inputs with current URL parameter values', () => {
            mockSearchParams.set('startDate', '2024-01-01');
            mockSearchParams.set('endDate', '2024-01-10');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId(
                'start-date-input'
            ) as HTMLInputElement;
            const endDateInput = screen.getByTestId(
                'end-date-input'
            ) as HTMLInputElement;

            expect(startDateInput.value).toBe('2024-01-01');
            expect(endDateInput.value).toBe('2024-01-10');
        });
    });

    describe('Apply functionality', () => {
        it('updates URL when applying date range', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId('start-date-input');
            const endDateInput = screen.getByTestId('end-date-input');

            fireEvent.change(startDateInput, {
                target: { value: '2024-01-01' },
            });
            fireEvent.change(endDateInput, { target: { value: '2024-01-10' } });

            const applyButton = screen.getByTestId('apply-button');
            fireEvent.click(applyButton);

            expect(mockReplace).toHaveBeenCalledWith(
                '/?startDate=2024-01-01&endDate=2024-01-10'
            );
        });

        it('updates URL with only start date when end date is empty', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId('start-date-input');
            fireEvent.change(startDateInput, {
                target: { value: '2024-01-01' },
            });

            const applyButton = screen.getByTestId('apply-button');
            fireEvent.click(applyButton);

            expect(mockReplace).toHaveBeenCalledWith('/?startDate=2024-01-01');
        });

        it('updates URL with only end date when start date is empty', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const endDateInput = screen.getByTestId('end-date-input');
            fireEvent.change(endDateInput, { target: { value: '2024-01-10' } });

            const applyButton = screen.getByTestId('apply-button');
            fireEvent.click(applyButton);

            expect(mockReplace).toHaveBeenCalledWith('/?endDate=2024-01-10');
        });

        it('preserves existing URL params when applying dates', () => {
            mockSearchParams.set('search', 'pizza');
            mockSearchParams.set('category', 'italian');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId('start-date-input');
            fireEvent.change(startDateInput, {
                target: { value: '2024-01-01' },
            });

            const applyButton = screen.getByTestId('apply-button');
            fireEvent.click(applyButton);

            expect(mockReplace).toHaveBeenCalledWith(
                '/?search=pizza&category=italian&startDate=2024-01-01'
            );
        });

        it('disables apply button when no dates are entered', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const applyButton = screen.getByTestId(
                'apply-button'
            ) as HTMLButtonElement;
            expect(applyButton.disabled).toBe(true);
        });

        it('enables apply button when at least one date is entered', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId('start-date-input');
            fireEvent.change(startDateInput, {
                target: { value: '2024-01-01' },
            });

            const applyButton = screen.getByTestId(
                'apply-button'
            ) as HTMLButtonElement;
            expect(applyButton.disabled).toBe(false);
        });

        it('closes dropdown after applying', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId('start-date-input');
            fireEvent.change(startDateInput, {
                target: { value: '2024-01-01' },
            });

            const applyButton = screen.getByTestId('apply-button');
            fireEvent.click(applyButton);

            expect(screen.queryByTestId('period-filter-dropdown')).toBeNull();
        });
    });

    describe('Clear functionality', () => {
        it('shows clear button when date filter is active', () => {
            mockSearchParams.set('startDate', '2024-01-01');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            expect(screen.getByTestId('clear-filter-button')).toBeDefined();
        });

        it('does not show clear button when no date filter is active', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            expect(screen.queryByTestId('clear-filter-button')).toBeNull();
        });

        it('clears date filter when clear button is clicked', () => {
            mockSearchParams.set('startDate', '2024-01-01');
            mockSearchParams.set('endDate', '2024-01-10');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const clearButton = screen.getByTestId('clear-filter-button');
            fireEvent.click(clearButton);

            expect(mockReplace).toHaveBeenCalledWith('/');
        });

        it('preserves other URL params when clearing date filter', () => {
            // Clear all params first, then set only the ones we want for this test
            Array.from(mockSearchParams.keys()).forEach((key) => {
                mockSearchParams.delete(key);
            });
            mockSearchParams.set('search', 'pizza');
            mockSearchParams.set('startDate', '2024-01-01');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const clearButton = screen.getByTestId('clear-filter-button');
            fireEvent.click(clearButton);

            expect(mockReplace).toHaveBeenCalledWith('/?search=pizza');
        });
    });

    describe('Date range formatting', () => {
        it('displays formatted date range when both dates are set', () => {
            mockSearchParams.set('startDate', '2024-01-01');
            mockSearchParams.set('endDate', '2024-01-10');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            expect(screen.getByTestId('formatted-date-range')).toBeDefined();
            expect(screen.getByText('Jan 1 - Jan 10')).toBeDefined();
        });

        it('displays "From" format when only start date is set', () => {
            mockSearchParams.set('startDate', '2024-01-01');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            expect(screen.getByTestId('formatted-date-range')).toBeDefined();
            expect(screen.getByText('From Jan 1')).toBeDefined();
        });

        it('displays "Until" format when only end date is set', () => {
            mockSearchParams.set('endDate', '2024-01-10');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            expect(screen.getByTestId('formatted-date-range')).toBeDefined();
            expect(screen.getByText('Until Jan 10')).toBeDefined();
        });

        it('includes year in format when date is not current year', () => {
            mockSearchParams.set('startDate', '2023-12-25');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            expect(screen.getByTestId('formatted-date-range')).toBeDefined();
            expect(screen.getByText('From Dec 25, 2023')).toBeDefined();
        });

        it('does not display formatted date range when no dates are set', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            expect(screen.queryByTestId('formatted-date-range')).toBeNull();
        });
    });

    describe('Non-main page behavior', () => {
        beforeEach(() => {
            mockPathname.mockReturnValue('/about');
        });

        afterEach(() => {
            mockPathname.mockReturnValue('/');
        });

        it('does not update URL when not on main page', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId('start-date-input');
            fireEvent.change(startDateInput, {
                target: { value: '2024-01-01' },
            });

            const applyButton = screen.getByTestId('apply-button');
            fireEvent.click(applyButton);

            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('does not update URL when clearing on non-main page', () => {
            mockSearchParams.set('startDate', '2024-01-01');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const clearButton = screen.getByTestId('clear-filter-button');
            fireEvent.click(clearButton);

            expect(mockReplace).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('handles invalid date inputs gracefully', () => {
            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId('start-date-input');

            // Try to enter invalid date
            fireEvent.change(startDateInput, {
                target: { value: 'invalid-date' },
            });

            // Input should handle invalid date according to browser behavior
            const applyButton = screen.getByTestId('apply-button');
            expect(applyButton).toBeDefined();
        });

        it('resets temp state to URL params when dropdown reopens', async () => {
            // Clear all params and set only what we need
            Array.from(mockSearchParams.keys()).forEach((key) => {
                mockSearchParams.delete(key);
            });
            mockSearchParams.set('startDate', '2024-01-05');

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId('start-date-input');
            // Verify initial value matches URL param
            expect((startDateInput as HTMLInputElement).value).toBe(
                '2024-01-05'
            );

            // Change temp value
            fireEvent.change(startDateInput, {
                target: { value: '2024-01-01' },
            });

            // Verify the temp value changed
            expect((startDateInput as HTMLInputElement).value).toBe(
                '2024-01-01'
            );

            // Close without applying
            const cancelButton = screen.getByTestId('cancel-button');
            fireEvent.click(cancelButton);

            // Reopen
            fireEvent.click(button);

            // Wait for the dropdown to open and state to reset
            await waitFor(() => {
                const newStartDateInput = screen.getByTestId(
                    'start-date-input'
                ) as HTMLInputElement;
                expect(newStartDateInput.value).toBe('2024-01-05');
            });
        });

        it('handles empty URL params when dropdown reopens', async () => {
            // Ensure no URL params are set
            Array.from(mockSearchParams.keys()).forEach((key) => {
                mockSearchParams.delete(key);
            });

            render(<PeriodFilter />);

            const button = screen.getByTestId('period-filter-button');
            fireEvent.click(button);

            const startDateInput = screen.getByTestId('start-date-input');
            // Verify initial value is empty
            expect((startDateInput as HTMLInputElement).value).toBe('');

            fireEvent.change(startDateInput, {
                target: { value: '2024-01-01' },
            });

            // Close without applying
            const cancelButton = screen.getByTestId('cancel-button');
            fireEvent.click(cancelButton);

            // Reopen
            fireEvent.click(button);

            // Wait for the dropdown to open and state to reset
            await waitFor(() => {
                const newStartDateInput = screen.getByTestId(
                    'start-date-input'
                ) as HTMLInputElement;
                expect(newStartDateInput.value).toBe('');
            });
        });
    });
});
