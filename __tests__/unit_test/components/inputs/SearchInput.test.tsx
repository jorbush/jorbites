import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SearchInput from '@/app/components/inputs/SearchInput';

// Mock for Next.js images
vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />,
}));

// Mock for Avatar
vi.mock('@/app/components/utils/Avatar', () => ({
    default: (props: any) => <div data-testid="avatar">{props.children}</div>,
}));

// Mock for VerificationBadge
vi.mock('@/app/components/VerificationBadge', () => ({
    default: (_props: any) => <span data-testid="verification-badge" />,
}));

describe('<SearchInput />', () => {
    const mockOnChange = vi.fn();
    const mockOnSelectResult = vi.fn();
    const mockIsSelected = vi.fn().mockReturnValue(false);

    const mockUsers = [
        {
            id: 'user1',
            name: 'User 1',
            image: '/user1.jpg',
            level: 5,
            verified: true,
        },
        {
            id: 'user2',
            name: 'User 2',
            image: '/user2.jpg',
            level: 3,
            verified: false,
        },
    ];

    const mockRecipes = [
        {
            id: 'recipe1',
            title: 'Recipe 1',
            imageSrc: '/recipe1.jpg',
            user: { name: 'Chef 1', image: '/chef1.jpg' },
        },
        {
            id: 'recipe2',
            title: 'Recipe 2',
            imageSrc: '/recipe2.jpg',
            user: { name: 'Chef 2', image: '/chef2.jpg' },
        },
    ];

    const mockResults = {
        users: mockUsers,
        recipes: mockRecipes,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with default props', () => {
        render(
            <SearchInput
                id="search"
                label="Search"
                value=""
                onChange={mockOnChange}
                searchType="users"
            />
        );

        expect(screen.getByLabelText('Search')).toBeDefined();
    });

    it('calls onChange when typing in the input', () => {
        render(
            <SearchInput
                id="search"
                label="Search"
                value=""
                onChange={mockOnChange}
                searchType="users"
            />
        );

        const input = screen.getByLabelText('Search');
        fireEvent.change(input, { target: { value: 'test' } });

        expect(mockOnChange).toHaveBeenCalled();
    });

    it('displays user search results when provided', async () => {
        render(
            <SearchInput
                id="search"
                label="Search Users"
                value="te"
                onChange={mockOnChange}
                searchType="users"
                results={mockResults}
                onSelectResult={mockOnSelectResult}
                isSelected={mockIsSelected}
                emptyMessage="No users found"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('User 1')).toBeDefined();
            expect(screen.getByText('User 2')).toBeDefined();
            expect(screen.getAllByTestId('avatar').length).toBe(2);
            expect(screen.getByTestId('verification-badge')).toBeDefined();
        });
    });

    it('displays recipe search results when provided', async () => {
        render(
            <SearchInput
                id="search"
                label="Search Recipes"
                value="te"
                onChange={mockOnChange}
                searchType="recipes"
                results={mockResults}
                onSelectResult={mockOnSelectResult}
                isSelected={mockIsSelected}
                emptyMessage="No recipes found"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Recipe 1')).toBeDefined();
            expect(screen.getByText('Recipe 2')).toBeDefined();
            expect(screen.getByText('Chef 1')).toBeDefined();
            expect(screen.getByText('Chef 2')).toBeDefined();
        });
    });

    it('calls onSelectResult when clicking on a result', async () => {
        render(
            <SearchInput
                id="search"
                label="Search Users"
                value="te"
                onChange={mockOnChange}
                searchType="users"
                results={mockResults}
                onSelectResult={mockOnSelectResult}
                isSelected={mockIsSelected}
                emptyMessage="No users found"
            />
        );

        await waitFor(() => {
            const firstResult = screen.getByText('User 1').closest('div');
            fireEvent.click(firstResult!);
            expect(mockOnSelectResult).toHaveBeenCalledWith(mockUsers[0]);
        });
    });

    it('displays empty message when no results are found', async () => {
        render(
            <SearchInput
                id="search"
                label="Search Users"
                value="te"
                onChange={mockOnChange}
                searchType="users"
                results={{ users: [], recipes: [] }}
                onSelectResult={mockOnSelectResult}
                isSelected={mockIsSelected}
                emptyMessage="No users found"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('No users found')).toBeDefined();
        });
    });

    it('shows selected items differently', async () => {
        const mockSelectedIsSelected = vi
            .fn()
            .mockImplementation((id) => id === 'user1');

        render(
            <SearchInput
                id="search"
                label="Search Users"
                value="te"
                onChange={mockOnChange}
                searchType="users"
                results={mockResults}
                onSelectResult={mockOnSelectResult}
                isSelected={mockSelectedIsSelected}
                emptyMessage="No users found"
            />
        );

        await waitFor(() => {
            // Verify that at least one selected item exists
            expect(mockSelectedIsSelected).toHaveBeenCalled();
        });
    });
});
