import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    useQuestsSteps,
    QUESTS_STEP_IDS,
} from '@/app/courses/quests/useQuestsSteps';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('useQuestsSteps', () => {
    it('returns the 5 defined quests step IDs', () => {
        expect(QUESTS_STEP_IDS).toEqual([
            'requirements',
            'workflow',
            'linking',
            'statuses',
            'test',
        ]);
    });

    it('computes completion status based on completedModules and isTestPassed', () => {
        const completedModules = {
            requirements: true,
            workflow: true,
            linking: false,
        };

        const { result, rerender } = renderHook(
            ({ modules, testPassed }) => useQuestsSteps(modules, testPassed),
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
        expect(steps.find((s) => s.id === 'linking')?.isCompleted).toBe(false);
        expect(steps.find((s) => s.id === 'statuses')?.isCompleted).toBe(false);
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
