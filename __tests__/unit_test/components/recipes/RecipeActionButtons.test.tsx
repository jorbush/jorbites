import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeActionButtons from '@/app/components/recipes/RecipeActionButtons';

const mockPush = vi.fn();
const mockCooksnapOpen = vi.fn();
const mockLoginOpen = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'i_made_this') return 'I Made This!';
            if (key === 'remix_recipe') return 'Remix Recipe';
            return options?.defaultValue || key;
        },
    }),
}));

vi.mock('@/app/hooks/useCooksnapModal', () => ({
    default: () => ({
        onOpen: mockCooksnapOpen,
    }),
}));

vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({
        onOpen: mockLoginOpen,
    }),
}));

describe('RecipeActionButtons', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders both buttons with correct test IDs', () => {
        render(
            <RecipeActionButtons
                recipeId="recipe-123"
                recipeTitle="Spaghetti Bolognese"
            />
        );

        expect(
            screen.getByTestId('post-steps-cooksnap-btn')
        ).toBeInTheDocument();
        expect(screen.getByTestId('remix-recipe-btn')).toBeInTheDocument();
        expect(screen.getByText('I Made This!')).toBeInTheDocument();
        expect(screen.getByText('Remix Recipe')).toBeInTheDocument();
    });

    it('prompts login modal when clicked by an unauthenticated user', () => {
        render(
            <RecipeActionButtons
                recipeId="recipe-123"
                recipeTitle="Spaghetti Bolognese"
                currentUser={null}
            />
        );

        fireEvent.click(screen.getByTestId('post-steps-cooksnap-btn'));
        expect(mockLoginOpen).toHaveBeenCalledTimes(1);
        expect(mockCooksnapOpen).not.toHaveBeenCalled();

        fireEvent.click(screen.getByTestId('remix-recipe-btn'));
        expect(mockLoginOpen).toHaveBeenCalledTimes(2);
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('opens cooksnap modal and navigates to remix when logged in', () => {
        const mockUser: any = { id: 'user-1', name: 'Chef Mario' };

        render(
            <RecipeActionButtons
                recipeId="recipe-123"
                recipeTitle="Spaghetti Bolognese"
                currentUser={mockUser}
            />
        );

        fireEvent.click(screen.getByTestId('post-steps-cooksnap-btn'));
        expect(mockCooksnapOpen).toHaveBeenCalledWith(
            'recipe-123',
            'Spaghetti Bolognese'
        );

        fireEvent.click(screen.getByTestId('remix-recipe-btn'));
        expect(mockPush).toHaveBeenCalledWith(
            '/recipes/create?forkFrom=recipe-123'
        );
    });
});
