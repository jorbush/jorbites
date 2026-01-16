import { describe, it, expect } from 'vitest';
import {
    OrderByType,
    getPrismaOrderByClause,
    getDateRangeFilter,
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

    it('should always include id as secondary sort for consistent pagination', () => {
        // Test all order types to ensure they all have id as secondary sort
        const orderTypes = [
            OrderByType.NEWEST,
            OrderByType.OLDEST,
            OrderByType.TITLE_ASC,
            OrderByType.TITLE_DESC,
            OrderByType.MOST_LIKED,
        ];

        orderTypes.forEach((orderType) => {
            const result = getPrismaOrderByClause(orderType);
            expect(result).toHaveLength(2);
            expect(result[1]).toEqual({ id: 'asc' });
        });
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
