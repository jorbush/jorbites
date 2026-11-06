import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecipeChecklistHeader from '@/app/components/recipes/RecipeChecklistHeader';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

describe('RecipeChecklistHeader', () => {
    it('renders title and does not show badge or reset when completedCount is 0', () => {
        const onReset = vi.fn();
        render(
            <RecipeChecklistHeader
                title="Ingredients"
                completedCount={0}
                totalCount={5}
                onReset={onReset}
            />
        );

        expect(screen.getByText('Ingredients')).toBeDefined();
        expect(screen.queryByText('0/5')).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders progress badge and reset button when completedCount > 0', () => {
        const onReset = vi.fn();
        render(
            <RecipeChecklistHeader
                title="Ingredients"
                completedCount={2}
                totalCount={5}
                onReset={onReset}
            />
        );

        expect(screen.getByText('Ingredients')).toBeDefined();
        expect(screen.getByText('2/5')).toBeDefined();

        const resetBtn = screen.getByRole('button', {
            name: /reset_checklist/i,
        });
        expect(resetBtn).toBeDefined();

        fireEvent.click(resetBtn);
        expect(onReset).toHaveBeenCalledTimes(1);
    });
});
