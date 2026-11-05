import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useViewTransitionRouter from '@/app/hooks/useViewTransitionRouter';
import * as navigation from 'next/navigation';

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn(),
}));

describe('useViewTransitionRouter', () => {
    const mockRouter = {
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(navigation.useRouter).mockReturnValue(mockRouter as any);
        vi.mocked(navigation.usePathname).mockReturnValue('/current');
    });

    afterEach(() => {
        delete (document as any).startViewTransition;
    });

    it('falls back to standard router methods when startViewTransition is unsupported', () => {
        const { result } = renderHook(() => useViewTransitionRouter());

        act(() => {
            result.current.push('/destination');
        });
        expect(mockRouter.push).toHaveBeenCalledWith('/destination');

        act(() => {
            result.current.replace('/destination');
        });
        expect(mockRouter.replace).toHaveBeenCalledWith('/destination');

        act(() => {
            result.current.back();
        });
        expect(mockRouter.back).toHaveBeenCalled();
    });

    it('invokes document.startViewTransition on push when supported', async () => {
        const mockStartViewTransition = vi.fn((cb: () => Promise<void>) => {
            cb();
            return {
                ready: Promise.resolve(),
                finished: Promise.resolve(),
            };
        });
        (document as any).startViewTransition = mockStartViewTransition;

        const { result } = renderHook(() => useViewTransitionRouter());

        act(() => {
            result.current.push('/target');
        });

        expect(mockStartViewTransition).toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith('/target');
    });

    it('invokes document.startViewTransition on back when supported', () => {
        const mockStartViewTransition = vi.fn((cb: () => Promise<void>) => {
            cb();
            return {
                ready: Promise.resolve(),
                finished: Promise.resolve(),
            };
        });
        (document as any).startViewTransition = mockStartViewTransition;

        const { result } = renderHook(() => useViewTransitionRouter());

        act(() => {
            result.current.back();
        });

        expect(mockStartViewTransition).toHaveBeenCalled();
        expect(mockRouter.back).toHaveBeenCalled();
    });
});
