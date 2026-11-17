import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePathname, useSearchParams } from 'next/navigation';
import {
    buildNavbarSearchUrl,
    hasAnyActiveFilter,
    isFilterablePathname,
    useNavbarSearch,
} from '@/app/components/navbar/useNavbarSearch';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
    useSearchParams: vi.fn(),
    usePathname: vi.fn(() => '/'),
}));

describe('useNavbarSearch helpers', () => {
    describe('isFilterablePathname', () => {
        it('returns true for main and favorites routes', () => {
            expect(isFilterablePathname('/')).toBe(true);
            expect(isFilterablePathname('/favorites')).toBe(true);
        });

        it('returns false for other routes or null', () => {
            expect(isFilterablePathname('/recipes/123')).toBe(false);
            expect(isFilterablePathname('/quests')).toBe(false);
            expect(isFilterablePathname(null)).toBe(false);
        });
    });

    describe('hasAnyActiveFilter', () => {
        it('returns false for null or empty params', () => {
            expect(hasAnyActiveFilter(null)).toBe(false);
            expect(hasAnyActiveFilter(new URLSearchParams())).toBe(false);
        });

        it('returns false when only orderBy or search is set', () => {
            expect(
                hasAnyActiveFilter(
                    new URLSearchParams('orderBy=most_liked&search=cake')
                )
            ).toBe(false);
        });

        it.each([
            'category=dessert',
            'startDate=2024-01-01',
            'endDate=2024-01-31',
            'minCalories=100',
            'maxCalories=500',
            'minYield=2',
            'maxYield=6',
            'recipeCuisine=Italian',
        ])('returns true when %s is set', (param) => {
            expect(hasAnyActiveFilter(new URLSearchParams(param))).toBe(true);
        });
    });

    describe('buildNavbarSearchUrl', () => {
        it('sets trimmed search query and resets page on main route', () => {
            const url = buildNavbarSearchUrl(
                '/',
                new URLSearchParams('page=3&category=dessert'),
                { query: '  pasta  ', resetPage: true }
            );
            expect(url).toBe('/?category=dessert&search=pasta');
        });

        it('preserves pathname for favorites route', () => {
            const url = buildNavbarSearchUrl(
                '/favorites',
                new URLSearchParams('category=vegan'),
                { query: 'tofu', resetPage: true }
            );
            expect(url).toBe('/favorites?category=vegan&search=tofu');
        });

        it('deletes search param and omits trailing question mark when empty', () => {
            const url = buildNavbarSearchUrl(
                '/',
                new URLSearchParams('search=pasta'),
                { resetPage: false }
            );
            expect(url).toBe('/');
        });

        it('falls back to root when pathname is null', () => {
            const url = buildNavbarSearchUrl(null, new URLSearchParams(), {
                query: 'soup',
            });
            expect(url).toBe('/?search=soup');
        });
    });
});

describe('useNavbarSearch', () => {
    let mockParams: URLSearchParams;

    beforeEach(() => {
        vi.clearAllMocks();
        mockParams = new URLSearchParams();
        vi.mocked(useSearchParams).mockImplementation(
            () => mockParams as unknown as ReturnType<typeof useSearchParams>
        );
        vi.mocked(usePathname).mockReturnValue('/');
    });

    it('initializes state from current search param and fires initial callback', () => {
        mockParams = new URLSearchParams('search=ramen');
        const onSearchModeChange = vi.fn();

        const { result } = renderHook(() =>
            useNavbarSearch({ onSearchModeChange })
        );

        expect(result.current.isSearchMode).toBe(true);
        expect(result.current.searchQuery).toBe('ramen');
        expect(onSearchModeChange).toHaveBeenCalledWith(true);
    });

    it('syncs state when search param changes externally', () => {
        const onSearchModeChange = vi.fn();
        const { result, rerender } = renderHook(() =>
            useNavbarSearch({ onSearchModeChange })
        );

        expect(result.current.isSearchMode).toBe(false);

        mockParams = new URLSearchParams('search=tacos');
        rerender();

        expect(result.current.isSearchMode).toBe(true);
        expect(result.current.searchQuery).toBe('tacos');
        expect(onSearchModeChange).toHaveBeenCalledWith(true);

        mockParams = new URLSearchParams();
        rerender();

        expect(result.current.isSearchMode).toBe(false);
        expect(result.current.searchQuery).toBe('');
        expect(onSearchModeChange).toHaveBeenLastCalledWith(false);
    });

    it('submits search on filterable page and ignores non-filterable page', () => {
        mockParams = new URLSearchParams('page=2');
        const preventDefault = vi.fn();
        const { result } = renderHook(() => useNavbarSearch({}));

        act(() => {
            result.current.handleSearchChange('risotto');
        });
        act(() => {
            result.current.handleSearchSubmit({
                preventDefault,
            } as unknown as React.FormEvent);
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(mockReplace).toHaveBeenCalledWith('/?search=risotto');

        vi.clearAllMocks();
        vi.mocked(usePathname).mockReturnValue('/recipes/123');
        const { result: nonFilterableResult } = renderHook(() =>
            useNavbarSearch({})
        );
        act(() => {
            nonFilterableResult.current.handleSearchSubmit();
        });
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('toggles search mode and clears URL search when closing active search', () => {
        mockParams = new URLSearchParams('search=salad&category=lunch');
        const onSearchModeChange = vi.fn();

        const { result } = renderHook(() =>
            useNavbarSearch({ onSearchModeChange })
        );

        act(() => {
            result.current.handleSearchToggle();
        });

        expect(result.current.isSearchMode).toBe(false);
        expect(onSearchModeChange).toHaveBeenCalledWith(false);
        expect(mockPush).toHaveBeenCalledWith('/?category=lunch');

        act(() => {
            result.current.handleSearchToggle();
        });

        expect(result.current.isSearchMode).toBe(true);
        expect(onSearchModeChange).toHaveBeenCalledWith(true);
    });

    it('exits search mode on Escape key only', () => {
        mockParams = new URLSearchParams('search=cake');
        const onSearchModeChange = vi.fn();

        const { result } = renderHook(() =>
            useNavbarSearch({ onSearchModeChange })
        );

        act(() => {
            result.current.handleKeyDown({
                key: 'Enter',
            } as React.KeyboardEvent);
        });
        expect(result.current.isSearchMode).toBe(true);

        act(() => {
            result.current.handleKeyDown({
                key: 'Escape',
            } as React.KeyboardEvent);
        });
        expect(result.current.isSearchMode).toBe(false);
    });
});
