import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    useAdvancedFilters,
    extractFilterValues,
    hasAnyFilterSet,
    isFilterablePath,
    getNextCuisine,
    getNextDifficulty,
    buildFilterUrl,
    EMPTY_ADVANCED_FILTERS,
} from '@/app/hooks/useAdvancedFilters';
import useAdvancedFiltersModal from '@/app/hooks/useAdvancedFiltersModal';
import {
    advancedFiltersReducer,
    AdvancedFiltersState,
} from '@/app/components/navbar/advancedFiltersReducer';

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

describe('advancedFiltersReducer', () => {
    const initialState: AdvancedFiltersState = {
        tempMinCalories: '',
        tempMaxCalories: '',
        tempMinYield: '',
        tempMaxYield: '',
        tempCuisine: '',
        tempStartDate: '',
        tempEndDate: '',
        tempDifficulty: '',
        tempDietaryTags: [],
        tempExcludeAllergens: [],
        tempMinProtein: '',
        tempMaxCarbohydrates: '',
        tempMaxFat: '',
    };

    it('toggles dietary tags on and off', () => {
        let state = advancedFiltersReducer(initialState, {
            type: 'TOGGLE_DIETARY_TAG',
            payload: 'vegan',
        });
        expect(state.tempDietaryTags).toEqual(['vegan']);

        state = advancedFiltersReducer(state, {
            type: 'TOGGLE_DIETARY_TAG',
            payload: 'one-pot',
        });
        expect(state.tempDietaryTags).toEqual(['vegan', 'one-pot']);

        state = advancedFiltersReducer(state, {
            type: 'TOGGLE_DIETARY_TAG',
            payload: 'vegan',
        });
        expect(state.tempDietaryTags).toEqual(['one-pot']);
    });

    it('toggles excluded allergens on and off', () => {
        let state = advancedFiltersReducer(initialState, {
            type: 'TOGGLE_EXCLUDE_ALLERGEN',
            payload: 'gluten',
        });
        expect(state.tempExcludeAllergens).toEqual(['gluten']);

        state = advancedFiltersReducer(state, {
            type: 'TOGGLE_EXCLUDE_ALLERGEN',
            payload: 'milk',
        });
        expect(state.tempExcludeAllergens).toEqual(['gluten', 'milk']);

        state = advancedFiltersReducer(state, {
            type: 'TOGGLE_EXCLUDE_ALLERGEN',
            payload: 'gluten',
        });
        expect(state.tempExcludeAllergens).toEqual(['milk']);
    });

    it('updates difficulty and macros and resets all on CLEAR_FILTERS', () => {
        let state = advancedFiltersReducer(initialState, {
            type: 'SET_DIFFICULTY',
            payload: 'Medium',
        });
        state = advancedFiltersReducer(state, {
            type: 'SET_MIN_PROTEIN',
            payload: '30',
        });
        state = advancedFiltersReducer(state, {
            type: 'SET_MAX_CARBOHYDRATES',
            payload: '45',
        });
        state = advancedFiltersReducer(state, {
            type: 'SET_MAX_FAT',
            payload: '20',
        });
        state = advancedFiltersReducer(state, {
            type: 'TOGGLE_DIETARY_TAG',
            payload: 'spicy',
        });
        state = advancedFiltersReducer(state, {
            type: 'TOGGLE_EXCLUDE_ALLERGEN',
            payload: 'peanuts',
        });

        expect(state.tempDifficulty).toBe('Medium');
        expect(state.tempMinProtein).toBe('30');
        expect(state.tempMaxCarbohydrates).toBe('45');
        expect(state.tempMaxFat).toBe('20');

        const cleared = advancedFiltersReducer(state, {
            type: 'CLEAR_FILTERS',
        });
        expect(cleared).toEqual(initialState);
    });
});

describe('useAdvancedFilters helper functions', () => {
    describe('extractFilterValues', () => {
        it('returns empty strings and arrays when search params are empty or null', () => {
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
                difficulty: 'Easy',
                dietaryTags: 'vegan,one-pot',
                excludeAllergens: 'gluten,milk',
                minProtein: '25',
                maxCarbohydrates: '40',
                maxFat: '15',
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
                difficulty: 'Easy',
                dietaryTags: ['vegan', 'one-pot'],
                excludeAllergens: ['gluten', 'milk'],
                minProtein: '25',
                maxCarbohydrates: '40',
                maxFat: '15',
            });
        });
    });

    describe('hasAnyFilterSet', () => {
        it('returns false when no filter values are set', () => {
            expect(hasAnyFilterSet(EMPTY_ADVANCED_FILTERS)).toBe(false);
            expect(hasAnyFilterSet({})).toBe(false);
            expect(
                hasAnyFilterSet({ dietaryTags: [], excludeAllergens: [] })
            ).toBe(false);
        });

        it('returns true when any filter value is set', () => {
            expect(hasAnyFilterSet({ minCalories: '200' })).toBe(true);
            expect(hasAnyFilterSet({ recipeCuisine: 'Italian' })).toBe(true);
            expect(hasAnyFilterSet({ difficulty: 'Hard' })).toBe(true);
            expect(hasAnyFilterSet({ dietaryTags: ['vegan'] })).toBe(true);
            expect(hasAnyFilterSet({ excludeAllergens: ['gluten'] })).toBe(
                true
            );
            expect(hasAnyFilterSet({ minProtein: '20' })).toBe(true);
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

    describe('getNextDifficulty', () => {
        it('toggles off difficulty if clicked again (case-insensitive)', () => {
            expect(getNextDifficulty('Easy', 'Easy')).toBe('');
            expect(getNextDifficulty('easy', 'EASY')).toBe('');
        });

        it('returns new difficulty when different', () => {
            expect(getNextDifficulty('Easy', 'Hard')).toBe('Hard');
            expect(getNextDifficulty('', 'Medium')).toBe('Medium');
        });
    });

    describe('buildFilterUrl', () => {
        it('builds URL for home page with active filters', () => {
            const params = new URLSearchParams('page=2&other=keep');
            const url = buildFilterUrl('/', params as any, {
                ...EMPTY_ADVANCED_FILTERS,
                minCalories: '250',
                recipeCuisine: 'Mexican',
                difficulty: 'Easy',
                dietaryTags: ['vegan', 'spicy'],
                excludeAllergens: ['gluten', 'milk'],
                minProtein: '30',
            });
            expect(url).toBe(
                '/?other=keep&minCalories=250&recipeCuisine=Mexican&difficulty=Easy&dietaryTags=vegan%2Cspicy&excludeAllergens=gluten%2Cmilk&minProtein=30'
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
                difficulty: 'Hard',
            });
            expect(url).toBe('/favorites?minYield=4&difficulty=Hard');
        });

        it('clears parameters that have empty values', () => {
            const params = new URLSearchParams(
                'minCalories=100&recipeCuisine=Italian&difficulty=Easy&dietaryTags=vegan&excludeAllergens=gluten&minProtein=20'
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

describe('useAdvancedFiltersModal', () => {
    beforeEach(() => {
        useAdvancedFiltersModal.getState().onClose();
    });

    it('opens and closes the modal store', () => {
        expect(useAdvancedFiltersModal.getState().isOpen).toBe(false);

        useAdvancedFiltersModal.getState().onOpen();
        expect(useAdvancedFiltersModal.getState().isOpen).toBe(true);

        useAdvancedFiltersModal.getState().onClose();
        expect(useAdvancedFiltersModal.getState().isOpen).toBe(false);
    });
});

describe('useAdvancedFilters', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentPathname = '/';
        useAdvancedFiltersModal.getState().onClose();
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
        mockSearchParams.set('difficulty', 'Medium');
        mockSearchParams.set('dietaryTags', 'vegan,one-pot');
        mockSearchParams.set('excludeAllergens', 'gluten,nuts');
        mockSearchParams.set('minProtein', '25');
        mockSearchParams.set('maxCarbohydrates', '40');
        mockSearchParams.set('maxFat', '18');

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
        expect(result.current.tempDifficulty).toBe('Medium');
        expect(result.current.tempDietaryTags).toEqual(['vegan', 'one-pot']);
        expect(result.current.tempExcludeAllergens).toEqual(['gluten', 'nuts']);
        expect(result.current.tempMinProtein).toBe('25');
        expect(result.current.tempMaxCarbohydrates).toBe('40');
        expect(result.current.tempMaxFat).toBe('18');
        expect(result.current.isOpen).toBe(false);
        expect(result.current.hasActiveFilters).toBe(true);
        expect(result.current.isAnyTempFilterSet).toBe(true);
    });

    it('should allow toggling cuisine, difficulty, dietary tags, and allergens', () => {
        const { result } = renderHook(() =>
            useAdvancedFilters(mockSearchParams)
        );

        act(() => {
            result.current.handleCuisinePillClick('Italian');
            result.current.handleDifficultyPillClick('Easy');
            result.current.handleDietaryTagToggle('vegan');
            result.current.handleDietaryTagToggle('spicy');
            result.current.handleAllergenToggle('gluten');
        });
        expect(result.current.tempCuisine).toBe('Italian');
        expect(result.current.tempDifficulty).toBe('Easy');
        expect(result.current.tempDietaryTags).toEqual(['vegan', 'spicy']);
        expect(result.current.tempExcludeAllergens).toEqual(['gluten']);

        // Click again to toggle off
        act(() => {
            result.current.handleCuisinePillClick('Italian');
            result.current.handleDifficultyPillClick('Easy');
            result.current.handleDietaryTagToggle('vegan');
            result.current.handleAllergenToggle('gluten');
        });
        expect(result.current.tempCuisine).toBe('');
        expect(result.current.tempDifficulty).toBe('');
        expect(result.current.tempDietaryTags).toEqual(['spicy']);
        expect(result.current.tempExcludeAllergens).toEqual([]);
    });

    it('should apply filters to URL search params and close modal', () => {
        useAdvancedFiltersModal.getState().onOpen();
        const { result } = renderHook(() =>
            useAdvancedFilters(mockSearchParams)
        );

        expect(result.current.isOpen).toBe(true);

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
            result.current.dispatch({
                type: 'SET_DIFFICULTY',
                payload: 'Hard',
            });
            result.current.dispatch({
                type: 'TOGGLE_DIETARY_TAG',
                payload: 'mediterranean',
            });
            result.current.dispatch({
                type: 'TOGGLE_EXCLUDE_ALLERGEN',
                payload: 'milk',
            });
            result.current.dispatch({
                type: 'SET_MIN_PROTEIN',
                payload: '35',
            });
        });

        act(() => {
            result.current.handleApply();
        });

        expect(mockReplace).toHaveBeenCalledWith(
            '/?minCalories=150&maxCalories=400&minYield=3&recipeCuisine=Italian&startDate=2024-01-05&endDate=2024-01-08&difficulty=Hard&dietaryTags=mediterranean&excludeAllergens=milk&minProtein=35'
        );
        expect(result.current.isOpen).toBe(false);
    });

    it('should clear active URL filters and close modal', () => {
        mockSearchParams.set('minCalories', '200');
        mockSearchParams.set('recipeCuisine', 'Mexican');
        mockSearchParams.set('startDate', '2024-01-01');
        mockSearchParams.set('difficulty', 'Easy');
        mockSearchParams.set('dietaryTags', 'vegan');
        mockSearchParams.set('excludeAllergens', 'gluten');
        mockSearchParams.set('minProtein', '20');
        useAdvancedFiltersModal.getState().onOpen();

        const { result } = renderHook(() =>
            useAdvancedFilters(mockSearchParams)
        );

        act(() => {
            result.current.handleClear();
        });

        expect(mockReplace).toHaveBeenCalledWith('/');
        expect(result.current.isOpen).toBe(false);
    });

    it('should reset unsaved temporary filters without closing when no URL filters are active', () => {
        useAdvancedFiltersModal.getState().onOpen();

        const { result } = renderHook(() =>
            useAdvancedFilters(mockSearchParams)
        );

        act(() => {
            result.current.handleDifficultyPillClick('Easy');
            result.current.handleDietaryTagToggle('vegan');
        });

        expect(result.current.isAnyTempFilterSet).toBe(true);

        act(() => {
            result.current.handleClear();
        });

        expect(result.current.isAnyTempFilterSet).toBe(false);
        expect(mockReplace).not.toHaveBeenCalled();
        expect(result.current.isOpen).toBe(true);
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
