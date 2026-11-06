import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeSteps from '@/app/components/recipes/RecipeSteps';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

describe('RecipeSteps', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        localStorage.clear();
    });

    const mockSteps = [
        'Preheat oven to 180°C',
        'Mix wet ingredients',
        'Bake for 30 minutes',
    ];

    it('returns null when items is empty', () => {
        const { container } = render(
            <RecipeSteps
                items={[]}
                recipeId="rec-1"
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders all steps with data-cy and sequential numbers', () => {
        render(
            <RecipeSteps
                items={mockSteps}
                recipeId="rec-1"
            />
        );

        expect(screen.getByText('steps')).toBeDefined();
        expect(screen.getByText('Preheat oven to 180°C')).toBeDefined();
        expect(screen.getByText('Mix wet ingredients')).toBeDefined();
        expect(screen.getByText('Bake for 30 minutes')).toBeDefined();

        expect(screen.getByText('1')).toBeDefined();
        expect(screen.getByText('2')).toBeDefined();
        expect(screen.getByText('3')).toBeDefined();
    });

    it('toggles step completion on click and shows progress badge', () => {
        render(
            <RecipeSteps
                items={mockSteps}
                recipeId="rec-1"
            />
        );

        const firstStep = screen.getAllByRole('checkbox')[0];
        expect(firstStep.getAttribute('aria-checked')).toBe('false');

        fireEvent.click(firstStep);
        expect(firstStep.getAttribute('aria-checked')).toBe('true');

        // Check progress counter
        expect(screen.getByText('1/3')).toBeDefined();

        // Check Reset button is displayed
        const resetBtn = screen.getByRole('button', {
            name: /reset_checklist/i,
        });
        expect(resetBtn).toBeDefined();

        // Clicking reset button unchecks all
        fireEvent.click(resetBtn);
        expect(firstStep.getAttribute('aria-checked')).toBe('false');
        expect(screen.queryByText('1/3')).toBeNull();
        expect(screen.getByText('1')).toBeDefined();
    });

    it('toggles step completion via keyboard navigation', () => {
        render(
            <RecipeSteps
                items={mockSteps}
                recipeId="rec-1"
            />
        );

        const thirdStep = screen.getAllByRole('checkbox')[2];
        fireEvent.keyDown(thirdStep, { key: ' ' });
        expect(thirdStep.getAttribute('aria-checked')).toBe('true');

        fireEvent.keyDown(thirdStep, { key: 'Enter' });
        expect(thirdStep.getAttribute('aria-checked')).toBe('false');
    });
});
