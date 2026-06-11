import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SelectedLinkedRecipesList } from '@/app/components/modals/recipe-steps/SelectedLinkedRecipesList';

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: any) => (
        <img
            src={src}
            alt={alt}
            data-testid="proxy-image"
        />
    ),
}));

const mockT = (key: string) => key;

describe('SelectedLinkedRecipesList', () => {
    afterEach(() => {
        cleanup();
    });

    const mockRecipes = [
        {
            id: 'r1',
            title: 'Linked Recipe 1',
            imageSrc: 'r1.jpg',
            user: { name: 'Chef 1' },
        },
    ];

    it('returns null if recipes list is empty', () => {
        const { container } = render(
            <SelectedLinkedRecipesList
                selectedLinkedRecipes={[]}
                onRemoveLinkedRecipe={vi.fn()}
                t={mockT}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders recipes list and triggers remove callback', () => {
        const mockRemove = vi.fn();
        render(
            <SelectedLinkedRecipesList
                selectedLinkedRecipes={mockRecipes}
                onRemoveLinkedRecipe={mockRemove}
                t={mockT}
            />
        );
        expect(screen.getByText('Linked Recipe 1')).toBeDefined();
        expect(screen.getByText('Chef 1')).toBeDefined();
        expect(screen.getByTestId('proxy-image')).toBeDefined();
        const button = screen.getByRole('button');
        button.click();
        expect(mockRemove).toHaveBeenCalledWith('r1');
    });
});
