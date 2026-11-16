import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClientSearch } from '@/app/hooks/useClientSearch';

interface SampleItem {
    id: string;
    name: string;
    author?: string | null;
}

const SAMPLE_ITEMS: SampleItem[] = [
    { id: '1', name: 'Quick Dinners', author: 'Alice' },
    { id: '2', name: 'Vegan Desserts', author: 'Bob' },
    { id: '3', name: 'Sunday Brunch', author: null },
];

const extractFields = (item: SampleItem) => [item.name, item.author];

describe('useClientSearch', () => {
    it('returns all items when query is empty or whitespace', () => {
        const { result } = renderHook(() =>
            useClientSearch(SAMPLE_ITEMS, extractFields)
        );

        expect(result.current.isSearching).toBe(false);
        expect(result.current.filteredItems).toEqual(SAMPLE_ITEMS);

        act(() => {
            result.current.setSearchQuery('   ');
        });

        expect(result.current.isSearching).toBe(false);
        expect(result.current.filteredItems).toEqual(SAMPLE_ITEMS);
    });

    it('filters items case-insensitively across all extracted fields', () => {
        const { result } = renderHook(() =>
            useClientSearch(SAMPLE_ITEMS, extractFields)
        );

        act(() => {
            result.current.setSearchQuery('  VEGAN ');
        });

        expect(result.current.isSearching).toBe(true);
        expect(result.current.filteredItems).toEqual([SAMPLE_ITEMS[1]]);

        act(() => {
            result.current.setSearchQuery('alice');
        });

        expect(result.current.filteredItems).toEqual([SAMPLE_ITEMS[0]]);
    });

    it('clears search query when clearSearch is called', () => {
        const { result } = renderHook(() =>
            useClientSearch(SAMPLE_ITEMS, extractFields, 'brunch')
        );

        expect(result.current.isSearching).toBe(true);
        expect(result.current.filteredItems).toEqual([SAMPLE_ITEMS[2]]);

        act(() => {
            result.current.clearSearch();
        });

        expect(result.current.searchQuery).toBe('');
        expect(result.current.isSearching).toBe(false);
        expect(result.current.filteredItems).toEqual(SAMPLE_ITEMS);
    });
});
