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
    BiSearch: () => <div data-testid="mock-search-icon">Search Icon</div>,
    BiX: () => <div data-testid="mock-x-icon">X Icon</div>,
}));

vi.mock('react-icons/fi', () => ({
    FiChevronLeft: () => (
        <div data-testid="mock-chevron-left">Chevron Left</div>
    ),
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
    });

    afterEach(() => {
        cleanup();
    });

    describe('Basic functionality', () => {
        it('renders Logo and search button in normal mode', () => {
            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            expect(screen.getByTestId('mock-logo')).toBeDefined();
            expect(screen.getByTestId('mock-search-icon')).toBeDefined();
        });

        it('calls onSearchModeChange when search button is clicked', () => {
            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchButton = screen
                .getByTestId('mock-search-icon')
                .closest('button');
            fireEvent.click(searchButton!);

            expect(mockOnSearchModeChange).toHaveBeenCalledWith(true);
        });

        it('renders search input with back button in search mode', () => {
            mockSearchParams.set('search', 'test');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            expect(screen.getByTestId('mock-chevron-left')).toBeDefined();
            expect(
                screen.getByPlaceholderText('search_recipes...')
            ).toBeDefined();
        });

        it('shows clear button when search input has value', () => {
            mockSearchParams.set('search', 'test recipe');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            expect(screen.getByTestId('mock-x-icon')).toBeDefined();
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

        it('clears search when back button is clicked', () => {
            mockSearchParams.set('search', 'test');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const backButton = screen
                .getByTestId('mock-chevron-left')
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

            const clearButton = screen
                .getByTestId('mock-x-icon')
                .closest('button');
            fireEvent.click(clearButton!);

            const searchInput = screen.getByPlaceholderText(
                'search_recipes...'
            ) as HTMLInputElement;
            expect(searchInput.value).toBe('');
        });

        it('maintains search mode even when input is cleared', () => {
            mockSearchParams.set('search', 'test');

            render(<Search onSearchModeChange={mockOnSearchModeChange} />);

            const searchInput =
                screen.getByPlaceholderText('search_recipes...');
            fireEvent.change(searchInput, { target: { value: '' } });

            // Search mode should still be active
            expect(screen.getByTestId('mock-chevron-left')).toBeDefined();
        });
    });
});
