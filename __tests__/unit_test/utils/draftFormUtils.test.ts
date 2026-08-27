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
        });
    });
});
