import { describe, it, expect } from 'vitest';
import {
    validateRecipeCreateData,
    validateRecipeUpdateData,
} from '@/app/utils/recipeValidation';
import {
    RECIPE_TITLE_MAX_LENGTH,
    RECIPE_DESCRIPTION_MAX_LENGTH,
    RECIPE_MAX_CATEGORIES,
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
    RECIPE_INGREDIENT_MAX_LENGTH,
    RECIPE_STEP_MAX_LENGTH,
} from '@/app/utils/constants';

describe('Recipe Validation Utilities', () => {
    const validCreateRecipe = {
        title: 'Valid Recipe Title',
        description: 'A valid recipe description goes here',
        categories: ['Desserts', 'Baking'],
        ingredients: ['1 cup flour', '2 eggs'],
        steps: ['Mix ingredients', 'Bake at 350F'],
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        recipeCuisine: 'French',
        calories: 350,
        recipeYield: 4,
    };

    describe('validateRecipeCreateData (POST)', () => {
        it('should return null for fully valid creation data', () => {
            const result = validateRecipeCreateData(validCreateRecipe);
            expect(result).toBeNull();
        });

        it('should return null for minimal valid creation data', () => {
            const result = validateRecipeCreateData({
                title: 'Minimal Recipe',
                description: 'Just title, description, and categories',
                categories: ['Quick & Easy'],
            });
            expect(result).toBeNull();
        });

        // Required Fields Checks
        it('should return 400 when title is missing', () => {
            const { title: _, ...rest } = validCreateRecipe;
            const result = validateRecipeCreateData(rest);
            expect(result?.status).toBe(400);
        });

        it('should return 400 when title is empty', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                title: '',
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 when description is missing', () => {
            const { description: _, ...rest } = validCreateRecipe;
            const result = validateRecipeCreateData(rest);
            expect(result?.status).toBe(400);
        });

        it('should return 400 when description is empty', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                description: '',
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 when categories is missing', () => {
            const { categories: _, ...rest } = validCreateRecipe;
            const result = validateRecipeCreateData(rest);
            expect(result?.status).toBe(400);
        });

        // Specific POST Constraint Checks
        it('should return 403 when trying to set "Award-winning" category via API', () => {
            const data = {
                ...validCreateRecipe,
                categories: ['Desserts', 'Award-winning'],
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(403);
        });
    });

    describe('validateRecipeUpdateData (PATCH)', () => {
        const mockExistingRecipe = {
            id: 'recipe-123',
            title: 'Existing Recipe Title',
            description: 'Existing description',
            categories: ['Lunch'],
            imageSrc: 'https://example.com/image.jpg',
            extraImages: ['https://example.com/extra1.jpg'],
            ingredients: ['Ingredient 1'],
            steps: ['Step 1'],
            minutes: 15,
            numLikes: 5,
            userId: 'user-123',
            youtubeUrl: null,
            questId: null,
            recipeCuisine: null,
            calories: null,
            recipeYield: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should return null when updating with valid partial data', () => {
            const result = validateRecipeUpdateData(
                {
                    title: 'New Title',
                    recipeYield: 8,
                },
                mockExistingRecipe
            );
            expect(result).toBeNull();
        });

        it('should return null when updating with an empty object (no changes)', () => {
            const result = validateRecipeUpdateData({}, mockExistingRecipe);
            expect(result).toBeNull();
        });

        // Title empty checks
        it('should return 400 if title is defined but empty', () => {
            const result = validateRecipeUpdateData(
                { title: '' },
                mockExistingRecipe
            );
            expect(result?.status).toBe(400);
        });

        // Description empty checks
        it('should return 400 if description is defined but empty', () => {
            const result = validateRecipeUpdateData(
                { description: '' },
                mockExistingRecipe
            );
            expect(result?.status).toBe(400);
        });

        // Award-winning Transitions Checks
        it('should return 403 when trying to set "Award-winning" category via PATCH if not previously set', () => {
            const result = validateRecipeUpdateData(
                { categories: ['Lunch', 'Award-winning'] },
                mockExistingRecipe
            );
            expect(result?.status).toBe(403);
        });

        it('should return 400 when trying to remove "Award-winning" category via PATCH if it was previously set', () => {
            const recipeWithAward = {
                ...mockExistingRecipe,
                categories: ['Award-winning', 'Lunch'],
            };
            const result = validateRecipeUpdateData(
                { categories: ['Lunch'] },
                recipeWithAward
            );
            expect(result?.status).toBe(400);
        });

        it('should return null when keeping "Award-winning" category via PATCH if it was previously set', () => {
            const recipeWithAward = {
                ...mockExistingRecipe,
                categories: ['Award-winning', 'Lunch'],
            };
            const result = validateRecipeUpdateData(
                { categories: ['Award-winning', 'Dinner'] },
                recipeWithAward
            );
            expect(result).toBeNull();
        });
    });

    describe('Common Validation Rules (Shared logic)', () => {
        // We can test this by calling validateRecipeCreateData since it forwards to validateCommonFields.

        // Limits & Max Length Validation
        it('should return 400 when title is too long', () => {
            const data = {
                ...validCreateRecipe,
                title: 'a'.repeat(RECIPE_TITLE_MAX_LENGTH + 1),
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });

        it('should return 400 when description is too long', () => {
            const data = {
                ...validCreateRecipe,
                description: 'a'.repeat(RECIPE_DESCRIPTION_MAX_LENGTH + 1),
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });

        it('should return 400 when too many categories are provided', () => {
            const data = {
                ...validCreateRecipe,
                categories: Array(RECIPE_MAX_CATEGORIES + 1).fill('Category'),
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });

        it('should return 400 when category elements are not non-empty strings', () => {
            const data = {
                ...validCreateRecipe,
                categories: ['Dessert', '   ', 'Baking'],
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });

        it('should return 400 when too many ingredients are provided', () => {
            const data = {
                ...validCreateRecipe,
                ingredients: Array(RECIPE_MAX_INGREDIENTS + 1).fill(
                    'Ingredient'
                ),
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });

        it('should return 400 when ingredient is too long', () => {
            const data = {
                ...validCreateRecipe,
                ingredients: ['a'.repeat(RECIPE_INGREDIENT_MAX_LENGTH + 1)],
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });

        it('should return 400 when too many steps are provided', () => {
            const data = {
                ...validCreateRecipe,
                steps: Array(RECIPE_MAX_STEPS + 1).fill('Step'),
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });

        it('should return 400 when step is too long', () => {
            const data = {
                ...validCreateRecipe,
                steps: ['a'.repeat(RECIPE_STEP_MAX_LENGTH + 1)],
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });

        it('should return 400 for invalid YouTube URL format', () => {
            const data = {
                ...validCreateRecipe,
                youtubeUrl: 'invalid-youtube-link',
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });

        it('should return null for valid YouTube URL format', () => {
            const data = {
                ...validCreateRecipe,
                youtubeUrl: 'https://youtube.com/watch?v=12345678',
            };
            const result = validateRecipeCreateData(data);
            expect(result).toBeNull();
        });

        it('should return 400 for invalid cuisine', () => {
            const data = {
                ...validCreateRecipe,
                recipeCuisine: 'Invalid Cuisine Name',
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });

        it('should return 400 for negative calories', () => {
            const data = {
                ...validCreateRecipe,
                calories: -50,
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });

        it('should return 400 for 0 or negative yield', () => {
            const data = {
                ...validCreateRecipe,
                recipeYield: 0,
            };
            const result = validateRecipeCreateData(data);
            expect(result?.status).toBe(400);
        });
    });

    describe('Runtime Type Resilience (Robustness Checks)', () => {
        it('should return 400 if title is not a string', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                title: 12345 as unknown as string,
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 if description is not a string', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                description: true as unknown as string,
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 if categories is not an array', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                categories: 'not-an-array' as unknown as string[],
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 if ingredients is not an array', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                ingredients: 'not-an-array' as unknown as string[],
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 if ingredients contains non-string elements', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                ingredients: ['flour', 123, 'eggs'] as unknown as string[],
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 if steps is not an array', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                steps: 'not-an-array' as unknown as string[],
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 if steps contains non-string elements', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                steps: ['mix', false, 'bake'] as unknown as string[],
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 if youtubeUrl is not a string', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                youtubeUrl: { url: 'https://youtube.com' } as unknown as string,
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 if recipeCuisine is not a string', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                recipeCuisine: ['French'] as unknown as string,
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 if calories is not a number or string representation of a number', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                calories: { amount: 500 } as unknown as number,
            });
            expect(result?.status).toBe(400);
        });

        it('should return 400 if yield is not a number or string representation of a number', () => {
            const result = validateRecipeCreateData({
                ...validCreateRecipe,
                recipeYield: [4] as unknown as number,
            });
            expect(result?.status).toBe(400);
        });
    });
});
