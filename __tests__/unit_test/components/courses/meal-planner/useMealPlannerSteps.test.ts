import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    useMealPlannerSteps,
    MEAL_PLANNER_STEP_IDS,
} from '@/app/courses/meal-planner/steps/useMealPlannerSteps';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('useMealPlannerSteps', () => {
    it('returns the 5 defined meal planner step IDs', () => {
        expect(MEAL_PLANNER_STEP_IDS).toEqual([
            'requirements',
            'workflow',
            'slots',
            'exports',
            'test',
        ]);
    });

    it('computes completion status based on completedModules and isTestPassed', () => {
        const completedModules = {
            requirements: true,
            workflow: true,
            slots: false,
        };

        const { result, rerender } = renderHook(
            ({ modules, testPassed }) =>
                useMealPlannerSteps(modules, testPassed),
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
        expect(steps.find((s) => s.id === 'slots')?.isCompleted).toBe(false);
        expect(steps.find((s) => s.id === 'exports')?.isCompleted).toBe(false);
        expect(steps.find((s) => s.id === 'test')?.isCompleted).toBe(false);

        // Rerender with testPassed = true
        rerender({
            modules: { ...completedModules, slots: true, exports: true },
            testPassed: true,
        });

        expect(result.current.find((s) => s.id === 'test')?.isCompleted).toBe(
            true
        );
    });
});
