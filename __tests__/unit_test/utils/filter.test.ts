import { describe, it, expect } from 'vitest';
import {
    OrderByType,
    applyOrderByWhereFilters,
    buildRecipeWhereClause,
    getPrismaOrderByClause,
    getDateRangeFilter,
    hasActiveRecipeFilterParams,
    parseListParam,
} from '@/app/utils/filter';

describe('getPrismaOrderByClause', () => {
    it('should return correct order for NEWEST', () => {
        const result = getPrismaOrderByClause(OrderByType.NEWEST);
        expect(result).toEqual([{ createdAt: 'desc' }, { id: 'asc' }]);
    });

    it('should return correct order for OLDEST', () => {
        const result = getPrismaOrderByClause(OrderByType.OLDEST);
        expect(result).toEqual([{ createdAt: 'asc' }, { id: 'asc' }]);
    });

    it('should return correct order for TITLE_ASC', () => {
        const result = getPrismaOrderByClause(OrderByType.TITLE_ASC);
        expect(result).toEqual([{ title: 'asc' }, { id: 'asc' }]);
    });

    it('should return correct order for TITLE_DESC', () => {
        const result = getPrismaOrderByClause(OrderByType.TITLE_DESC);
        expect(result).toEqual([{ title: 'desc' }, { id: 'asc' }]);
    });

    it('should return correct order for MOST_LIKED', () => {
        const result = getPrismaOrderByClause(OrderByType.MOST_LIKED);
        expect(result).toEqual([{ numLikes: 'desc' }, { id: 'asc' }]);
    });

    it('should return correct order for BEST_RATED', () => {
        const result = getPrismaOrderByClause(OrderByType.BEST_RATED);
        expect(result).toEqual([
            { averageRating: 'desc' },
            { ratingCount: 'desc' },
            { id: 'asc' },
        ]);
    });

    it('should return correct order for HIGHEST_PROTEIN', () => {
        const result = getPrismaOrderByClause(OrderByType.HIGHEST_PROTEIN);
        expect(result).toEqual([{ protein: 'desc' }, { id: 'asc' }]);
    });

    it('should return correct order for LOWEST_CALORIES', () => {
        const result = getPrismaOrderByClause(OrderByType.LOWEST_CALORIES);
        expect(result).toEqual([{ calories: 'asc' }, { id: 'asc' }]);
    });

    it('should always include id as final sort for consistent pagination', () => {
        const orderTypes = [
            OrderByType.NEWEST,
            OrderByType.OLDEST,
            OrderByType.TITLE_ASC,
            OrderByType.TITLE_DESC,
            OrderByType.MOST_LIKED,
            OrderByType.BEST_RATED,
            OrderByType.HIGHEST_PROTEIN,
            OrderByType.LOWEST_CALORIES,
        ];

        orderTypes.forEach((orderType) => {
            const result = getPrismaOrderByClause(orderType);
            expect(result.length).toBeGreaterThanOrEqual(2);
            expect(result[result.length - 1]).toEqual({ id: 'asc' });
        });
    });
});

describe('applyOrderByWhereFilters', () => {
    it('adds non-null calories constraint for LOWEST_CALORIES when calories filter is absent', () => {
        expect(
            applyOrderByWhereFilters({}, OrderByType.LOWEST_CALORIES)
        ).toEqual({
            calories: { not: null, isSet: true },
        });
    });

    it('preserves existing calories filter for LOWEST_CALORIES', () => {
        const where = { calories: { lte: 500 } };
        expect(
            applyOrderByWhereFilters(where, OrderByType.LOWEST_CALORIES)
        ).toEqual(where);
    });

    it('leaves where unchanged for other orderBy options', () => {
        const where = { title: { contains: 'pasta' } };
        expect(
            applyOrderByWhereFilters(where, OrderByType.HIGHEST_PROTEIN)
        ).toEqual(where);
    });
});

describe('getDateRangeFilter', () => {
    it('should return empty filter when no dates provided', () => {
        const result = getDateRangeFilter();
        expect(result).toEqual({});
    });

    it('should return filter with only start date', () => {
        const startDate = '2024-01-01';
        const result = getDateRangeFilter(startDate);

        expect(result).toHaveProperty('createdAt');
        expect(result.createdAt).toHaveProperty('gte');
        expect(result.createdAt?.gte).toEqual(new Date(startDate));
        expect(result.createdAt).not.toHaveProperty('lte');
    });

    it('should return filter with only end date', () => {
        const endDate = '2024-12-31';
        const result = getDateRangeFilter(undefined, endDate);

        expect(result).toHaveProperty('createdAt');
        expect(result.createdAt).toHaveProperty('lte');
        expect(result.createdAt).not.toHaveProperty('gte');

        // Verify end date is set to end of day
        const expectedEndDate = new Date(endDate);
        expectedEndDate.setHours(23, 59, 59, 999);
        expect(result.createdAt?.lte).toEqual(expectedEndDate);
    });

    it('should return filter with both start and end dates', () => {
        const startDate = '2024-01-01';
        const endDate = '2024-12-31';
        const result = getDateRangeFilter(startDate, endDate);

        expect(result).toHaveProperty('createdAt');
        expect(result.createdAt).toHaveProperty('gte');
        expect(result.createdAt).toHaveProperty('lte');

        expect(result.createdAt?.gte).toEqual(new Date(startDate));

        // Verify end date is set to end of day
        const expectedEndDate = new Date(endDate);
        expectedEndDate.setHours(23, 59, 59, 999);
        expect(result.createdAt?.lte).toEqual(expectedEndDate);
    });

    it('should set end date to end of day (23:59:59.999)', () => {
        const endDate = '2024-06-15';
        const result = getDateRangeFilter(undefined, endDate);

        const endDateTime = result.createdAt?.lte;
        expect(endDateTime?.getHours()).toBe(23);
        expect(endDateTime?.getMinutes()).toBe(59);
        expect(endDateTime?.getSeconds()).toBe(59);
        expect(endDateTime?.getMilliseconds()).toBe(999);
    });
});

describe('parseListParam', () => {
    it('returns empty array for empty or undefined input', () => {
        expect(parseListParam(undefined)).toEqual([]);
        expect(parseListParam('')).toEqual([]);
        expect(parseListParam([])).toEqual([]);
    });

    it('splits, normalizes, trims, and deduplicates comma-separated values', () => {
        expect(parseListParam('Vegan, one-pot , VEGAN,  spicy ')).toEqual([
            'vegan',
            'one-pot',
            'spicy',
        ]);
    });

    it('handles array inputs including comma-separated entries', () => {
        expect(parseListParam(['gluten, milk', 'EGGS', 'milk'])).toEqual([
            'gluten',
            'milk',
            'eggs',
        ]);
    });
});

describe('buildRecipeWhereClause', () => {
    it('filters difficulty by exact match (case-insensitive against allowed values)', () => {
        expect(buildRecipeWhereClause({ difficulty: 'easy' })).toEqual({
            difficulty: { equals: 'Easy', mode: 'insensitive' },
        });
        expect(buildRecipeWhereClause({ difficulty: 'Hard' })).toEqual({
            difficulty: { equals: 'Hard', mode: 'insensitive' },
        });
    });

    it('uses sentinel value when difficulty is invalid', () => {
        expect(buildRecipeWhereClause({ difficulty: 'impossible' })).toEqual({
            difficulty: { equals: 'NON_EXISTENT_DIFFICULTY_VAL' },
        });
    });

    it('filters dietaryTags with hasEvery for multiple tags', () => {
        expect(
            buildRecipeWhereClause({ dietaryTags: 'vegan,one-pot,spicy' })
        ).toEqual({
            dietaryTags: { hasEvery: ['vegan', 'one-pot', 'spicy'] },
        });
    });

    it('uses sentinel tag if any requested dietary tag is invalid', () => {
        expect(
            buildRecipeWhereClause({ dietaryTags: 'vegan,unknown-tag' })
        ).toEqual({
            dietaryTags: { hasEvery: ['NON_EXISTENT_DIETARY_TAG'] },
        });
    });

    it('excludes allergens using NOT allergens hasSome', () => {
        expect(
            buildRecipeWhereClause({ excludeAllergens: 'gluten,milk,peanuts' })
        ).toEqual({
            NOT: {
                allergens: {
                    hasSome: ['gluten', 'milk', 'peanuts'],
                },
            },
        });
    });

    it('ignores unknown allergen values when building exclusion clause', () => {
        expect(buildRecipeWhereClause({ excludeAllergens: 'unknown' })).toEqual(
            {}
        );
        expect(
            buildRecipeWhereClause({ excludeAllergens: 'gluten,unknown' })
        ).toEqual({
            NOT: {
                allergens: {
                    hasSome: ['gluten'],
                },
            },
        });
    });

    it('filters numeric macro ranges and ignores invalid or negative values', () => {
        expect(
            buildRecipeWhereClause({
                minProtein: '25',
                maxProtein: '60',
                maxCarbohydrates: '40',
                maxFat: '15',
                minFat: '-5',
                minCarbohydrates: 'abc',
            })
        ).toEqual({
            protein: { gte: 25, lte: 60 },
            carbohydrates: { lte: 40 },
            fat: { lte: 15 },
        });
    });

    it('merges baseWhere with all combined filters', () => {
        const result = buildRecipeWhereClause(
            {
                difficulty: 'Medium',
                dietaryTags: ['mediterranean', 'meal-prep'],
                excludeAllergens: ['nuts', 'soy'],
                minProtein: 30,
                maxCarbohydrates: 50,
                orderBy: OrderByType.LOWEST_CALORIES,
            },
            { id: { in: ['r1', 'r2'] } }
        );

        expect(result).toEqual({
            id: { in: ['r1', 'r2'] },
            difficulty: { equals: 'Medium', mode: 'insensitive' },
            dietaryTags: { hasEvery: ['mediterranean', 'meal-prep'] },
            NOT: { allergens: { hasSome: ['nuts', 'soy'] } },
            protein: { gte: 30 },
            carbohydrates: { lte: 50 },
            calories: { not: null, isSet: true },
        });
    });
});

describe('hasActiveRecipeFilterParams', () => {
    it('returns false when empty or only orderBy is provided', () => {
        expect(hasActiveRecipeFilterParams({})).toBe(false);
        expect(
            hasActiveRecipeFilterParams({
                orderBy: OrderByType.HIGHEST_PROTEIN,
            })
        ).toBe(false);
    });

    it('returns true when any new or existing filter param is set', () => {
        expect(hasActiveRecipeFilterParams({ difficulty: 'Easy' })).toBe(true);
        expect(hasActiveRecipeFilterParams({ dietaryTags: 'vegan' })).toBe(
            true
        );
        expect(
            hasActiveRecipeFilterParams({ excludeAllergens: 'gluten' })
        ).toBe(true);
        expect(hasActiveRecipeFilterParams({ minProtein: '20' })).toBe(true);
        expect(hasActiveRecipeFilterParams({ maxCarbohydrates: '40' })).toBe(
            true
        );
        expect(hasActiveRecipeFilterParams({ maxFat: '15' })).toBe(true);
    });
});
