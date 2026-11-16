import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useSearchFilter } from '@/app/hooks/useSearchFilter';
import { useDebouncedValue } from '@/app/hooks/useDebouncedValue';

describe('useSearchFilter', () => {
    const items = [
        { id: '1', name: 'Vegan Week' },
        { id: '2', name: 'Mediterranean Plan' },
    ];
    const getFields = (item: { name: string }) => [item.name];

    afterEach(() => {
        cleanup();
    });

    it('filters items as searchQuery changes and resets on clearSearch', () => {
        const { result } = renderHook(() => useSearchFilter(items, getFields));

        expect(result.current.isSearching).toBe(false);
        expect(result.current.filteredItems).toEqual(items);

        act(() => {
            result.current.setSearchQuery('vegan');
        });

        expect(result.current.isSearching).toBe(true);
        expect(result.current.filteredItems).toEqual([items[0]]);

        act(() => {
            result.current.clearSearch();
        });

        expect(result.current.searchQuery).toBe('');
        expect(result.current.isSearching).toBe(false);
        expect(result.current.filteredItems).toEqual(items);
    });
});

describe('useDebouncedValue', () => {
    afterEach(() => {
        vi.useRealTimers();
        cleanup();
    });

    it('updates debounced value after delay', () => {
        vi.useFakeTimers();

        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 300),
            { initialProps: { value: '' } }
        );

        expect(result.current).toBe('');

        rerender({ value: 'bread' });
        expect(result.current).toBe('');

        act(() => {
            vi.advanceTimersByTime(299);
        });
        expect(result.current).toBe('');

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current).toBe('bread');
    });
});
