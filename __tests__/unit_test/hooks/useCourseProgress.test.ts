import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
    },
}));

describe('useCourseProgress', () => {
    const modulesKey = 'test_modules_key';
    const progressKey = 'test_progress_key';
    const allStepIds = ['step1', 'step2', 'test'];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('initializes with empty completed modules if local storage is empty', () => {
        const { result } = renderHook(() =>
            useCourseProgress(modulesKey, progressKey, allStepIds)
        );

        expect(result.current.completedModules).toEqual({});
        expect(result.current.isTestPassed).toBe(false);
    });

    it('initializes with stored completed modules if present in local storage', () => {
        localStorage.setItem(modulesKey, JSON.stringify({ step1: true }));

        const { result } = renderHook(() =>
            useCourseProgress(modulesKey, progressKey, allStepIds)
        );

        expect(result.current.completedModules).toEqual({ step1: true });
        expect(result.current.isTestPassed).toBe(false);
    });

    it('marks module completed and sets progress percentage in local storage', () => {
        const { result } = renderHook(() =>
            useCourseProgress(modulesKey, progressKey, allStepIds)
        );

        act(() => {
            result.current.markModuleCompleted('step1');
        });

        expect(result.current.completedModules).toEqual({ step1: true });
        expect(localStorage.getItem(modulesKey)).toBe(
            JSON.stringify({ step1: true })
        );
        // 1 of 3 completed = 33%
        expect(localStorage.getItem(progressKey)).toBe('33');
        expect(toast.success).toHaveBeenCalledWith('Module completed!');
    });

    it('updates isTestPassed when test step is marked completed', () => {
        const { result } = renderHook(() =>
            useCourseProgress(modulesKey, progressKey, allStepIds)
        );

        act(() => {
            result.current.markModuleCompleted('test');
        });

        expect(result.current.isTestPassed).toBe(true);
    });
});
