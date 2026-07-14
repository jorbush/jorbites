import { describe, it, expect } from 'vitest';
import { validateRecipeData } from '@/app/utils/recipeValidation';
import {
    RECIPE_TITLE_MAX_LENGTH,
    RECIPE_DESCRIPTION_MAX_LENGTH,
    RECIPE_MAX_CATEGORIES,
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';

describe('validateRecipeData', () => {
    const validBaseRecipe = {
        title: 'Valid Recipe',
        description: 'A valid description',
        categories: ['Desserts'],
    };

    it('should return null for valid recipe data', () => {
        const result = validateRecipeData(validBaseRecipe);
        expect(result).toBeNull();
    });

    it('should return 400 when categories is missing for POST', () => {
        const { categories: _categories, ...rest } = validBaseRecipe;
        const result = validateRecipeData(rest);
        expect(result?.status).toBe(400);
    });

    it('should return null when categories is missing for PATCH (existingRecipe provided)', () => {
        const { categories: _categories, ...rest } = validBaseRecipe;
        const result = validateRecipeData(rest, {
            categories: ['Lunch'],
        } as any);
        expect(result).toBeNull();
    });

    it('should return 400 when title is too long', () => {
        const data = {
            ...validBaseRecipe,
            title: 'a'.repeat(RECIPE_TITLE_MAX_LENGTH + 1),
        };
        const result = validateRecipeData(data);
        expect(result?.status).toBe(400);
    });

    it('should return 400 when description is too long', () => {
        const data = {
            ...validBaseRecipe,
            description: 'a'.repeat(RECIPE_DESCRIPTION_MAX_LENGTH + 1),
        };
        const result = validateRecipeData(data);
        expect(result?.status).toBe(400);
    });

    it('should return 400 when too many categories are provided', () => {
        const data = {
            ...validBaseRecipe,
            categories: Array(RECIPE_MAX_CATEGORIES + 1).fill('Category'),
        };
        const result = validateRecipeData(data);
        expect(result?.status).toBe(400);
    });

    it('should return 403 when trying to set "Award-winning" category via API (POST)', () => {
        const data = {
            ...validBaseRecipe,
            categories: ['Award-winning'],
        };
        const result = validateRecipeData(data);
        expect(result?.status).toBe(403);
    });

    it('should return 403 when trying to set "Award-winning" category via API (PATCH, not previously set)', () => {
        const data = {
            ...validBaseRecipe,
            categories: ['Award-winning'],
        };
        const existing = { categories: ['Lunch'] };
        const result = validateRecipeData(data, existing as any);
        expect(result?.status).toBe(403);
    });

    it('should return 400 when trying to remove "Award-winning" category (PATCH)', () => {
        const data = {
            ...validBaseRecipe,
            categories: ['Desserts'],
        };
        const existing = { categories: ['Award-winning'] };
        const result = validateRecipeData(data, existing as any);
        expect(result?.status).toBe(400);
    });

    it('should return 400 when too many ingredients are provided', () => {
        const data = {
            ...validBaseRecipe,
            ingredients: Array(RECIPE_MAX_INGREDIENTS + 1).fill('Ingredient'),
        };
        const result = validateRecipeData(data);
        expect(result?.status).toBe(400);
    });

    it('should return 400 when too many steps are provided', () => {
        const data = {
            ...validBaseRecipe,
            steps: Array(RECIPE_MAX_STEPS + 1).fill('Step'),
        };
        const result = validateRecipeData(data);
        expect(result?.status).toBe(400);
    });

    it('should return 400 for invalid YouTube URL', () => {
        const data = {
            ...validBaseRecipe,
            youtubeUrl: 'invalid-url',
        };
        const result = validateRecipeData(data);
        expect(result?.status).toBe(400);
    });

    it('should return 400 for invalid cuisine', () => {
        const data = {
            ...validBaseRecipe,
            recipeCuisine: 'Invalid Cuisine',
        };
        const result = validateRecipeData(data);
        expect(result?.status).toBe(400);
    });

    it('should return 400 for invalid calories', () => {
        const data = {
            ...validBaseRecipe,
            calories: -10,
        };
        const result = validateRecipeData(data);
        expect(result?.status).toBe(400);
    });

    it('should return 400 for invalid yield', () => {
        const data = {
            ...validBaseRecipe,
            recipeYield: 0,
        };
        const result = validateRecipeData(data);
        expect(result?.status).toBe(400);
    });
});
