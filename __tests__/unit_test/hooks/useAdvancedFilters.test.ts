import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    useAdvancedFilters,
    extractFilterValues,
    hasAnyFilterSet,
    isFilterablePath,
    getNextCuisine,
    buildFilterUrl,
    useDropdownOutsideClick,
    EMPTY_ADVANCED_FILTERS,
} from '@/app/hooks/useAdvancedFilters';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
let mockCurrentPathname = '/';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
    useSearchParams: () => mockSearchParams,
    usePathname: () => mockCurrentPathname,
}));

describe('useAdvancedFilters helper functions', () => {
    describe('extractFilterValues', () => {
        it('returns empty strings when search params are empty or null', () => {
            const result = extractFilterValues(null as any);
            expect(result).toEqual(EMPTY_ADVANCED_FILTERS);
        });

        it('extracts all filter values from searchParams', () => {
            const params = new URLSearchParams({
                minCalories: '100',
                maxCalories: '500',
                minYield: '1',
                maxYield: '4',
                recipeCuisine: 'Mexican',
                startDate: '2024-01-01',
                endDate: '2024-01-10',
            });
            const result = extractFilterValues(params as any);
            expect(result).toEqual({
                minCalories: '100',
                maxCalories: '500',
                minYield: '1',
                maxYield: '4',
                recipeCuisine: 'Mexican',
                startDate: '2024-01-01',
                endDate: '2024-01-10',
            });
        });
    });

    describe('hasAnyFilterSet', () => {
        it('returns false when no filter values are set', () => {
            expect(hasAnyFilterSet(EMPTY_ADVANCED_FILTERS)).toBe(false);
            expect(hasAnyFilterSet({})).toBe(false);
        });

        it('returns true when any filter value is set', () => {
            expect(hasAnyFilterSet({ minCalories: '200' })).toBe(true);
            expect(hasAnyFilterSet({ recipeCuisine: 'Italian' })).toBe(true);
        });
    });

    describe('isFilterablePath', () => {
        it('returns true for main page and favorites page', () => {
            expect(isFilterablePath('/')).toBe(true);
            expect(isFilterablePath('/favorites')).toBe(true);
        });

        it('returns false for other pages', () => {
            expect(isFilterablePath('/recipes/123')).toBe(false);
            expect(isFilterablePath('/profile')).toBe(false);
        });
    });

    describe('getNextCuisine', () => {
        it('toggles off cuisine if clicked again (case-insensitive)', () => {
            expect(getNextCuisine('Italian', 'Italian')).toBe('');
            expect(getNextCuisine('italian', 'ITALIAN')).toBe('');
        });

        it('returns new cuisine when different', () => {
            expect(getNextCuisine('Italian', 'Mexican')).toBe('Mexican');
            expect(getNextCuisine('', 'Mexican')).toBe('Mexican');
        });
    });

    describe('buildFilterUrl', () => {
        it('builds URL for home page with active filters', () => {
            const params = new URLSearchParams('page=2&other=keep');
            const url = buildFilterUrl('/', params as any, {
                ...EMPTY_ADVANCED_FILTERS,
                minCalories: '250',
                recipeCuisine: 'Mexican',
            });
            expect(url).toBe(
                '/?other=keep&minCalories=250&recipeCuisine=Mexican'
            );
        });

        it('builds URL for home page without active filters', () => {
            const params = new URLSearchParams('page=2');
            const url = buildFilterUrl(
                '/',
                params as any,
                EMPTY_ADVANCED_FILTERS
            );
            expect(url).toBe('/');
        });

        it('builds URL for favorites page', () => {
            const params = new URLSearchParams('');
            const url = buildFilterUrl('/favorites', params as any, {
                ...EMPTY_ADVANCED_FILTERS,
                minYield: '4',
            });
            expect(url).toBe('/favorites?minYield=4');
        });

        it('clears parameters that have empty values', () => {
            const params = new URLSearchParams(
                'minCalories=100&recipeCuisine=Italian'
            );
            const url = buildFilterUrl(
                '/',
                params as any,
                EMPTY_ADVANCED_FILTERS
            );
            expect(url).toBe('/');
        });
    });
});

describe('useDropdownOutsideClick', () => {
    it('calls onClose when clicking outside element while open', () => {
        const onClose = vi.fn();
        const container = document.createElement('div');
        const outsideElement = document.createElement('div');
        document.body.appendChild(container);
        document.body.appendChild(outsideElement);

        const ref = { current: container };

        const { unmount } = renderHook(() =>
            useDropdownOutsideClick(ref, true, onClose)
        );

        const event = new MouseEvent('mousedown', { bubbles: true });
        outsideElement.dispatchEvent(event);

        expect(onClose).toHaveBeenCalledTimes(1);

        // Clicking inside container should not trigger onClose
        container.dispatchEvent(event);
        expect(onClose).toHaveBeenCalledTimes(1);

        unmount();
        document.body.removeChild(container);
        document.body.removeChild(outsideElement);
    });

    it('does not register listener when isOpen is false', () => {
        const onClose = vi.fn();
        const container = document.createElement('div');
        const outsideElement = document.createElement('div');
        document.body.appendChild(container);
        document.body.appendChild(outsideElement);

        const ref = { current: container };

        renderHook(() => useDropdownOutsideClick(ref, false, onClose));

        const event = new MouseEvent('mousedown', { bubbles: true });
        outsideElement.dispatchEvent(event);

        expect(onClose).not.toHaveBeenCalled();

        document.body.removeChild(container);
        document.body.removeChild(outsideElement);
    });
});

describe('useAdvancedFilters', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentPathname = '/';
        // Clear search params
        Array.from(mockSearchParams.keys()).forEach((key) => {
            mockSearchParams.delete(key);
        });
        vi.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should initialize with values from search params', () => {
        mockSearchParams.set('minCalories', '200');
        mockSearchParams.set('maxCalories', '500');
        mockSearchParams.set('minYield', '2');
        mockSearchParams.set('maxYield', '6');
        mockSearchParams.set('recipeCuisine', 'Mexican');
        mockSearchParams.set('startDate', '2024-01-01');
        mockSearchParams.set('endDate', '2024-01-10');

        const { result } = renderHook(() =>
            useAdvancedFilters(mockSearchParams)
        );

        expect(result.current.tempMinCalories).toBe('200');
        expect(result.current.tempMaxCalories).toBe('500');
        expect(result.current.tempMinYield).toBe('2');
        expect(result.current.tempMaxYield).toBe('6');
        expect(result.current.tempCuisine).toBe('Mexican');
        expect(result.current.tempStartDate).toBe('2024-01-01');
        expect(result.current.tempEndDate).toBe('2024-01-10');
        expect(result.current.isOpen).toBe(false);
        expect(result.current.hasActiveFilters).toBe(true);
        expect(result.current.isAnyTempFilterSet).toBe(true);
    });

    it('should allow toggling cuisine pill clicks', () => {
        const { result } = renderHook(() =>
            useAdvancedFilters(mockSearchParams)
        );

        act(() => {
            result.current.handleCuisinePillClick('Italian');
        });
        expect(result.current.tempCuisine).toBe('Italian');

        // Click again to toggle off
        act(() => {
            result.current.handleCuisinePillClick('Italian');
        });
        expect(result.current.tempCuisine).toBe('');
    });

    it('should apply filters to URL search params', () => {
        const { result } = renderHook(() =>
            useAdvancedFilters(mockSearchParams)
        );

        act(() => {
            result.current.dispatch({
                type: 'SET_MIN_CALORIES',
                payload: '150',
            });
            result.current.dispatch({
                type: 'SET_MAX_CALORIES',
                payload: '400',
            });
            result.current.dispatch({ type: 'SET_MIN_YIELD', payload: '3' });
            result.current.dispatch({
                type: 'SET_CUISINE',
                payload: 'Italian',
            });
            result.current.dispatch({
                type: 'SET_START_DATE',
                payload: '2024-01-05',
            });
            result.current.dispatch({
                type: 'SET_END_DATE',
                payload: '2024-01-08',
            });
        });

        act(() => {
            result.current.handleApply();
        });

        expect(mockReplace).toHaveBeenCalledWith(
            '/?minCalories=150&maxCalories=400&minYield=3&recipeCuisine=Italian&startDate=2024-01-05&endDate=2024-01-08'
        );
        expect(result.current.isOpen).toBe(false);
    });

    it('should clear all filters', () => {
        mockSearchParams.set('minCalories', '200');
        mockSearchParams.set('recipeCuisine', 'Mexican');
        mockSearchParams.set('startDate', '2024-01-01');

        const { result } = renderHook(() =>
            useAdvancedFilters(mockSearchParams)
        );

        act(() => {
            result.current.handleClear();
        });

        expect(mockReplace).toHaveBeenCalledWith('/');
    });

    it('does not navigate on apply when on non-filterable page', () => {
        mockCurrentPathname = '/recipes/test-recipe';

        const { result } = renderHook(() =>
            useAdvancedFilters(mockSearchParams)
        );

        act(() => {
            result.current.dispatch({
                type: 'SET_MIN_CALORIES',
                payload: '250',
            });
        });

        act(() => {
            result.current.handleApply();
        });

        expect(mockReplace).not.toHaveBeenCalled();
    });
});
