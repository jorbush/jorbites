import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useRecipeChecklist } from '@/app/hooks/useRecipeChecklist';

describe('useRecipeChecklist', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('initializes with empty completed state', () => {
        const { result } = renderHook(() =>
            useRecipeChecklist('recipe-1', 'ingredients')
        );

        expect(result.current.checkedIndices.size).toBe(0);
        expect(result.current.completedCount).toBe(0);
        expect(result.current.isCompleted(0)).toBe(false);
    });

    it('toggles an index on and off', () => {
        const { result } = renderHook(() =>
            useRecipeChecklist('recipe-1', 'ingredients')
        );

        act(() => {
            result.current.toggleIndex(0);
        });

        expect(result.current.isCompleted(0)).toBe(true);
        expect(result.current.completedCount).toBe(1);
        expect(
            localStorage.getItem('jorbites_recipe_recipe-1_ingredients')
        ).toBe(JSON.stringify([0]));

        act(() => {
            result.current.toggleIndex(0);
        });

        expect(result.current.isCompleted(0)).toBe(false);
        expect(result.current.completedCount).toBe(0);
        expect(
            localStorage.getItem('jorbites_recipe_recipe-1_ingredients')
        ).toBeNull();
    });

    it('resets all checked items', () => {
        const { result } = renderHook(() =>
            useRecipeChecklist('recipe-1', 'steps')
        );

        act(() => {
            result.current.toggleIndex(0);
            result.current.toggleIndex(2);
        });

        expect(result.current.completedCount).toBe(2);

        act(() => {
            result.current.resetChecklist();
        });

        expect(result.current.completedCount).toBe(0);
        expect(result.current.isCompleted(0)).toBe(false);
        expect(result.current.isCompleted(2)).toBe(false);
        expect(
            localStorage.getItem('jorbites_recipe_recipe-1_steps')
        ).toBeNull();
    });

    it('hydrates saved indices from localStorage', () => {
        localStorage.setItem(
            'jorbites_recipe_recipe-2_ingredients',
            JSON.stringify([1, 3])
        );

        const { result } = renderHook(() =>
            useRecipeChecklist('recipe-2', 'ingredients')
        );

        expect(result.current.isCompleted(1)).toBe(true);
        expect(result.current.isCompleted(3)).toBe(true);
        expect(result.current.isCompleted(0)).toBe(false);
        expect(result.current.completedCount).toBe(2);
    });

    it('handles undefined recipeId gracefully', () => {
        const { result } = renderHook(() =>
            useRecipeChecklist(undefined, 'ingredients')
        );

        act(() => {
            result.current.toggleIndex(1);
        });

        expect(result.current.isCompleted(1)).toBe(true);
        expect(result.current.completedCount).toBe(1);
    });

    it('synchronizes state in real time across multiple hook instances for the same recipe and type', () => {
        const pageHook = renderHook(() =>
            useRecipeChecklist('recipe-sync', 'ingredients')
        );
        const drawerHook = renderHook(() =>
            useRecipeChecklist('recipe-sync', 'ingredients')
        );

        // Toggle item 0 in the drawer hook
        act(() => {
            drawerHook.result.current.toggleIndex(0);
        });

        // Page hook immediately reflects item 0 checked
        expect(pageHook.result.current.isCompleted(0)).toBe(true);
        expect(pageHook.result.current.completedCount).toBe(1);

        // Toggle item 1 on the page hook without losing item 0 from the drawer
        act(() => {
            pageHook.result.current.toggleIndex(1);
        });

        expect(pageHook.result.current.isCompleted(0)).toBe(true);
        expect(pageHook.result.current.isCompleted(1)).toBe(true);
        expect(drawerHook.result.current.isCompleted(0)).toBe(true);
        expect(drawerHook.result.current.isCompleted(1)).toBe(true);
        expect(drawerHook.result.current.completedCount).toBe(2);

        // Resetting from page hook clears drawer hook as well
        act(() => {
            pageHook.result.current.resetChecklist();
        });

        expect(drawerHook.result.current.completedCount).toBe(0);
        expect(drawerHook.result.current.isCompleted(0)).toBe(false);
    });
});
