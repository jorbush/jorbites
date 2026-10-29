import { describe, it, expect } from 'vitest';
import { validateRemixContent } from '@/app/utils/recipeRemixValidation';

describe('validateRemixContent', () => {
    const originalIngredients = ['200g Flour', '2 Eggs', '100ml Milk'];
    const originalSteps = ['Mix flour and eggs', 'Add milk and whisk', 'Bake'];

    it('rejects when both ingredients and steps are identical', () => {
        const result = validateRemixContent(
            ['200g Flour', '2 Eggs', '100ml Milk'],
            ['Mix flour and eggs', 'Add milk and whisk', 'Bake'],
            originalIngredients,
            originalSteps
        );

        expect(result.hasModifiedIngredients).toBe(false);
        expect(result.hasModifiedSteps).toBe(false);
        expect(result.isValidRemix).toBe(false);
    });

    it('rejects when only ingredients are modified and steps are identical', () => {
        const result = validateRemixContent(
            ['200g Almond Flour', '2 Eggs', '100ml Oat Milk'],
            ['Mix flour and eggs', 'Add milk and whisk', 'Bake'],
            originalIngredients,
            originalSteps
        );

        expect(result.hasModifiedIngredients).toBe(true);
        expect(result.hasModifiedSteps).toBe(false);
        expect(result.isValidRemix).toBe(false);
    });

    it('rejects when only steps are modified and ingredients are identical', () => {
        const result = validateRemixContent(
            ['200g Flour', '2 Eggs', '100ml Milk'],
            ['Mix gently', 'Whisk thoroughly', 'Bake at 180C'],
            originalIngredients,
            originalSteps
        );

        expect(result.hasModifiedIngredients).toBe(false);
        expect(result.hasModifiedSteps).toBe(true);
        expect(result.isValidRemix).toBe(false);
    });

    it('accepts when BOTH ingredients and steps are modified', () => {
        const result = validateRemixContent(
            ['200g Almond Flour', '2 Eggs', '100ml Oat Milk'],
            ['Mix gently', 'Whisk thoroughly', 'Bake at 180C'],
            originalIngredients,
            originalSteps
        );

        expect(result.hasModifiedIngredients).toBe(true);
        expect(result.hasModifiedSteps).toBe(true);
        expect(result.isValidRemix).toBe(true);
    });

    it('treats whitespace variations and casing as identical', () => {
        const result = validateRemixContent(
            ['  200g flour  ', '2 EGGS', '100ml milk '],
            ['  mix flour and eggs', 'add milk and whisk  ', '  bake  '],
            originalIngredients,
            originalSteps
        );

        expect(result.hasModifiedIngredients).toBe(false);
        expect(result.hasModifiedSteps).toBe(false);
        expect(result.isValidRemix).toBe(false);
    });

    it('treats reordered ingredients without content change as identical', () => {
        const result = validateRemixContent(
            ['100ml Milk', '200g Flour', '2 Eggs'],
            ['Mix flour and eggs', 'Add milk and whisk', 'Bake'],
            originalIngredients,
            originalSteps
        );

        expect(result.hasModifiedIngredients).toBe(false);
        expect(result.hasModifiedSteps).toBe(false);
        expect(result.isValidRemix).toBe(false);
    });

    it('handles adding or removing items as a modification', () => {
        const resultAddedIngredient = validateRemixContent(
            ['200g Flour', '2 Eggs', '100ml Milk', '1 tsp Vanilla'],
            ['Mix flour and eggs', 'Add milk and whisk', 'Bake and cool down'],
            originalIngredients,
            originalSteps
        );

        expect(resultAddedIngredient.hasModifiedIngredients).toBe(true);
        expect(resultAddedIngredient.hasModifiedSteps).toBe(true);
        expect(resultAddedIngredient.isValidRemix).toBe(true);
    });

    it('handles null or empty arrays safely', () => {
        const result = validateRemixContent(null, null, null, null);
        expect(result.hasModifiedIngredients).toBe(false);
        expect(result.hasModifiedSteps).toBe(false);
        expect(result.isValidRemix).toBe(false);
    });
});
