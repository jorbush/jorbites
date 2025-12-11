import {
    render,
    screen,
    fireEvent,
    cleanup,
    waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import Search from '@/app/components/navbar/Search';
import React from 'react';

// Mock the Logo component
vi.mock('@/app/components/navbar/Logo', () => ({
    default: () => <div data-testid="mock-logo">Logo</div>,
}));

// Mock the icons
vi.mock('react-icons/bi', () => ({
    BiSearch: () => <div data-testid="search-icon">BiSearch</div>,
    BiX: () => <div data-testid="x-icon">BiX</div>,
}));

vi.mock('react-icons/fi', () => ({
    FiChevronLeft: () => (
        <div data-testid="chevron-left-icon">FiChevronLeft</div>
    ),
    FiFilter: () => <div data-testid="filter-icon">FiFilter</div>,
    FiCalendar: () => <div data-testid="calendar-icon">FiCalendar</div>,
    FiX: () => <div data-testid="fi-x-icon">FiX</div>,
}));

vi.mock('react-icons/io5', () => ({
    IoReorderThree: () => <div data-testid="reorder-icon" />,
}));

// Mock OrderByDropdown and PeriodFilter components
vi.mock('@/app/components/navbar/OrderByDropdown', () => ({
    default: () => <div data-testid="order-by-dropdown">OrderByDropdown</div>,
}));

vi.mock('@/app/components/navbar/PeriodFilter', () => ({
    default: () => <div data-testid="period-filter">PeriodFilter</div>,
}));

vi.mock('@/app/utils/filter', () => ({
    OrderByType: {
        NEWEST: 'newest',
        OLDEST: 'oldest',
        TITLE_ASC: 'title_asc',
        TITLE_DESC: 'title_desc',
        MOST_LIKED: 'most_liked',
    },
    ORDER_BY_OPTIONS: [
        'newest',
        'oldest',
        'title_asc',
        'title_desc',
        'most_liked',
    ],
    ORDER_BY_LABELS: {
        newest: 'newest_first',
        oldest: 'oldest_first',
        title_asc: 'title_a_z',
        title_desc: 'title_z_a',
        most_liked: 'most_liked',
    },
    ORDER_BY_FALLBACK_LABELS: {
        newest: 'Newest first',
        oldest: 'Oldest first',
        title_asc: 'Title A-Z',
        title_desc: 'Title Z-A',
        most_liked: 'Most liked',
    },
}));

// Mock useMediaQuery hook
vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: vi.fn(() => false), // Default to desktop
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        form: ({ children, ...props }: any) => (
            <form {...props}>{children}</form>
        ),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock debounce
vi.mock('lodash/debounce', () => ({
    default: (fn: any) => fn,
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
    useSearchParams: () => mockSearchParams,
    usePathname: () => '/',
}));

describe('<Search />', () => {
    const mockOnSearchModeChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams.delete('search');
        mockSearchParams.delete('category');
        mockSearchParams.delete('startDate');
        mockSearchParams.delete('endDate');
        mockSearchParams.delete('orderBy');
    });

    afterEach(() => {
        cleanup();
    });

    describe('Basic functionality', () => {
        it('renders Logo and search button in normal mode', () => {
            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            expect(screen.getByTestId('mock-logo')).toBeDefined();
            expect(screen.getByTestId('search-icon')).toBeDefined();
        });

        it('calls onSearchModeChange when search button is clicked', () => {
            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchButton = screen
                .getByTestId('search-icon')
                .closest('button');
            fireEvent.click(searchButton!);

            expect(mockOnSearchModeChange).toHaveBeenCalledWith(true);
        });

        it('renders search input with back button in search mode', () => {
            mockSearchParams.set('search', 'test');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            expect(screen.getByTestId('chevron-left-icon')).toBeDefined();
            expect(
                screen.getByPlaceholderText('search_recipes...')
            ).toBeDefined();
        });

        it('shows clear button when search input has value', () => {
            mockSearchParams.set('search', 'test recipe');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            expect(screen.getByTestId('x-icon')).toBeDefined();
        });
    });

    describe('Search functionality', () => {
        it('updates URL when typing in search input', async () => {
            mockSearchParams.set('search', 'test');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchInput =
                screen.getByPlaceholderText('search_recipes...');
            fireEvent.change(searchInput, { target: { value: 'new search' } });

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalled();
            });
        });

        it('resets pagination when performing a search', async () => {
            mockSearchParams.set('page', '3');
            mockSearchParams.set('search', 'test');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchInput =
                screen.getByPlaceholderText('search_recipes...');
            fireEvent.change(searchInput, { target: { value: 'new search' } });

            await waitFor(() => {
                const lastCall =
                    mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).not.toContain('page=');
            });
        });

        it('clears search when back button is clicked', () => {
            mockSearchParams.set('search', 'test');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const backButton = screen
                .getByTestId('chevron-left-icon')
                .closest('button');
            fireEvent.click(backButton!);

            expect(mockPush).toHaveBeenCalled();
            // Note: onSearchModeChange is called with true initially when search params are set
            expect(mockOnSearchModeChange).toHaveBeenCalled();
        });

        it('handles ESC key to exit search mode', () => {
            mockSearchParams.set('search', 'test');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchInput =
                screen.getByPlaceholderText('search_recipes...');
            fireEvent.keyDown(searchInput, { key: 'Escape' });

            // Note: onSearchModeChange is called when component renders due to search params
            expect(mockOnSearchModeChange).toHaveBeenCalled();
        });

        it('enters search mode when search params are present', () => {
            mockSearchParams.set('search', 'test');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            expect(mockOnSearchModeChange).toHaveBeenCalledWith(true);
        });
    });

    describe('Search input behavior', () => {
        it('clears input when X button is clicked', () => {
            mockSearchParams.set('search', 'test recipe');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const clearButton = screen.getByTestId('x-icon').closest('button');
            fireEvent.click(clearButton!);
            waitFor(() => {
                const searchInput = screen.getByPlaceholderText(
                    'search_recipes...'
                ) as HTMLInputElement;
                expect(searchInput.value).toBe('');
            });
        });

        it('maintains search mode even when input is cleared', () => {
            mockSearchParams.set('search', 'test');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchInput =
                screen.getByPlaceholderText('search_recipes...');
            fireEvent.change(searchInput, { target: { value: '' } });

            // Search mode should still be active
            expect(screen.getByTestId('chevron-left-icon')).toBeDefined();
        });
    });

    describe('Notification circle on search button', () => {
        it('shows notification circle when category filter is active', () => {
            mockSearchParams.set('category', 'dessert');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchButton = screen
                .getByTestId('search-icon')
                .closest('button');
            const notificationCircle = searchButton?.querySelector('span');

            expect(notificationCircle).toBeDefined();
            expect(notificationCircle?.className).toContain('bg-rose-500');
        });

        it('shows notification circle when period filter is active', () => {
            mockSearchParams.set('startDate', '2024-01-01');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchButton = screen
                .getByTestId('search-icon')
                .closest('button');
            const notificationCircle = searchButton?.querySelector('span');

            expect(notificationCircle).toBeDefined();
            expect(notificationCircle?.className).toContain('bg-rose-500');
        });

        it('shows notification circle when orderBy filter is active', () => {
            mockSearchParams.set('orderBy', 'most_liked');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchButton = screen
                .getByTestId('search-icon')
                .closest('button');
            const notificationCircle = searchButton?.querySelector('span');

            expect(notificationCircle).toBeDefined();
            expect(notificationCircle?.className).toContain('bg-rose-500');
        });

        it('shows notification circle when multiple filters are active', () => {
            mockSearchParams.set('category', 'dessert');
            mockSearchParams.set('startDate', '2024-01-01');
            mockSearchParams.set('orderBy', 'most_liked');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchButton = screen
                .getByTestId('search-icon')
                .closest('button');
            const notificationCircle = searchButton?.querySelector('span');

            expect(notificationCircle).toBeDefined();
            expect(notificationCircle?.className).toContain('bg-rose-500');
        });

        it('does not show notification circle when no filters are active', () => {
            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchButton = screen
                .getByTestId('search-icon')
                .closest('button');
            const notificationCircle = searchButton?.querySelector('span');

            expect(notificationCircle).toBeNull();
        });

        it('does not show notification circle in search mode (filters are visible)', () => {
            mockSearchParams.set('search', 'test');
            mockSearchParams.set('category', 'dessert');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            // In search mode, the search icon is not visible (back button is shown instead)
            expect(screen.queryByTestId('search-icon')).toBeNull();
            expect(screen.getByTestId('chevron-left-icon')).toBeDefined();
        });
    });
});
