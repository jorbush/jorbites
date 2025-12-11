import {
    render,
    screen,
    fireEvent,
    cleanup,
    waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import OrderByDropdown from '@/app/components/navbar/OrderByDropdown';
import React from 'react';

// Mock the icons
vi.mock('react-icons/fi', () => ({
    FiChevronDown: () => <div data-testid="chevron-down-icon" />,
}));

vi.mock('react-icons/io5', () => ({
    IoReorderThree: () => <div data-testid="reorder-icon" />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                order_by: 'Order by',
                newest_first: 'Newest first',
                oldest_first: 'Oldest first',
                title_a_z: 'Title A-Z',
                title_z_a: 'Title Z-A',
                most_liked: 'Most liked',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock the order by constants
vi.mock('@/app/utils/order-by', () => ({
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

describe('<OrderByDropdown />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams.delete('orderBy');
        // Mock window dimensions for responsive behavior
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024, // Default to desktop
        });
    });

    afterEach(() => {
        cleanup();
    });

    describe('Basic rendering', () => {
        it('renders dropdown button with default "Newest first" label on desktop', () => {
            render(<OrderByDropdown />);

            expect(screen.getByText('Newest first')).toBeDefined();
            expect(screen.getByTestId('chevron-down-icon')).toBeDefined();
        });

        it('renders reorder icon on mobile (screen width < 1024px)', () => {
            // Mock smaller screen size
            Object.defineProperty(window, 'innerWidth', {
                value: 768,
            });

            render(<OrderByDropdown />);

            expect(screen.getByTestId('reorder-icon')).toBeDefined();
        });

        it('shows notification circle when non-default order is selected', () => {
            mockSearchParams.set('orderBy', 'title_asc');

            render(<OrderByDropdown />);

            const notificationCircle = screen
                .getByRole('button')
                .querySelector('.bg-rose-500');
            expect(notificationCircle).toBeDefined();
        });

        it('does not show notification circle when default order is selected', () => {
            render(<OrderByDropdown />);

            const notificationCircle = screen
                .getByRole('button')
                .querySelector('.bg-rose-500');
            expect(notificationCircle).toBeNull();
        });
    });

    describe('Dropdown interaction', () => {
        it('opens dropdown when button is clicked', () => {
            render(<OrderByDropdown />);

            const dropdownButton = screen.getByRole('button');
            fireEvent.click(dropdownButton);

            expect(screen.getByText('Oldest first')).toBeDefined();
            expect(screen.getByText('Title A-Z')).toBeDefined();
            expect(screen.getByText('Title Z-A')).toBeDefined();
            expect(screen.getByText('Most liked')).toBeDefined();
        });

        it('closes dropdown when clicking outside', () => {
            render(<OrderByDropdown />);

            const dropdownButton = screen.getByRole('button');
            fireEvent.click(dropdownButton);

            // Dropdown should be open
            expect(screen.getByText('Oldest first')).toBeDefined();

            // Click outside (simulate by clicking document body)
            fireEvent.mouseDown(document.body);

            // Dropdown should be closed (options no longer visible)
            expect(screen.queryByText('Oldest first')).toBeNull();
        });

        it('highlights current selection in dropdown', () => {
            mockSearchParams.set('orderBy', 'title_asc');

            render(<OrderByDropdown />);

            const dropdownButton = screen.getByRole('button');
            fireEvent.click(dropdownButton);

            // Get all elements with "Title A-Z" and find the one in the dropdown (with whitespace-nowrap)
            const titleOptions = screen.getAllByText('Title A-Z');
            const dropdownOption = titleOptions.find((option) =>
                option.className.includes('whitespace-nowrap')
            );

            expect(dropdownOption?.parentElement?.className).toContain(
                'text-green-450'
            );
        });
    });

    describe('Order selection', () => {
        it('updates URL when selecting a new order option', () => {
            render(<OrderByDropdown />);

            const dropdownButton = screen.getByRole('button');
            fireEvent.click(dropdownButton);

            // Find the dropdown option (not the button label)
            const titleAscOptions = screen.getAllByText('Title A-Z');
            const titleAscOption = titleAscOptions.find((option) =>
                option.className.includes('whitespace-nowrap')
            );
            fireEvent.click(titleAscOption!);

            expect(mockReplace).toHaveBeenCalledWith(
                '/?orderBy=title_asc&page=1',
                {
                    scroll: false,
                }
            );
        });

        it('removes orderBy param when selecting "Newest first" (default)', () => {
            mockSearchParams.set('orderBy', 'title_asc');

            render(<OrderByDropdown />);

            const dropdownButton = screen.getByRole('button');
            fireEvent.click(dropdownButton);

            const newestOption = screen.getByText('Newest first');
            fireEvent.click(newestOption);

            expect(mockReplace).toHaveBeenCalledWith('/?page=1', {
                scroll: false,
            });
        });

        it('preserves existing URL params when changing order', () => {
            mockSearchParams.set('search', 'pizza');
            mockSearchParams.set('category', 'italian');

            render(<OrderByDropdown />);

            const dropdownButton = screen.getByRole('button');
            fireEvent.click(dropdownButton);

            const oldestOption = screen.getByText('Oldest first');
            fireEvent.click(oldestOption);

            expect(mockReplace).toHaveBeenCalledWith(
                '/?search=pizza&category=italian&orderBy=oldest&page=1',
                { scroll: false }
            );
        });

        it('closes dropdown after selecting an option', async () => {
            render(<OrderByDropdown />);

            const dropdownButton = screen.getByRole('button');
            fireEvent.click(dropdownButton);

            const titleDescOption = screen.getByText('Title Z-A');
            fireEvent.click(titleDescOption);

            // Dropdown should close after selection
            await waitFor(() => {
                expect(screen.queryByText('Title A-Z')).toBeNull();
            });
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA attributes', () => {
            render(<OrderByDropdown />);

            const dropdownButton = screen.getByRole('button');
            expect(dropdownButton.getAttribute('aria-label')).toBe('Order by');
            expect(dropdownButton.getAttribute('aria-expanded')).toBe('false');
        });

        it('updates aria-expanded when dropdown is opened', () => {
            render(<OrderByDropdown />);

            const dropdownButton = screen.getByRole('button');
            fireEvent.click(dropdownButton);

            expect(dropdownButton.getAttribute('aria-expanded')).toBe('true');
        });
    });

    describe('Label display', () => {
        it('displays correct labels for each order type', () => {
            const testCases = [
                { param: 'oldest', expected: 'Oldest first' },
                { param: 'title_asc', expected: 'Title A-Z' },
                { param: 'title_desc', expected: 'Title Z-A' },
                { param: 'most_liked', expected: 'Most liked' },
            ];

            testCases.forEach(({ param, expected }) => {
                cleanup();
                mockSearchParams.delete('orderBy');
                mockSearchParams.delete('search');
                mockSearchParams.delete('category');
                mockSearchParams.set('orderBy', param);

                render(<OrderByDropdown />);
                expect(screen.getByText(expected)).toBeDefined();
            });
        });
    });
});
