import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Navbar from '@/app/components/navbar/Navbar';
import { SafeUser } from '@/app/types';

// Mock the components used in Navbar
vi.mock('@/app/components/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="container">{children}</div>
    ),
}));

vi.mock('@/app/components/navbar/Categories', () => ({
    default: () => <div data-testid="categories">Categories</div>,
}));

vi.mock('@/app/components/navbar/Search', () => ({
    default: ({ onClick }: { onClick: () => void }) => (
        <div
            data-testid="search"
            onClick={onClick}
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

    it('toggles Categories when Search is clicked', () => {
        render(<Navbar />);
        const search = screen.getByTestId('search');

        fireEvent.click(search);
        expect(screen.getByTestId('categories')).toBeDefined();

        fireEvent.click(search);
        expect(screen.queryByTestId('categories')).toBeNull();
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
        const navbar =
            screen.getByTestId('container').parentElement?.parentElement;
        expect(navbar?.className).include('fixed');
        expect(navbar?.className).include('z-10');
        expect(navbar?.className).include('w-full');
        expect(navbar?.className).include('bg-white');
        expect(navbar?.className).include('shadow-sm');
        expect(navbar?.className).include('dark:bg-dark');
    });
});
