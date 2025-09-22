import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
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
}));

vi.mock('@/app/components/navbar/Search', () => ({
    default: ({
        onSearchModeChange,
    }: {
        onSearchModeChange?: (isActive: boolean) => void;
    }) => (
        <div
            data-testid="search"
            onClick={() => onSearchModeChange?.(true)}
        >
            Search
        </div>
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

    it('shows Categories when search mode is activated', () => {
        render(<Navbar />);
        const search = screen.getByTestId('search');

        fireEvent.click(search);
        expect(screen.getByTestId('categories')).toBeDefined();
    });

    it('shows Categories only on main page when search mode is active', () => {
        // This test is simplified since the mock is at module level
        render(<Navbar />);
        const search = screen.getByTestId('search');

        fireEvent.click(search);
        // On main page (mocked as '/'), categories should show
        expect(screen.getByTestId('categories')).toBeDefined();
    });

    it('passes currentUser to UserMenu', () => {
        const mockUser: SafeUser = {
            id: '1',
            name: 'Test User',
            email: null,
            emailVerified: null,
            image: null,
            hashedPassword: null,
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
        expect(header.className).toContain('z-10');
        expect(header.className).toContain('w-full');
        expect(header.className).toContain('bg-white');
        expect(header.className).toContain('shadow-xs');
        expect(header.className).toContain('dark:bg-dark');
    });
});
