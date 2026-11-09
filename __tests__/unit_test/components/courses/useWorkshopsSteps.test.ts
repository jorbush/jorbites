import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    useWorkshopsSteps,
    WORKSHOPS_STEP_IDS,
} from '@/app/courses/workshops/useWorkshopsSteps';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('useWorkshopsSteps', () => {
    it('returns the 5 defined workshop step IDs', () => {
        expect(WORKSHOPS_STEP_IDS).toEqual([
            'requirements',
            'workflow',
            'whitelist',
            'approvals',
            'test',
        ]);
    });

    it('computes completion status based on completedModules and isTestPassed', () => {
        const completedModules = {
            requirements: true,
            workflow: true,
            whitelist: false,
            approvals: false,
        };

        const { result, rerender } = renderHook(
            ({ modules, testPassed }) => useWorkshopsSteps(modules, testPassed),
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
        expect(steps.find((s) => s.id === 'whitelist')?.isCompleted).toBe(
            false
        );
        expect(steps.find((s) => s.id === 'approvals')?.isCompleted).toBe(
            false
        );
        expect(steps.find((s) => s.id === 'test')?.isCompleted).toBe(false);

        // Rerender with testPassed = true and whitelist/approvals completed
        rerender({
            modules: {
                ...completedModules,
                whitelist: true,
                approvals: true,
                test: true,
            },
            testPassed: true,
        });

        expect(
            result.current.find((s) => s.id === 'whitelist')?.isCompleted
        ).toBe(true);
        expect(
            result.current.find((s) => s.id === 'approvals')?.isCompleted
        ).toBe(true);
        expect(result.current.find((s) => s.id === 'test')?.isCompleted).toBe(
            true
        );
    });
});
