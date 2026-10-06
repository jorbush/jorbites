import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    useDraftsSteps,
    DRAFTS_STEP_IDS,
} from '@/app/components/courses/drafts/steps/useDraftsSteps';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('useDraftsSteps', () => {
    it('returns the 7 defined draft step IDs', () => {
        expect(DRAFTS_STEP_IDS).toEqual([
            'requirements',
            'workflow',
            'invites',
            'roles',
            'locking',
            'sync',
            'test',
        ]);
    });

    it('computes completion status based on completedModules and isTestPassed', () => {
        const completedModules = {
            requirements: true,
            workflow: true,
            invites: false,
        };

        const { result, rerender } = renderHook(
            ({ modules, testPassed }) => useDraftsSteps(modules, testPassed),
            {
                initialProps: {
                    modules: completedModules,
                    testPassed: false,
                },
            }
        );

        const steps = result.current;
        expect(steps).toHaveLength(7);

        expect(steps.find((s) => s.id === 'requirements')?.isCompleted).toBe(
            true
        );
        expect(steps.find((s) => s.id === 'workflow')?.isCompleted).toBe(true);
        expect(steps.find((s) => s.id === 'invites')?.isCompleted).toBe(false);
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
