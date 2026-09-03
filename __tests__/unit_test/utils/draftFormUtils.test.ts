import { describe, it, expect, vi } from 'vitest';
import {
    extractIngredientsAndSteps,
    collectDraftFormData,
} from '@/app/utils/draftFormUtils';
import { STEPS } from '@/app/utils/constants';

describe('draftFormUtils helper functions', () => {
    describe('extractIngredientsAndSteps', () => {
        it('extracts ingredients in list mode', () => {
            const values: Record<string, unknown> = {
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
            const values: Record<string, unknown> = {
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
            const values: Record<string, unknown> = {
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
            const values: Record<string, unknown> = {
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
            const values: Record<string, unknown> = {
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
                STEPS.DESCRIPTION,
                true
            );

            expect(result.currentDraftId).toBe('draft-123');
            expect(result.currentInviteToken).toBe('tok-abc');
            expect(result.data.currentStep).toBe(STEPS.DESCRIPTION);
            expect(result.data.title).toBe('Pasta al Pesto');
            expect(result.data.categories).toEqual(['pasta', 'italian']);
            expect(result.data.minutes).toBe(20);
            expect(result.data.coCooksIds).toEqual(['cook-1']);
            expect(result.data.linkedRecipeIds).toEqual(['recipe-1']);
        });

        it('always includes ingredients and steps in payload even on Step 0 or Step 1', () => {
            const values: Record<string, unknown> = {
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
            const values: Record<string, unknown> = {
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
            const values: Record<string, unknown> = {
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
            const values: Record<string, unknown> = {
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
            const values: Record<string, unknown> = {
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

        it('returns empty array on active ingredients/steps step when inputs are cleared, without restoring draftData', () => {
            const form = {
                getValues: (key: string) => (key === 'ingredients' ? [] : ''),
                setValue: vi.fn(),
            };
            const remoteDraft = {
                ingredients: ['Old Ingredient 1', 'Old Ingredient 2'],
                steps: ['Old Step 1', 'Old Step 2'],
            };

            const resultIngredients = extractIngredientsAndSteps(
                form,
                STEPS.INGREDIENTS,
                remoteDraft,
                0,
                0,
                'list',
                'list'
            );
            expect(resultIngredients.newIngredients).toEqual([]);

            const resultSteps = extractIngredientsAndSteps(
                form,
                STEPS.STEPS,
                remoteDraft,
                0,
                0,
                'list',
                'list'
            );
            expect(resultSteps.newSteps).toEqual([]);
        });

        it('packages strictly step-scoped fields for shared drafts across all wizard steps', () => {
            const values: Record<string, unknown> = {
                title: 'Collaborative Curry',
                description: 'Fragrant spicy curry',
                categories: ['curry', 'asian'],
                method: 'simmer',
                'ingredient-0': 'Curry paste',
                'step-0': 'Fry paste in oil',
                coCooksIds: ['cook-1'],
                linkedRecipeIds: ['recipe-1'],
                youtubeUrl: 'https://youtube.com/v/123',
                questId: 'quest-1',
                imageSrc: 'https://img.com/1.jpg',
                imageSrc1: 'https://img.com/2.jpg',
                draftId: 'shared-curry-1',
                inviteToken: 'tok-curry',
            };
            const form = {
                getValues: (key: string) => values[key],
                setValue: vi.fn(),
            };
            const sharedDraftData = {
                draftId: 'shared-curry-1',
                inviteToken: 'tok-curry',
                type: 'shared' as const,
            };

            // Category Step
            const catRes = collectDraftFormData(
                form,
                STEPS.CATEGORY,
                sharedDraftData,
                1,
                1,
                'list',
                'list'
            );
            expect(catRes.data.categories).toEqual(['curry', 'asian']);
            expect(catRes.data.title).toBeUndefined();
            expect(catRes.data.imageSrc).toBeUndefined();

            // Description Step
            const descRes = collectDraftFormData(
                form,
                STEPS.DESCRIPTION,
                sharedDraftData,
                1,
                1,
                'list',
                'list'
            );
            expect(descRes.data.title).toBe('Collaborative Curry');
            expect(descRes.data.description).toBe('Fragrant spicy curry');
            expect(descRes.data.categories).toBeUndefined();
            expect(descRes.data.method).toBeUndefined();

            // Ingredients Step
            const ingRes = collectDraftFormData(
                form,
                STEPS.INGREDIENTS,
                sharedDraftData,
                1,
                1,
                'list',
                'list'
            );
            expect(ingRes.data.ingredients).toEqual(['Curry paste']);
            expect(ingRes.data.steps).toBeUndefined();

            // Methods Step
            const methRes = collectDraftFormData(
                form,
                STEPS.METHODS,
                sharedDraftData,
                1,
                1,
                'list',
                'list'
            );
            expect(methRes.data.method).toBe('simmer');
            expect(methRes.data.title).toBeUndefined();

            // Steps Step
            const stepRes = collectDraftFormData(
                form,
                STEPS.STEPS,
                sharedDraftData,
                1,
                1,
                'list',
                'list'
            );
            expect(stepRes.data.steps).toEqual(['Fry paste in oil']);
            expect(stepRes.data.ingredients).toBeUndefined();

            // Related Content Step
            const relRes = collectDraftFormData(
                form,
                STEPS.RELATED_CONTENT,
                sharedDraftData,
                1,
                1,
                'list',
                'list'
            );
            expect(relRes.data.coCooksIds).toEqual(['cook-1']);
            expect(relRes.data.youtubeUrl).toBe('https://youtube.com/v/123');
            expect(relRes.data.imageSrc).toBeUndefined();

            // Images Step
            const imgRes = collectDraftFormData(
                form,
                STEPS.IMAGES,
                sharedDraftData,
                1,
                1,
                'list',
                'list'
            );
            expect(imgRes.data.imageSrc).toBe('https://img.com/1.jpg');
            expect(imgRes.data.imageSrc1).toBe('https://img.com/2.jpg');
            expect(imgRes.data.title).toBeUndefined();
        });

        it('omits step fields when isLocked is true in shared draft mode (H6)', () => {
            const formValues: Record<string, unknown> = {
                title: 'Stale Local Title',
                description: 'Stale Local Description',
            };
            const form = {
                getValues: (key: string) => formValues[key],
                setValue: vi.fn(),
            };

            const sharedDraftData = {
                draftId: 'shared-999',
                type: 'shared',
                inviteToken: 'tok-123',
            };

            const res = collectDraftFormData(
                form,
                STEPS.DESCRIPTION,
                sharedDraftData,
                1,
                1,
                'list',
                'list',
                undefined,
                false,
                true // isLocked
            );

            expect(res.data.draftId).toBe('shared-999');
            expect(res.data.title).toBeUndefined();
            expect(res.data.description).toBeUndefined();
        });

        it('coerces string numeric inputs for minutes, prepTime, and cookTime to numbers (M7)', () => {
            const formValues: Record<string, any> = {
                title: 'Parsed Time Recipe',
                description: 'Description',
                minutes: '45',
                prepTime: '15',
                cookTime: '30',
            };
            const form = {
                getValues: (key: string) => formValues[key],
                setValue: vi.fn(),
            };

            const res = collectDraftFormData(
                form,
                STEPS.DESCRIPTION,
                null,
                1,
                1,
                'list',
                'list'
            );

            expect(res.data.minutes).toBe(45);
            expect(res.data.prepTime).toBe(15);
            expect(res.data.cookTime).toBe(30);
        });
    });
});
