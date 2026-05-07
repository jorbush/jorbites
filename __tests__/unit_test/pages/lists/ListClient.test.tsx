import {
    render,
    screen,
    fireEvent,
    cleanup,
    act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ListClient from '@/app/lists/[listId]/ListClient';
import { SafeList, SafeUser, SafeRecipe } from '@/app/types';
import axios from 'axios';

const mockShare = vi.fn();

vi.mock('axios');
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn(),
    }),
}));
vi.mock('@/app/hooks/useShare', () => ({
    default: () => ({
        share: mockShare,
    }),
}));

// Mock RecipeCard
vi.mock('@/app/components/recipes/RecipeCard', () => ({
    default: ({
        data,
        onAction,
        actionLabel,
    }: {
        data: SafeRecipe;
        onAction?: (id: string) => void;
        actionLabel?: string;
    }) => (
        <div data-testid="recipe-card">
            {data.title}
            {onAction && (
                <button
                    onClick={() => onAction(data.id)}
                    title={actionLabel}
                >
                    Delete Recipe
                </button>
            )}
        </div>
    ),
}));

const mockUser: SafeUser = {
    id: 'user-id',
    name: 'Test User',
    image: null,
    level: 1,
    verified: false,
    badges: [],
};

const mockList: SafeList = {
    id: 'list-1',
    name: 'My Special List',
    userId: 'user-id',
    recipeIds: ['recipe-1'],
    isDefault: false,
    isPrivate: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: mockUser,
};

const mockRecipes: (SafeRecipe & { user: SafeUser })[] = [
    {
        id: 'recipe-1',
        title: 'Recipe 1',
        imageSrc: '/recipe1.jpg',
        minutes: 30,
        description: 'Desc 1',
        category: 'Cat 1',
        method: 'Method 1',
        numLikes: 5,
        ingredients: [],
        steps: [],
        extraImages: [],
        userId: 'user-id',
        createdAt: new Date().toISOString(),
        coCooksIds: [],
        linkedRecipeIds: [],
        user: mockUser,
    },
];

describe('ListClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockShare.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders list details and recipes', () => {
        render(
            <ListClient
                list={mockList}
                recipes={mockRecipes}
                currentUser={mockUser}
            />
        );

        expect(screen.getByText('My Special List')).toBeDefined();
        expect(screen.getByText('Recipe 1')).toBeDefined();
        expect(screen.queryByText('private')).toBeNull();
    });

    it('shows delete button for owner if not default list', () => {
        render(
            <ListClient
                list={mockList}
                recipes={mockRecipes}
                currentUser={mockUser}
            />
        );

        expect(screen.getByTitle('delete_list')).toBeDefined();
    });

    it('does not show delete button if not owner', () => {
        const otherUser = { ...mockUser, id: 'other-id' };
        render(
            <ListClient
                list={mockList}
                recipes={mockRecipes}
                currentUser={otherUser}
            />
        );

        expect(screen.queryByTitle('delete_list')).toBeNull();
    });

    it('does not show delete button for default list', () => {
        const defaultList = { ...mockList, isDefault: true };
        render(
            <ListClient
                list={defaultList}
                recipes={mockRecipes}
                currentUser={mockUser}
            />
        );

        expect(screen.queryByTitle('delete_list')).toBeNull();
    });

    it('calls axios.delete when confirmed', async () => {
        vi.mocked(axios.delete).mockResolvedValue({ data: {} });
        render(
            <ListClient
                list={mockList}
                recipes={mockRecipes}
                currentUser={mockUser}
            />
        );

        fireEvent.click(screen.getByTitle('delete_list'));

        const confirmButton = screen.getByTestId('modal-action-button');
        await act(async () => {
            fireEvent.click(confirmButton);
        });

        expect(axios.delete).toHaveBeenCalledWith('/api/lists/list-1');
    });

    it('toggles privacy', async () => {
        vi.mocked(axios.patch).mockResolvedValue({ data: {} });
        render(
            <ListClient
                list={mockList}
                recipes={mockRecipes}
                currentUser={mockUser}
            />
        );

        const toggleButton = screen.getByTitle('private');
        expect(toggleButton).toBeDefined();

        await act(async () => {
            fireEvent.click(toggleButton!);
        });

        expect(axios.patch).toHaveBeenCalledWith('/api/lists/list-1', {
            isPrivate: false,
        });
    });

    it('calls axios.delete to remove a recipe from the list', async () => {
        vi.mocked(axios.delete).mockResolvedValue({ data: {} });
        render(
            <ListClient
                list={mockList}
                recipes={mockRecipes}
                currentUser={mockUser}
            />
        );

        const deleteRecipeButton = screen.getByText('Delete Recipe');
        await act(async () => {
            fireEvent.click(deleteRecipeButton);
        });

        expect(axios.delete).toHaveBeenCalledWith(
            '/api/lists/list-1/recipes/recipe-1'
        );
    });

    it('does not show remove recipe button if not owner', () => {
        const otherUser = { ...mockUser, id: 'other-id' };
        render(
            <ListClient
                list={mockList}
                recipes={mockRecipes}
                currentUser={otherUser}
            />
        );

        expect(screen.queryByText('Delete Recipe')).toBeNull();
    });

    it('renders the correct padlock icon and styles based on privacy state', () => {
        const { unmount } = render(
            <ListClient
                list={mockList} // isPrivate: true
                recipes={mockRecipes}
                currentUser={mockUser}
            />
        );

        expect(screen.getByTitle('private')).toBeDefined();
        const lockIcon = screen.getByTestId('lock-icon');
        expect(lockIcon).toBeDefined();
        expect(lockIcon.getAttribute('class')).toContain('text-neutral-700');
        expect(lockIcon.getAttribute('class')).toContain(
            'dark:text-neutral-300'
        );
        expect(screen.queryByTitle('Share')).toBeNull();

        unmount();

        const publicList = { ...mockList, isPrivate: false };
        render(
            <ListClient
                list={publicList}
                recipes={mockRecipes}
                currentUser={mockUser}
            />
        );

        expect(screen.getByTitle('public')).toBeDefined();
        const lockOpenIcon = screen.getByTestId('lock-open-icon');
        expect(lockOpenIcon).toBeDefined();
        expect(lockOpenIcon.getAttribute('class')).toContain(
            'text-neutral-700'
        );
        expect(lockOpenIcon.getAttribute('class')).toContain(
            'dark:text-neutral-300'
        );
        const shareButton = screen.getByTitle('Share');
        expect(shareButton).toBeDefined();

        fireEvent.click(shareButton);
        expect(mockShare).toHaveBeenCalledWith({
            title: 'My Special List',
        });
    });
});
