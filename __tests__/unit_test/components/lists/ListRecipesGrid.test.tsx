import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import ListRecipesGrid from '@/app/components/lists/ListRecipesGrid';
import { SafeRecipe, SafeUser } from '@/app/types';

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
            <span>{data.title}</span>
            {onAction && (
                <button
                    onClick={() => onAction(data.id)}
                    title={actionLabel}
                >
                    Remove
                </button>
            )}
        </div>
    ),
}));

describe('ListRecipesGrid', () => {
    const mockUser: SafeUser = {
        id: 'user-1',
        name: 'User 1',
        image: null,
        level: 1,
        verified: false,
        badges: [],
    };

    const mockRecipe: SafeRecipe & { user: SafeUser } = {
        id: 'recipe-1',
        title: 'Spaghetti Carbonara',
        imageSrc: '/carbonara.jpg',
        minutes: 20,
        description: 'Classic recipe',
        category: 'Pasta',
        method: 'Stove',
        numLikes: 10,
        ingredients: [],
        steps: [],
        extraImages: [],
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        coCooksIds: [],
        linkedRecipeIds: [],
        user: mockUser,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders empty state when recipes is empty', () => {
        render(
            <ListRecipesGrid
                recipes={[]}
                currentUser={mockUser}
                isOwner={true}
                deletingId=""
                onRemoveRecipe={vi.fn()}
            />
        );

        expect(screen.getByText('list_no_recipes')).toBeDefined();
        expect(screen.queryByTestId('recipe-card')).toBeNull();
    });

    it('renders recipe cards and allows removal when isOwner is true', () => {
        const onRemoveRecipe = vi.fn();
        render(
            <ListRecipesGrid
                recipes={[mockRecipe]}
                currentUser={mockUser}
                isOwner={true}
                deletingId=""
                onRemoveRecipe={onRemoveRecipe}
            />
        );

        expect(screen.getByText('Spaghetti Carbonara')).toBeDefined();
        const removeBtn = screen.getByText('Remove');
        fireEvent.click(removeBtn);

        expect(onRemoveRecipe).toHaveBeenCalledWith('recipe-1');
    });

    it('does not pass onAction when isOwner is false', () => {
        render(
            <ListRecipesGrid
                recipes={[mockRecipe]}
                currentUser={mockUser}
                isOwner={false}
                deletingId=""
                onRemoveRecipe={vi.fn()}
            />
        );

        expect(screen.getByText('Spaghetti Carbonara')).toBeDefined();
        expect(screen.queryByText('Remove')).toBeNull();
    });
});
