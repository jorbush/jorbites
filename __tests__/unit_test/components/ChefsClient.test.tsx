import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChefsClient from '@/app/chefs/ChefsClient';
import { SafeUser } from '@/app/types';
import React from 'react';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    useSearchParams: () => mockSearchParams,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                chefs: 'Chefs',
                chefs_subtitle: 'Discover talented chefs and their creations',
                search_chefs: 'Search chefs',
                search: 'Search',
                highest_level: 'Highest Level',
                most_recipes: 'Most Recipes',
                most_liked: 'Most Liked',
                newest_first: 'Newest',
                oldest_first: 'Oldest',
                name_a_z: 'Name A-Z',
                name_z_a: 'Name Z-A',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock Container component
vi.mock('@/app/components/utils/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="container">{children}</div>
    ),
}));

// Mock ChefsList component
vi.mock('@/app/components/chefs/ChefsList', () => ({
    default: ({ chefs }: { chefs: SafeUser[] }) => (
        <div data-testid="chefs-list">
            {chefs.map((chef) => (
                <div
                    key={chef.id}
                    data-testid={`chef-${chef.id}`}
                >
                    {chef.name}
                </div>
            ))}
        </div>
    ),
}));

// Mock Pagination component
vi.mock('@/app/components/navigation/Pagination', () => ({
    default: ({
        totalPages,
        currentPage,
    }: {
        totalPages: number;
        currentPage: number;
    }) => (
        <div data-testid="pagination">
            Page {currentPage} of {totalPages}
        </div>
    ),
}));

describe('<ChefsClient />', () => {
    const mockChefs: SafeUser[] = [
        {
            id: '1',
            name: 'Chef One',
            email: 'chef1@example.com',
            image: null,
            level: 5,
            verified: true,
            hashedPassword: null,
            favoriteIds: [],
            emailNotifications: false,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            emailVerified: null,
            recipeCount: 10,
            likesReceived: 100,
        },
        {
            id: '2',
            name: 'Chef Two',
            email: 'chef2@example.com',
            image: null,
            level: 3,
            verified: false,
            hashedPassword: null,
            favoriteIds: [],
            emailNotifications: false,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
            emailVerified: null,
            recipeCount: 5,
            likesReceived: 50,
        },
    ];

    beforeEach(() => {
        mockPush.mockClear();
        mockSearchParams.delete('search');
        mockSearchParams.delete('orderBy');
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the page title', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        expect(screen.getByText('Chefs')).toBeDefined();
    });

    it('renders the page subtitle', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        expect(
            screen.getByText('Discover talented chefs and their creations')
        ).toBeDefined();
    });

    it('renders search input', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        const searchInput = screen.getByTestId('chef-search-input');
        expect(searchInput).toBeDefined();
    });

    it('renders search button', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        const searchButton = screen.getByTestId('chef-search-button');
        expect(searchButton).toBeDefined();
    });

    it('updates search input value when typing', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        const searchInput = screen.getByTestId(
            'chef-search-input'
        ) as HTMLInputElement;
        fireEvent.change(searchInput, { target: { value: 'John' } });
        expect(searchInput.value).toBe('John');
    });

    it('submits search when search button is clicked', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        const searchInput = screen.getByTestId(
            'chef-search-input'
        ) as HTMLInputElement;
        const searchButton = screen.getByTestId('chef-search-button');

        fireEvent.change(searchInput, { target: { value: 'John' } });
        fireEvent.click(searchButton);

        expect(mockPush).toHaveBeenCalledWith(
            '/chefs?search=John&page=1',
            expect.any(Object)
        );
    });

    it('submits search when Enter key is pressed', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        const searchInput = screen.getByTestId('chef-search-input');

        fireEvent.change(searchInput, { target: { value: 'Jane' } });
        fireEvent.keyDown(searchInput, { key: 'Enter' });

        expect(mockPush).toHaveBeenCalledWith(
            '/chefs?search=Jane&page=1',
            expect.any(Object)
        );
    });

    it('clears search input when clear button is clicked', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        const searchInput = screen.getByTestId(
            'chef-search-input'
        ) as HTMLInputElement;

        fireEvent.change(searchInput, { target: { value: 'Test' } });
        expect(searchInput.value).toBe('Test');

        // Find and click the clear button (X button)
        const clearButton = searchInput.parentElement?.querySelector(
            'button'
        ) as HTMLButtonElement;
        expect(clearButton).toBeDefined();
        fireEvent.click(clearButton);

        expect(searchInput.value).toBe('');
        expect(mockPush).toHaveBeenCalled();
    });

    it('renders order by filter buttons', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        expect(screen.getByTestId('order-by-highest_level')).toBeDefined();
        expect(screen.getByTestId('order-by-most_recipes')).toBeDefined();
        expect(screen.getByTestId('order-by-most_liked')).toBeDefined();
        expect(screen.getByTestId('order-by-newest')).toBeDefined();
    });

    it('changes order when order by button is clicked', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        const mostRecipesButton = screen.getByTestId('order-by-most_recipes');
        fireEvent.click(mostRecipesButton);

        expect(mockPush).toHaveBeenCalledWith(
            '/chefs?orderBy=most_recipes&page=1',
            expect.any(Object)
        );
    });

    it('renders chefs list', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        expect(screen.getByTestId('chefs-list')).toBeDefined();
        expect(screen.getByTestId('chef-1')).toBeDefined();
        expect(screen.getByTestId('chef-2')).toBeDefined();
    });

    it('renders pagination when totalPages > 1', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={3}
                currentPage={2}
            />
        );
        expect(screen.getByTestId('pagination')).toBeDefined();
        expect(screen.getByText('Page 2 of 3')).toBeDefined();
    });

    it('does not render pagination when totalPages = 1', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        expect(screen.queryByTestId('pagination')).toBeNull();
    });

    it('handles empty chefs array', () => {
        render(
            <ChefsClient
                chefs={[]}
                totalPages={1}
                currentPage={1}
            />
        );
        expect(screen.getByTestId('chefs-list')).toBeDefined();
    });

    it('maintains search query in URL when changing order', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );

        // First, set a search query
        const searchInput = screen.getByTestId('chef-search-input');
        fireEvent.change(searchInput, { target: { value: 'Test Chef' } });
        const searchButton = screen.getByTestId('chef-search-button');
        fireEvent.click(searchButton);

        // Then change the order
        const mostLikedButton = screen.getByTestId('order-by-most_liked');
        fireEvent.click(mostLikedButton);

        // Check that the last call includes both search and orderBy
        const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
        expect(lastCall).toContain('search=Test+Chef');
        expect(lastCall).toContain('orderBy=most_liked');
    });

    it('applies active style to current order button', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        // Default orderBy is 'trending'
        const trendingButton = screen.getByTestId('order-by-trending');
        expect(trendingButton.className).toContain('bg-orange-500');
    });

    it('renders Container component', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        expect(screen.getByTestId('container')).toBeDefined();
    });

    it('displays placeholder text in search input', () => {
        render(
            <ChefsClient
                chefs={mockChefs}
                totalPages={1}
                currentPage={1}
            />
        );
        const searchInput = screen.getByTestId(
            'chef-search-input'
        ) as HTMLInputElement;
        expect(searchInput.placeholder).toBe('Search chefs');
    });
});
