import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUseSyncExternalStore = vi.fn();

vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...actual,
        useSyncExternalStore: (
            sub: any,
            getSnapshot: any,
            getServerSnapshot: any
        ) => {
            mockUseSyncExternalStore(sub, getSnapshot, getServerSnapshot);
            return actual.useSyncExternalStore(
                sub,
                getSnapshot,
                getServerSnapshot
            );
        },
    };
});

import useIsMounted from '@/app/hooks/useIsMounted';

describe('useIsMounted', () => {
    beforeEach(() => {
        mockUseSyncExternalStore.mockClear();
    });

    it('should return true when rendered on the client', () => {
        const { result } = renderHook(() => useIsMounted());
        expect(result.current).toBe(true);
    });

    it('should pass correct subscribe and snapshots to useSyncExternalStore', () => {
        renderHook(() => useIsMounted());

        expect(mockUseSyncExternalStore).toHaveBeenCalled();
        const [subscribe, getSnapshot, getServerSnapshot] =
            mockUseSyncExternalStore.mock.calls[0];

        // Test subscribe function returns a cleanup function
        const unsubscribe = subscribe(() => {});
        expect(typeof unsubscribe).toBe('function');

        // Test snapshots return correct values
        expect(getSnapshot()).toBe(true);
        expect(getServerSnapshot()).toBe(false);
    });
});
