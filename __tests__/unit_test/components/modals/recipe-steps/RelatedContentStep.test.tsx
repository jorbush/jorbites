import {
    render,
    screen,
    fireEvent,
    act,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RelatedContentStep from '@/app/components/modals/recipe-steps/RelatedContentStep';
import axios from 'axios';

// Mocks for dependencies
vi.mock('axios');
const mockedAxios = axios as any;

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key, // Return the key itself instead of the translated string
    })),
}));

// Mock Heading component
vi.mock('@/app/components/navigation/Heading', () => ({
    default: ({ title, subtitle }: { title: string; subtitle?: string }) => (
        <div data-testid="heading">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
        </div>
    ), // Mock Heading component with testid
}));

// Mock the new Tabs component
vi.mock('@/app/components/utils/Tabs', () => ({
    default: ({ tabs, activeTab, onTabChange, ...props }: any) => (
        <div data-testid={props['data-testid']}>
            {tabs.map((tab: any) => (
                <button
                    key={tab.id}
                    data-testid={`tab-${tab.id}`}
                    onClick={() => onTabChange(tab.id)}
                    className={activeTab === tab.id ? 'active' : ''}
                >
                    {tab.icon && <span>{tab.icon}</span>}
                    {tab.label}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('@/app/components/inputs/SearchInput', () => ({
    default: ({
        label,
        value,
        onChange,
        _results,
        onSelectResult,
        searchType,
    }: any) => (
        <div data-testid="search-input">
            <label>{label}</label>
            <input
                data-testid="search-input-field"
                value={value}
                onChange={onChange}
            />
            <button
                data-testid="mock-select-user"
                onClick={() =>
                    // Mock select button that simulates selecting a user or recipe
                    searchType === 'users'
                        ? onSelectResult({ id: 'user1', name: 'Test User' })
                        : onSelectResult({
                              id: 'recipe1',
                              title: 'Test Recipe',
                              user: { name: 'Chef' },
                          })
                }
            >
                Select Item
            </button>
        </div>
    ),
}));

describe('<RelatedContentStep />', () => {
    // Default mock props for all tests
    const mockProps = {
        isLoading: false,
        selectedCoCooks: [],
        selectedLinkedRecipes: [],
        onAddCoCook: vi.fn(),
        onRemoveCoCook: vi.fn(),
        onAddLinkedRecipe: vi.fn(),
        onRemoveLinkedRecipe: vi.fn(),
    };

    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();

        // Setup default axios mock responses
        mockedAxios.get.mockResolvedValue({
            data: {
                users: [
                    {
                        id: 'user1',
                        name: 'User 1',
                        image: '/user1.jpg',
                    },
                    {
                        id: 'user2',
                        name: 'User 2',
                        image: '/user2.jpg',
                    },
                ],
                recipes: [
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
                ],
            },
        });
    });

    afterEach(() => {
        cleanup(); // Clean up after each test to prevent memory leaks
    });

    it('renders correctly with default props', () => {
        render(<RelatedContentStep {...mockProps} />);

        // Check that all essential elements are rendered
        expect(screen.getByTestId('heading')).toBeDefined();
        expect(screen.getByText('related_content')).toBeDefined();
        expect(screen.getByTestId('related-content-tabs')).toBeDefined();
        expect(screen.getByTestId('tab-users')).toBeDefined();
        expect(screen.getByTestId('tab-recipes')).toBeDefined();
        expect(screen.getByTestId('search-input')).toBeDefined();
    });

    it('renders tab labels correctly', () => {
        render(<RelatedContentStep {...mockProps} />);

        expect(screen.getByText('co_cooks')).toBeDefined();
        expect(screen.getByText('linked_recipes')).toBeDefined();
    });

    it('switches between users and recipes tabs', async () => {
        render(<RelatedContentStep {...mockProps} />);

        // Should be on users tab by default
        expect(screen.getByText('search_users')).toBeDefined();

        // Switch to recipes tab using the new tab component
        fireEvent.click(screen.getByTestId('tab-recipes'));

        await waitFor(() => {
            expect(screen.getByText('search_recipes')).toBeDefined();
        });

        // Switch back to users tab
        fireEvent.click(screen.getByTestId('tab-users'));

        await waitFor(() => {
            expect(screen.getByText('search_users')).toBeDefined();
        });
    });

    it('shows users tab as active by default', () => {
        render(<RelatedContentStep {...mockProps} />);

        const usersTab = screen.getByTestId('tab-users');
        const recipesTab = screen.getByTestId('tab-recipes');

        expect(usersTab.className).toContain('active');
        expect(recipesTab.className).not.toContain('active');
    });

    it('updates active tab styling when switching tabs', () => {
        render(<RelatedContentStep {...mockProps} />);

        const usersTab = screen.getByTestId('tab-users');
        const recipesTab = screen.getByTestId('tab-recipes');

        // Initially users tab should be active
        expect(usersTab.className).toContain('active');
        expect(recipesTab.className).not.toContain('active');

        // Click recipes tab
        fireEvent.click(recipesTab);

        // Now recipes tab should be active
        expect(recipesTab.className).toContain('active');
        expect(usersTab.className).not.toContain('active');
    });

    it('adds a co-cook when selecting from search results', async () => {
        render(<RelatedContentStep {...mockProps} />);

        // Select a user from search results
        fireEvent.click(screen.getByTestId('mock-select-user'));

        // Verify that onAddCoCook callback was called with correct user data
        expect(mockProps.onAddCoCook).toHaveBeenCalledWith({
            id: 'user1',
            name: 'Test User',
        });
    });

    it('adds a linked recipe when selecting from search results', async () => {
        render(<RelatedContentStep {...mockProps} />);

        // Switch to recipes tab
        fireEvent.click(screen.getByTestId('tab-recipes'));

        await waitFor(() => {
            // Select a recipe from search results
            fireEvent.click(screen.getByTestId('mock-select-user'));
            // Verify that onAddLinkedRecipe callback was called with correct recipe data
            expect(mockProps.onAddLinkedRecipe).toHaveBeenCalledWith({
                id: 'recipe1',
                title: 'Test Recipe',
                user: { name: 'Chef' },
            });
        });
    });

    it('displays selected co-cooks', async () => {
        // Test props with a pre-selected co-cook
        const propsWithSelectedCooks = {
            ...mockProps,
            selectedCoCooks: [
                { id: 'user1', name: 'Test User', image: '/test.jpg' },
            ],
        };

        render(<RelatedContentStep {...propsWithSelectedCooks} />);

        // Should display the selected co-cooks section
        expect(screen.getByText('selected_co_cooks')).toBeDefined();
        expect(screen.getByText('Test User')).toBeDefined();
    });

    it('displays selected linked recipes', async () => {
        // Test props with a pre-selected linked recipe
        const propsWithSelectedRecipes = {
            ...mockProps,
            selectedLinkedRecipes: [
                {
                    id: 'recipe1',
                    title: 'Test Recipe',
                    imageSrc: '/recipe.jpg',
                    user: { name: 'Chef Test' },
                },
            ],
        };

        render(<RelatedContentStep {...propsWithSelectedRecipes} />);

        // Switch to recipes tab
        fireEvent.click(screen.getByTestId('tab-recipes'));

        await waitFor(() => {
            // Should display the selected linked recipes section
            expect(screen.getByText('selected_linked_recipes')).toBeDefined();
            expect(screen.getByText('Test Recipe')).toBeDefined();
            expect(screen.getByText('Chef Test')).toBeDefined();
        });
    });

    it('removes a co-cook when clicking remove button', async () => {
        // Test props with a pre-selected co-cook
        const propsWithSelectedCooks = {
            ...mockProps,
            selectedCoCooks: [
                { id: 'user1', name: 'Test User', image: '/test.jpg' },
            ],
        };

        render(<RelatedContentStep {...propsWithSelectedCooks} />);

        // Find and click the remove button
        const removeButtons = screen.getAllByRole('button');
        // The remove button should be present
        expect(removeButtons.length).toBeGreaterThan(0);

        fireEvent.click(removeButtons[removeButtons.length - 1]);

        // Verify that onRemoveCoCook callback was called with correct user ID
        expect(mockProps.onRemoveCoCook).toHaveBeenCalledWith('user1');
    });

    it('removes a linked recipe when clicking remove button', async () => {
        // Test props with a pre-selected linked recipe
        const propsWithSelectedRecipes = {
            ...mockProps,
            selectedLinkedRecipes: [
                {
                    id: 'recipe1',
                    title: 'Test Recipe',
                    imageSrc: '/recipe.jpg',
                    user: { name: 'Chef Test' },
                },
            ],
        };

        render(<RelatedContentStep {...propsWithSelectedRecipes} />);

        // Switch to recipes tab
        fireEvent.click(screen.getByTestId('tab-recipes'));

        await waitFor(() => {
            // Find and click the remove button
            const removeButtons = screen.getAllByRole('button');
            // The remove button should be present
            expect(removeButtons.length).toBeGreaterThan(0);

            fireEvent.click(removeButtons[removeButtons.length - 1]);

            // Verify that onRemoveLinkedRecipe callback was called with correct recipe ID
            expect(mockProps.onRemoveLinkedRecipe).toHaveBeenCalledWith(
                'recipe1'
            );
        });
    });

    it('filters search results when typing in search input', async () => {
        render(<RelatedContentStep {...mockProps} />);

        const searchInput = screen.getByTestId('search-input-field');

        act(() => {
            // Simulate typing in the search input
            fireEvent.change(searchInput, { target: { value: 'test query' } });
        });

        // Wait for debounce timer to complete
        await new Promise((r) => setTimeout(r, 400));

        // Verify that axios.get was called with the properly encoded search query
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('test%20query')
        );
    });

    it('clears search query when switching tabs', async () => {
        render(<RelatedContentStep {...mockProps} />);

        const searchInput = screen.getByTestId(
            'search-input-field'
        ) as HTMLInputElement;

        // Type something in search
        act(() => {
            fireEvent.change(searchInput, { target: { value: 'test query' } });
        });

        expect(searchInput.value).toBe('test query');

        // Switch to recipes tab
        fireEvent.click(screen.getByTestId('tab-recipes'));

        await waitFor(() => {
            // Search input should be cleared
            expect(searchInput.value).toBe('');
        });

        // Switch back to users tab
        fireEvent.click(screen.getByTestId('tab-users'));

        await waitFor(() => {
            // Search input should still be cleared
            expect(searchInput.value).toBe('');
        });
    });

    it('renders tabs component with correct props', () => {
        render(<RelatedContentStep {...mockProps} />);

        const tabsComponent = screen.getByTestId('related-content-tabs');
        expect(tabsComponent).toBeDefined();

        // Check that both tabs are rendered with correct test IDs
        expect(screen.getByTestId('tab-users')).toBeDefined();
        expect(screen.getByTestId('tab-recipes')).toBeDefined();
    });
});
