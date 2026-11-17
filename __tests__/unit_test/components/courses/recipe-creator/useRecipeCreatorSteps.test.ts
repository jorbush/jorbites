import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    useRecipeCreatorSteps,
    RECIPE_CREATOR_STEP_IDS,
} from '@/app/courses/recipe-creator/useRecipeCreatorSteps';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('useRecipeCreatorSteps', () => {
    it('returns the 5 defined recipe creator step IDs', () => {
        expect(RECIPE_CREATOR_STEP_IDS).toEqual([
            'requirements',
            'workflow',
            'plaintext',
            'drafts',
            'test',
        ]);
    });

    it('computes completion status based on completedModules and isTestPassed', () => {
        const completedModules = {
            requirements: true,
            workflow: true,
            plaintext: false,
            drafts: false,
        };

        const { result, rerender } = renderHook(
            ({ modules, testPassed }) =>
                useRecipeCreatorSteps(modules, testPassed),
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
        expect(steps.find((s) => s.id === 'plaintext')?.isCompleted).toBe(
            false
        );
        expect(steps.find((s) => s.id === 'drafts')?.isCompleted).toBe(false);
        expect(steps.find((s) => s.id === 'test')?.isCompleted).toBe(false);

        // Rerender with testPassed = true
        rerender({
            modules: { ...completedModules, test: true },
            testPassed: true,
        });

        expect(result.current.find((s) => s.id === 'test')?.isCompleted).toBe(
            true
        );
    });
});
