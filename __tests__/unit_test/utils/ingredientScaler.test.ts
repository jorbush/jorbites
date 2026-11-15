import { describe, it, expect } from 'vitest';
import {
    scaleIngredient,
    scaleIngredients,
} from '@/app/utils/ingredientScaler';

describe('ingredientScaler', () => {
    describe('scaleIngredient', () => {
        it('returns original string when baseServings or targetServings are invalid or equal', () => {
            expect(scaleIngredient('2 cups flour', 4, 4)).toBe('2 cups flour');
            expect(scaleIngredient('2 cups flour', null, 4)).toBe(
                '2 cups flour'
            );
            expect(scaleIngredient('2 cups flour', 4, null)).toBe(
                '2 cups flour'
            );
            expect(scaleIngredient('2 cups flour', 0, 4)).toBe('2 cups flour');
            expect(scaleIngredient('2 cups flour', 4, 0)).toBe('2 cups flour');
            expect(scaleIngredient('', 2, 4)).toBe('');
        });

        it('scales whole numbers and attached units', () => {
            expect(scaleIngredient('2 eggs', 2, 4)).toBe('4 eggs');
            expect(scaleIngredient('200g flour', 4, 6)).toBe('300g flour');
            expect(scaleIngredient('500 ml milk', 4, 2)).toBe('250 ml milk');
        });

        it('scales decimals and preserves comma separator when used', () => {
            expect(scaleIngredient('1.5 cups milk', 2, 4)).toBe('3 cups milk');
            expect(scaleIngredient('1.5 cups milk', 2, 3)).toBe(
                '2.25 cups milk'
            );
            expect(scaleIngredient('1,5 l de leche', 2, 3)).toBe(
                '2,25 l de leche'
            );
        });

        it('scales ASCII fractions and mixed numbers', () => {
            expect(scaleIngredient('1/2 tsp salt', 2, 4)).toBe('1 tsp salt');
            expect(scaleIngredient('1/2 tsp salt', 2, 1)).toBe('0.25 tsp salt');
            expect(scaleIngredient('1 1/2 cups flour', 2, 4)).toBe(
                '3 cups flour'
            );
        });

        it('scales Unicode vulgar fractions and mixed Unicode fractions', () => {
            expect(scaleIngredient('½ cup sugar', 2, 4)).toBe('1 cup sugar');
            expect(scaleIngredient('1½ tbsp olive oil', 2, 4)).toBe(
                '3 tbsp olive oil'
            );
            expect(scaleIngredient('1 ¼ cups water', 2, 4)).toBe(
                '2.5 cups water'
            );
        });

        it('scales numeric ranges', () => {
            expect(scaleIngredient('2-3 garlic cloves', 2, 4)).toBe(
                '4-6 garlic cloves'
            );
        });

        it('does not scale percentages, leading-zero codes, mentions, or URLs', () => {
            expect(scaleIngredient('100g 70% dark chocolate', 2, 4)).toBe(
                '200g 70% dark chocolate'
            );
            expect(scaleIngredient('500g tipo 00 flour', 2, 4)).toBe(
                '1000g tipo 00 flour'
            );
            expect(
                scaleIngredient('2 tbsp sauce by @chef2[65f123abc]', 2, 4)
            ).toBe('4 tbsp sauce by @chef2[65f123abc]');
            expect(
                scaleIngredient('1 bottle https://example.com/item/123', 2, 4)
            ).toBe('2 bottle https://example.com/item/123');
        });
    });

    describe('scaleIngredients', () => {
        it('scales all items in an ingredients list', () => {
            const items = ['2 cups flour', '1/2 tsp salt', 'Pinch of pepper'];
            expect(scaleIngredients(items, 2, 4)).toEqual([
                '4 cups flour',
                '1 tsp salt',
                'Pinch of pepper',
            ]);
        });
    });
});
