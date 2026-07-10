import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAdvancedFilters } from '@/app/hooks/useAdvancedFilters';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
const mockPathname = vi.fn(() => '/');

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
    useSearchParams: () => mockSearchParams,
    usePathname: () => mockPathname(),
}));

describe('useAdvancedFilters', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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

        const { result } = renderHook(() => useAdvancedFilters());

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
        const { result } = renderHook(() => useAdvancedFilters());

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
        const { result } = renderHook(() => useAdvancedFilters());

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

        const { result } = renderHook(() => useAdvancedFilters());

        act(() => {
            result.current.handleClear();
        });

        expect(mockReplace).toHaveBeenCalledWith('/');
    });
});
