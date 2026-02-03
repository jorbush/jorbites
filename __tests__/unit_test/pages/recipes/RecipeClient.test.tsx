import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeClient from '@/app/recipes/[recipeId]/RecipeClient';
import { SafeUser, SafeRecipe, SafeComment } from '@/app/types';

// Mocks
vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: () => false,
}));
vi.mock('axios');
vi.mock('react-hot-toast');
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));
vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({
        onOpen: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: vi.fn(),
            language: 'en',
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn(),
    },
}));

describe('RecipeClient', () => {
    const mockRecipe: SafeRecipe & { user: SafeUser } = {
        id: '1',
        title: 'Test Recipe',
        minutes: 30,
        imageSrc: 'http://test.jpg',
        extraImages: [],
        categories: ['Dinner'],
        method: 'Baking',
        description: 'Test description',
        ingredients: ['Ingredient 1', 'Ingredient 2'],
        steps: ['Step 1', 'Step 2'],
        numLikes: 5,
        userId: 'user1',
        coCooksIds: [],
        linkedRecipeIds: [],
        youtubeUrl: '',
        questId: null,
        createdAt: '2022-01-01', // Add the createdAt property with a valid date string
        user: {
            id: 'user1',
            name: 'Test User',
        } as SafeUser,
    };

    const mockCurrentUser: SafeUser = {
        id: 'user1',
        name: 'Test User',
    } as SafeUser;

    const mockComments: SafeComment[] = [
        {
            id: 'comment1',
            content: 'Test comment',
            userId: 'user2',
            comment: '',
            recipeId: '',
            createdAt: '2022-01-01', // Add the createdAt property with a valid date string
            user: {
                id: 'user2',
                name: 'Test User',
            } as SafeUser, // Add the user property with a valid SafeUser object
        } as SafeComment,
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders recipe details correctly', () => {
        const { getByText } = render(
            <RecipeClient
                recipe={mockRecipe}
                currentUser={mockCurrentUser}
                comments={mockComments}
            />
        );

        expect(getByText('Test Recipe')).toBeDefined();
        expect(getByText('30 min')).toBeDefined();
        expect(getByText('Test description')).toBeDefined();
        expect(getByText('Ingredient 1')).toBeDefined();
        expect(getByText('Step 1')).toBeDefined();
    });

    it('shows delete button for recipe owner', () => {
        const { getByText } = render(
            <RecipeClient
                recipe={mockRecipe}
                currentUser={mockCurrentUser}
                comments={mockComments}
            />
        );

        expect(getByText('delete_recipe')).toBeDefined();
    });

    it('does not show delete button for non-owner', () => {
        const nonOwner = {
            ...mockCurrentUser,
            id: 'user2',
        };
        const { queryByText } = render(
            <RecipeClient
                recipe={mockRecipe}
                currentUser={nonOwner}
                comments={mockComments}
            />
        );

        expect(queryByText('Delete Recipe')).toBeNull();
    });

    it('calls onCreateComment when adding a comment', async () => {
        const axios = await import('axios');
        vi.mocked(axios.default.post).mockResolvedValue({});

        const { getByPlaceholderText, getByTestId } = render(
            <RecipeClient
                recipe={mockRecipe}
                currentUser={mockCurrentUser}
                comments={mockComments}
            />
        );

        fireEvent.change(getByPlaceholderText('write_comment'), {
            target: { value: 'New comment' },
        });
        fireEvent.click(getByTestId('submit-comment'));

        await waitFor(() => {
            expect(axios.default.post).toHaveBeenCalledWith('/api/comments', {
                comment: 'New comment',
                recipeId: '1',
            });
        });
    });

    it('has correct id for comments section', () => {
        const { container } = render(
            <RecipeClient
                recipe={mockRecipe}
                currentUser={mockCurrentUser}
                comments={mockComments}
            />
        );
        expect(container.querySelector('#comments')).not.toBeNull();
    });
});
