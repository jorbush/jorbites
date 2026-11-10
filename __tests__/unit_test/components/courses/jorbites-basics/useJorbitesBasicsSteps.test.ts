import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    useJorbitesBasicsSteps,
    JORBITES_BASICS_STEP_IDS,
} from '@/app/courses/jorbites-basics/steps/useJorbitesBasicsSteps';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('useJorbitesBasicsSteps', () => {
    it('returns the 6 defined jorbites basics step IDs', () => {
        expect(JORBITES_BASICS_STEP_IDS).toEqual([
            'requirements',
            'workflow',
            'interactions',
            'settings',
            'pwa',
            'test',
        ]);
    });

    it('computes completion status based on completedModules and isTestPassed', () => {
        const completedModules = {
            requirements: true,
            workflow: true,
            interactions: false,
        };

        const { result, rerender } = renderHook(
            ({ modules, testPassed }) =>
                useJorbitesBasicsSteps(modules, testPassed),
            {
                initialProps: {
                    modules: completedModules,
                    testPassed: false,
                },
            }
        );

        const steps = result.current;
        expect(steps).toHaveLength(6);

        expect(steps.find((s) => s.id === 'requirements')?.isCompleted).toBe(
            true
        );
        expect(steps.find((s) => s.id === 'workflow')?.isCompleted).toBe(true);
        expect(steps.find((s) => s.id === 'interactions')?.isCompleted).toBe(
            false
        );
        expect(steps.find((s) => s.id === 'settings')?.isCompleted).toBe(false);
        expect(steps.find((s) => s.id === 'pwa')?.isCompleted).toBe(false);
        expect(steps.find((s) => s.id === 'test')?.isCompleted).toBe(false);

        // Rerender with testPassed = true and more completed modules
        rerender({
            modules: {
                ...completedModules,
                interactions: true,
                settings: true,
                pwa: true,
            },
            testPassed: true,
        });

        const updatedSteps = result.current;
        expect(
            updatedSteps.find((s) => s.id === 'interactions')?.isCompleted
        ).toBe(true);
        expect(updatedSteps.find((s) => s.id === 'settings')?.isCompleted).toBe(
            true
        );
        expect(updatedSteps.find((s) => s.id === 'pwa')?.isCompleted).toBe(
            true
        );
        expect(updatedSteps.find((s) => s.id === 'test')?.isCompleted).toBe(
            true
        );
    });
});
