import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeIngredients from '@/app/components/recipes/RecipeIngredients';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

describe('RecipeIngredients', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        localStorage.clear();
    });

    const mockItems = ['2 cups flour', '1 tsp salt', '1 egg'];

    it('returns null when items is empty', () => {
        const { container } = render(
            <RecipeIngredients
                items={[]}
                recipeId="rec-1"
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders all items inside list elements with data-cy', () => {
        render(
            <RecipeIngredients
                items={mockItems}
                recipeId="rec-1"
            />
        );

        expect(screen.getByText('ingredients')).toBeDefined();
        expect(screen.getByText('2 cups flour')).toBeDefined();
        expect(screen.getByText('1 tsp salt')).toBeDefined();
        expect(screen.getByText('1 egg')).toBeDefined();

        const listItems = screen.getAllByRole('checkbox');
        expect(listItems).toHaveLength(3);
        listItems.forEach((item) => {
            expect(item.getAttribute('aria-checked')).toBe('false');
        });
    });

    it('toggles ingredient completion on click', () => {
        render(
            <RecipeIngredients
                items={mockItems}
                recipeId="rec-1"
            />
        );

        const firstItem = screen.getAllByRole('checkbox')[0];
        expect(firstItem.getAttribute('aria-checked')).toBe('false');

        fireEvent.click(firstItem);
        expect(firstItem.getAttribute('aria-checked')).toBe('true');

        // Check progress counter
        expect(screen.getByText('1/3')).toBeDefined();

        // Check Reset button is displayed
        const resetBtn = screen.getByRole('button', {
            name: /reset_checklist/i,
        });
        expect(resetBtn).toBeDefined();

        // Clicking reset button unchecks all
        fireEvent.click(resetBtn);
        expect(firstItem.getAttribute('aria-checked')).toBe('false');
        expect(screen.queryByText('1/3')).toBeNull();
    });

    it('toggles on Enter or Space key press', () => {
        render(
            <RecipeIngredients
                items={mockItems}
                recipeId="rec-1"
            />
        );

        const secondItem = screen.getAllByRole('checkbox')[1];
        fireEvent.keyDown(secondItem, { key: ' ' });
        expect(secondItem.getAttribute('aria-checked')).toBe('true');

        fireEvent.keyDown(secondItem, { key: 'Enter' });
        expect(secondItem.getAttribute('aria-checked')).toBe('false');
    });
});
