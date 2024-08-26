import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DeleteRecipeButton from '@/app/components/recipes/DeleteRecipeButton';

// Mock the react-i18next module
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock the DeleteRecipeModal component
vi.mock('@/app/components/modals/DeleteRecipeModal', () => ({
    default: ({
        open,
        id,
    }: {
        open: boolean;
        setIsOpen: (open: boolean) => void;
        id: string;
    }) => (
        <div data-testid="delete-recipe-modal">
            {open && <div>Delete Recipe Modal for ID: {id}</div>}
        </div>
    ),
}));

// Mock the Button component
vi.mock('@/app/components/Button', () => ({
    default: ({ label, onClick }: { label: string; onClick: () => void }) => (
        <button
            onClick={onClick}
            data-testid="delete-button"
        >
            {label}
        </button>
    ),
}));

describe('<DeleteRecipeButton />', () => {
    const recipeId = '123';

    beforeEach(() => {
        render(<DeleteRecipeButton id={recipeId} />);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the delete button', () => {
        const button = screen.getByTestId('delete-button');
        expect(button).toBeDefined();
        expect(button.textContent).toBe('delete_recipe');
    });

    it('opens the DeleteRecipeModal when button is clicked', () => {
        const button = screen.getByTestId('delete-button');
        fireEvent.click(button);

        const modal = screen.getByTestId('delete-recipe-modal');
        expect(modal.textContent).toContain(
            `Delete Recipe Modal for ID: ${recipeId}`
        );
    });

    it('initially does not show the DeleteRecipeModal content', () => {
        const modal = screen.getByTestId('delete-recipe-modal');
        expect(modal.textContent).not.toContain(
            `Delete Recipe Modal for ID: ${recipeId}`
        );
    });
});
