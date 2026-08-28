import { describe, it, expect, vi } from 'vitest';
import {
    extractIngredientsAndSteps,
    collectDraftFormData,
} from '@/app/utils/draftFormUtils';
import { STEPS } from '@/app/utils/constants';

describe('draftFormUtils helper functions', () => {
    describe('extractIngredientsAndSteps', () => {
        it('extracts ingredients in list mode', () => {
            const values: Record<string, any> = {
                'ingredient-0': 'Tomato',
                'ingredient-1': 'Mozzarella',
                'ingredient-2': '',
            };
            const form = {
                getValues: (key: string) => values[key],
                setValue: vi.fn(),
            };

            const { newIngredients } = extractIngredientsAndSteps(
                form,
                STEPS.INGREDIENTS,
                null,
                3,
                1,
                'list',
                'list'
            );

            expect(newIngredients).toEqual(['Tomato', 'Mozzarella']);
        });

        it('extracts ingredients in plain text mode', () => {
            const values: Record<string, any> = {
                'ingredients-plain-text': '1 cup Flour\n2 eggs\n1/2 cup Milk',
            };
            const form = {
                getValues: (key: string) => values[key],
                setValue: vi.fn(),
            };

            const { newIngredients } = extractIngredientsAndSteps(
                form,
                STEPS.INGREDIENTS,
                null,
                1,
                1,
                'text',
                'list'
            );

            expect(newIngredients).toEqual([
                '1 cup Flour',
                '2 eggs',
                '1/2 cup Milk',
            ]);
        });

        it('extracts steps in list mode', () => {
            const values: Record<string, any> = {
                'step-0': 'Boil water',
                'step-1': 'Add pasta',
                'step-2': '',
            };
            const form = {
                getValues: (key: string) => values[key],
                setValue: vi.fn(),
            };

            const { newSteps } = extractIngredientsAndSteps(
                form,
                STEPS.STEPS,
                null,
                1,
                3,
                'list',
                'list'
            );

            expect(newSteps).toEqual(['Boil water', 'Add pasta']);
        });

        it('extracts steps in text mode', () => {
            const values: Record<string, any> = {
                'steps-plain-text': '1. Heat pan\n2. Sauté garlic',
            };
            const form = {
                getValues: (key: string) => values[key],
                setValue: vi.fn(),
            };

            const { newSteps } = extractIngredientsAndSteps(
                form,
                STEPS.STEPS,
                null,
                1,
                1,
                'list',
                'text'
            );

            expect(newSteps).toEqual(['Heat pan', 'Sauté garlic']);
        });

        it('preserves existing draftData ingredients/steps on unrelated steps', () => {
            const form = {
                getValues: (_key: string) => undefined,
                setValue: vi.fn(),
            };
            const draftData = {
                ingredients: ['Salt', 'Pepper'],
                steps: ['Mix well'],
            };

            const { newIngredients, newSteps } = extractIngredientsAndSteps(
                form,
                STEPS.CATEGORY,
                draftData,
                1,
                1,
                'list',
                'list'
            );

            expect(newIngredients).toEqual(['Salt', 'Pepper']);
            expect(newSteps).toEqual(['Mix well']);
        });
    });

    describe('collectDraftFormData', () => {
        it('constructs a complete draft payload with override step', () => {
            const values: Record<string, any> = {
                title: 'Pasta al Pesto',
                description: 'Delicious pesto pasta',
                categories: ['pasta', 'italian'],
                method: 'cook',
                minutes: 20,
                prepTime: 10,
                cookTime: 10,
                imageSrc: 'https://cloudinary.com/pasta.jpg',
                coCooksIds: ['cook-1'],
                linkedRecipeIds: ['recipe-1'],
                youtubeUrl: 'https://youtube.com/watch?v=abc',
                questId: 'quest-1',
                draftId: 'draft-123',
                inviteToken: 'tok-abc',
            };

            const form = {
                getValues: (key: string) => values[key],
                setValue: vi.fn(),
            };

            const result = collectDraftFormData(
                form,
                STEPS.CATEGORY,
                null,
                1,
                1,
                'list',
                'list',
                STEPS.DESCRIPTION
            );

            expect(result.currentDraftId).toBe('draft-123');
            expect(result.currentInviteToken).toBe('tok-abc');
            expect(result.data.currentStep).toBe(STEPS.DESCRIPTION);
            expect(result.data.title).toBe('Pasta al Pesto');
            expect(result.data.categories).toEqual(['pasta', 'italian']);
            expect(result.data.minutes).toBe(20);
            expect(result.data.coCooksIds).toEqual(['cook-1']);
            expect(result.data.linkedRecipeIds).toEqual(['recipe-1']);
            expect(result.data.ingredients).toBeUndefined();
            expect(result.data.steps).toBeUndefined();
        });

        it('always includes ingredients and steps in payload even on Step 0 or Step 1', () => {
            const values: Record<string, any> = {
                title: 'Cake',
                'ingredient-0': 'Flour',
                'ingredient-1': 'Sugar',
                'step-0': 'Mix',
                'step-1': 'Bake',
            };
            const form = {
                getValues: (key: string) => values[key],
                setValue: vi.fn(),
            };

            const result = collectDraftFormData(
                form,
                STEPS.DESCRIPTION,
                null,
                1,
                1,
                'list',
                'list'
            );

            expect(result.data.ingredients).toEqual(['Flour', 'Sugar']);
            expect(result.data.steps).toEqual(['Mix', 'Bake']);
        });

        it('preserves form ingredients array when individual slots are empty on later steps', () => {
            const values: Record<string, any> = {
                title: 'Cake',
                ingredients: ['Flour', 'Eggs'],
                steps: ['Mix', 'Bake'],
            };
            const form = {
                getValues: (key: string) => values[key],
                setValue: vi.fn(),
            };

            const result = collectDraftFormData(
                form,
                STEPS.METHODS,
                null,
                1,
                1,
                'list',
                'list'
            );

            expect(result.data.ingredients).toEqual(['Flour', 'Eggs']);
            expect(result.data.steps).toEqual(['Mix', 'Bake']);
        });

        it('saves complete whole recipe state when saving draft from Step 3 (Methods)', () => {
            const values: Record<string, any> = {
                title: 'Paella Valenciana',
                description: 'Authentic Spanish rice dish',
                categories: ['rice', 'spanish'],
                method: 'cook',
                'ingredient-0': 'Bomba rice',
                'ingredient-1': 'Chicken',
                'ingredient-2': 'Saffron',
                'ingredient-3': 'Green beans',
                minutes: 45,
                prepTime: 15,
                cookTime: 30,
            };
            const form = {
                getValues: (key: string) => values[key],
                setValue: vi.fn(),
            };

            const result = collectDraftFormData(
                form,
                STEPS.METHODS,
                null,
                1,
                1,
                'list',
                'list'
            );

            expect(result.data.title).toBe('Paella Valenciana');
            expect(result.data.description).toBe('Authentic Spanish rice dish');
            expect(result.data.categories).toEqual(['rice', 'spanish']);
            expect(result.data.method).toBe('cook');
            expect(result.data.ingredients).toEqual([
                'Bomba rice',
                'Chicken',
                'Saffron',
                'Green beans',
            ]);
            expect(result.data.currentStep).toBe(STEPS.METHODS);
        });

        it('saves complete whole recipe state when saving draft from Step 5 (Related Content)', () => {
            const values: Record<string, any> = {
                title: 'Tiramisu',
                description: 'Classic Italian dessert',
                categories: ['desserts', 'italian'],
                method: 'bake',
                'ingredient-0': 'Mascarpone',
                'ingredient-1': 'Espresso',
                'ingredient-2': 'Ladyfingers',
                'step-0': 'Brew espresso and let cool',
                'step-1': 'Whip mascarpone cream',
                'step-2': 'Dip ladyfingers and layer',
                coCooksIds: ['cook-1', 'cook-2'],
                linkedRecipeIds: ['recipe-101'],
                youtubeUrl: 'https://youtube.com/watch?v=123',
                questId: 'quest-99',
            };
            const form = {
                getValues: (key: string) => values[key],
                setValue: vi.fn(),
            };

            const result = collectDraftFormData(
                form,
                STEPS.RELATED_CONTENT,
                null,
                1,
                1,
                'list',
                'list'
            );

            expect(result.data.title).toBe('Tiramisu');
            expect(result.data.categories).toEqual(['desserts', 'italian']);
            expect(result.data.ingredients).toEqual([
                'Mascarpone',
                'Espresso',
                'Ladyfingers',
            ]);
            expect(result.data.steps).toEqual([
                'Brew espresso and let cool',
                'Whip mascarpone cream',
                'Dip ladyfingers and layer',
            ]);
            expect(result.data.coCooksIds).toEqual(['cook-1', 'cook-2']);
            expect(result.data.linkedRecipeIds).toEqual(['recipe-101']);
            expect(result.data.youtubeUrl).toBe(
                'https://youtube.com/watch?v=123'
            );
            expect(result.data.questId).toBe('quest-99');
        });

        it('extracts ingredients across higher indices beyond initial count', () => {
            const values: Record<string, any> = {
                'ingredient-0': 'First',
                'ingredient-5': 'Sixth',
                'ingredient-29': 'Thirtieth',
                'step-0': 'Step One',
                'step-29': 'Step Thirty',
            };
            const form = {
                getValues: (key: string) => values[key],
                setValue: vi.fn(),
            };

            const { newIngredients, newSteps } = extractIngredientsAndSteps(
                form,
                STEPS.CATEGORY,
                null,
                1,
                1,
                'list',
                'list'
            );

            expect(newIngredients).toEqual(['First', 'Sixth', 'Thirtieth']);
            expect(newSteps).toEqual(['Step One', 'Step Thirty']);
        });
    });
});
