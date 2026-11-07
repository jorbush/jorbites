import React from 'react';
import {
    render,
    screen,
    fireEvent,
    cleanup,
    renderHook,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CookingGuideIngredientsDrawer from '@/app/components/recipes/CookingGuide/CookingGuideIngredientsDrawer';
import useRecipeChecklist from '@/app/hooks/useRecipeChecklist';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) =>
            options?.defaultValue || key,
    }),
}));

describe('CookingGuideIngredientsDrawer', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        cleanup();
        localStorage.clear();
    });

    it('returns null when closed or ingredients are empty', () => {
        const { rerender } = render(
            <CookingGuideIngredientsDrawer
                isOpen={false}
                onClose={vi.fn()}
                ingredients={['200g Flour']}
                recipeId="rec-1"
            />
        );
        expect(
            screen.queryByTestId('cooking-guide-ingredients-drawer')
        ).toBeNull();

        rerender(
            <CookingGuideIngredientsDrawer
                isOpen={true}
                onClose={vi.fn()}
                ingredients={[]}
                recipeId="rec-1"
            />
        );
        expect(
            screen.queryByTestId('cooking-guide-ingredients-drawer')
        ).toBeNull();
    });

    it('toggles ingredients and synchronizes with page useRecipeChecklist hook', () => {
        const onClose = vi.fn();
        const pageChecklist = renderHook(() =>
            useRecipeChecklist('rec-drawer-sync', 'ingredients')
        );

        render(
            <CookingGuideIngredientsDrawer
                isOpen={true}
                onClose={onClose}
                ingredients={['200g Flour', '200g Flour', '3 Eggs']}
                recipeId="rec-drawer-sync"
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(3);

        fireEvent.click(checkboxes[0]);
        expect(checkboxes[0].getAttribute('aria-checked')).toBe('true');
        expect(pageChecklist.result.current.isCompleted(0)).toBe(true);
        expect(pageChecklist.result.current.completedCount).toBe(1);

        fireEvent.click(screen.getByTestId('close-ingredients-drawer-btn'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
