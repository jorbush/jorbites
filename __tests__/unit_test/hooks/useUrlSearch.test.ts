import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlSearch } from '@/app/hooks/useUrlSearch';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

describe('useUrlSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        window.history.replaceState({}, '', '/quests');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with initialSearch without triggering navigation', () => {
        const { result } = renderHook(() =>
            useUrlSearch({ basePath: '/quests', initialSearch: 'pasta' })
        );

        expect(result.current.searchQuery).toBe('pasta');
        expect(result.current.isSearching).toBe(true);
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('debounces URL updates when typing and preserves existing query params', () => {
        window.history.replaceState({}, '', '/quests?status=completed&page=3');

        const { result } = renderHook(() =>
            useUrlSearch({ basePath: '/quests', debounceMs: 300 })
        );

        act(() => {
            result.current.setSearchQuery('ramen');
        });

        expect(result.current.searchQuery).toBe('ramen');
        expect(mockPush).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(mockPush).toHaveBeenCalledWith(
            '/quests?status=completed&search=ramen',
            { scroll: false }
        );
    });

    it('submits immediately on submitSearch and cancels pending debounce', () => {
        const { result } = renderHook(() =>
            useUrlSearch({ basePath: '/quests', debounceMs: 300 })
        );

        act(() => {
            result.current.setSearchQuery('tacos');
        });

        act(() => {
            result.current.submitSearch();
        });

        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('/quests?search=tacos', {
            scroll: false,
        });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('clears search immediately and removes search param from URL', () => {
        window.history.replaceState({}, '', '/quests?status=all&search=pizza');

        const { result } = renderHook(() =>
            useUrlSearch({ basePath: '/quests', initialSearch: 'pizza' })
        );

        act(() => {
            result.current.clearSearch();
        });

        expect(result.current.searchQuery).toBe('');
        expect(mockPush).toHaveBeenCalledWith('/quests?status=all', {
            scroll: false,
        });
    });

    it('syncs searchQuery when initialSearch prop updates externally', () => {
        const { result, rerender } = renderHook(
            ({ initialSearch }) =>
                useUrlSearch({ basePath: '/quests', initialSearch }),
            { initialProps: { initialSearch: 'soup' } }
        );

        expect(result.current.searchQuery).toBe('soup');

        rerender({ initialSearch: 'curry' });
        expect(result.current.searchQuery).toBe('curry');
        expect(mockPush).not.toHaveBeenCalled();
    });
});
