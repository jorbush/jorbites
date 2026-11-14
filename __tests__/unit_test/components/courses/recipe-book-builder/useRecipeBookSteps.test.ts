import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    useRecipeBookSteps,
    RECIPE_BOOK_STEP_IDS,
} from '@/app/courses/recipe-book-builder/steps/useRecipeBookSteps';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('useRecipeBookSteps', () => {
    it('returns the 5 defined recipe book step IDs', () => {
        expect(RECIPE_BOOK_STEP_IDS).toEqual([
            'requirements',
            'workflow',
            'styles',
            'selection',
            'test',
        ]);
    });

    it('computes completion status based on completedModules and isTestPassed', () => {
        const completedModules = {
            requirements: true,
            workflow: true,
            styles: false,
        };

        const { result, rerender } = renderHook(
            ({ modules, testPassed }) =>
                useRecipeBookSteps(modules, testPassed),
            {
                initialProps: {
                    modules: completedModules,
                    testPassed: false,
                },
            }
        );

        const steps = result.current;
        expect(steps).toHaveLength(5);

        expect(steps.find((s) => s.id === 'requirements')?.isCompleted).toBe(
            true
        );
        expect(steps.find((s) => s.id === 'workflow')?.isCompleted).toBe(true);
        expect(steps.find((s) => s.id === 'styles')?.isCompleted).toBe(false);
        expect(steps.find((s) => s.id === 'selection')?.isCompleted).toBe(
            false
        );
        expect(steps.find((s) => s.id === 'test')?.isCompleted).toBe(false);

        // Rerender with testPassed = true
        rerender({
            modules: { ...completedModules, styles: true, selection: true },
            testPassed: true,
        });

        expect(result.current.find((s) => s.id === 'test')?.isCompleted).toBe(
            true
        );
    });
});
