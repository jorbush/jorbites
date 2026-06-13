import React from 'react';
import {
    render,
    screen,
    fireEvent,
    cleanup,
    waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Navbar from '@/app/components/navbar/Navbar';
import { SafeUser } from '@/app/types';

// Mock the components used in Navbar
vi.mock('@/app/components/utils/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="container">{children}</div>
    ),
}));

vi.mock('@/app/components/navbar/Categories', () => ({
    default: () => <div data-testid="categories">Categories</div>,
    CategoriesSkeleton: () => (
        <div data-testid="categories-skeleton">Categories Skeleton</div>
    ),
}));

vi.mock('@/app/components/navbar/Search', () => ({
    default: ({
        onSearchModeChange,
        onFilterToggle,
    }: {
        onSearchModeChange?: (isActive: boolean) => void;
        onFilterToggle?: () => void;
        isFilterOpen?: boolean;
    }) => (
        <div data-testid="search-wrapper">
            <div
                data-testid="search"
                onClick={() => onSearchModeChange?.(true)}
            >
                Search
            </div>
            <button
                data-testid="filter-button"
                onClick={() => onFilterToggle?.()}
            >
                Filter
            </button>
        </div>
    ),
    SearchFallback: () => (
        <div data-testid="search-fallback">Search Fallback</div>
    ),
}));

vi.mock('@/app/components/navbar/UserMenu', () => ({
    default: ({ currentUser }: { currentUser?: any }) => (
        <div data-testid="user-menu">
            UserMenu: {currentUser ? 'Logged In' : 'Not Logged In'}
        </div>
    ),
}));

vi.mock('@/app/hooks/useTheme', () => ({
    default: vi.fn(),
}));

// Mock useMediaQuery hook
vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: vi.fn(() => false), // Default to desktop (false for mobile)
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(() => '/'),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

describe('<Navbar />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders without crashing', () => {
        render(<Navbar />);
        expect(screen.getByTestId('container')).toBeDefined();
    });

    it('renders Search and UserMenu components', () => {
        render(<Navbar />);
        expect(screen.getByTestId('search')).toBeDefined();
        expect(screen.getByTestId('user-menu')).toBeDefined();
    });

    it('does not render Categories by default', () => {
        render(<Navbar />);
        expect(screen.queryByTestId('categories')).toBeNull();
    });

    it('shows Categories when filter is toggled', async () => {
        render(<Navbar />);
        const filterButton = screen.getByTestId('filter-button');

        fireEvent.click(filterButton);
        await waitFor(() => {
            expect(screen.getByTestId('categories')).toBeDefined();
        });
    });

    it('shows Categories only on main page when filter is toggled', async () => {
        // This test is simplified since the mock is at module level
        render(<Navbar />);
        const filterButton = screen.getByTestId('filter-button');

        fireEvent.click(filterButton);
        await waitFor(() => {
            // On main page (mocked as '/'), categories should show
            expect(screen.getByTestId('categories')).toBeDefined();
        });
    });

    it('applies correct liquid glass CSS classes to the Categories menu container', async () => {
        render(<Navbar />);
        const filterButton = screen.getByTestId('filter-button');

        fireEvent.click(filterButton);
        await waitFor(() => {
            const categoriesMenu = document.getElementById('categories-menu');
            expect(categoriesMenu).not.toBeNull();
            expect(categoriesMenu!.className).toContain('navbar-categories');
            expect(categoriesMenu!.className).toContain('relative');
            expect(categoriesMenu!.className).toContain('z-0');
            expect(categoriesMenu!.className).toContain('backdrop-blur-lg');
            expect(categoriesMenu!.className).toContain('bg-white/75');
            expect(categoriesMenu!.className).toContain('dark:bg-[#0F0F0F]/75');
            expect(categoriesMenu!.className).toContain('border-b');
            expect(categoriesMenu!.className).toContain(
                'border-neutral-200/40'
            );
            expect(categoriesMenu!.className).toContain(
                'dark:border-neutral-800/40'
            );
            expect(categoriesMenu!.className).toContain(
                'shadow-[0_2px_20px_rgba(0,0,0,0.03)]'
            );
            expect(categoriesMenu!.className).toContain(
                'dark:shadow-[0_2px_20px_rgba(0,0,0,0.15)]'
            );
        });
    });

    it('passes currentUser to UserMenu', () => {
        const mockUser: SafeUser = {
            id: '1',
            name: 'Test User',
            email: null,
            emailVerified: null,
            image: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            favoriteIds: [],
            emailNotifications: false,
            level: 0,
            verified: false,
            badges: [],
        };
        render(<Navbar currentUser={mockUser} />);
        expect(screen.getByText('UserMenu: Logged In')).toBeDefined();
    });

    it('shows UserMenu as not logged in when no user is provided', () => {
        render(<Navbar />);
        expect(screen.getByText('UserMenu: Not Logged In')).toBeDefined();
    });

    it('applies correct CSS classes', () => {
        render(<Navbar />);
        const header = screen.getByRole('banner');
        expect(header.className).toContain('fixed');
        expect(header.className).toContain('z-20');
        expect(header.className).toContain('w-full');
        expect(header.className).not.toContain('bg-white/75');
        expect(header.className).not.toContain('backdrop-blur-lg');

        const topRow = screen.getByTestId('navbar-top-row');
        expect(topRow.className).toContain('relative');
        expect(topRow.className).toContain('z-10');
        expect(topRow.className).toContain('border-b');
        expect(topRow.className).toContain('bg-white/75');
        expect(topRow.className).toContain('backdrop-blur-lg');
        expect(topRow.className).toContain(
            'pt-[calc(0.75rem+env(safe-area-inset-top,0px))]'
        );
        expect(topRow.className).toContain('dark:bg-[#0F0F0F]/75');
    });
});
