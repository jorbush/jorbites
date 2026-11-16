import { describe, it, expect } from 'vitest';
import { filterBySearchQuery } from '@/app/utils/searchUtils';

interface TestItem {
    id: string;
    title: string | null;
    description?: string;
}

const items: TestItem[] = [
    { id: '1', title: 'Pasta Carbonara', description: 'Creamy Italian dish' },
    { id: '2', title: 'Tacos al Pastor', description: 'Spicy pork tacos' },
    { id: '3', title: null, description: 'Mystery soup' },
];

const getFields = (item: TestItem) => [item.title, item.description];

describe('filterBySearchQuery', () => {
    it('returns all items when query is empty or whitespace', () => {
        expect(filterBySearchQuery(items, '', getFields)).toEqual(items);
        expect(filterBySearchQuery(items, '   ', getFields)).toEqual(items);
    });

    it('filters case-insensitively across multiple fields with trimmed query', () => {
        expect(filterBySearchQuery(items, '  PASTA ', getFields)).toEqual([
            items[0],
        ]);
        expect(filterBySearchQuery(items, 'spicy', getFields)).toEqual([
            items[1],
        ]);
    });

    it('handles null and undefined fields safely', () => {
        expect(filterBySearchQuery(items, 'mystery', getFields)).toEqual([
            items[2],
        ]);
        expect(filterBySearchQuery(items, 'nonexistent', getFields)).toEqual(
            []
        );
    });
});
