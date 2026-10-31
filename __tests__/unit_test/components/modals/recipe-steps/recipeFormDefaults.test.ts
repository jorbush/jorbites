import { describe, it, expect } from 'vitest';
import { buildInitialRecipeDefaultValues } from '@/app/components/modals/recipe-steps/recipeFormDefaults';
import {
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';

describe('buildInitialRecipeDefaultValues', () => {
    const defaultModalState = {
        isOpen: true,
        isEditMode: false,
    };

    it('creates standard empty default values with 30 ingredient and 30 step slots', () => {
        const defaults = buildInitialRecipeDefaultValues(
            defaultModalState,
            null
        );

        expect(defaults.categories).toEqual([]);
        expect(defaults.title).toBe('');
        expect(defaults.description).toBe('');
        expect(defaults.minutes).toBe(30);
        expect(defaults.prepTime).toBeUndefined();
        expect(defaults.cookTime).toBeUndefined();
        expect(defaults.ingredients).toEqual([]);
        expect(defaults.steps).toEqual([]);
        expect(defaults.coCooksIds).toEqual([]);
        expect(defaults.linkedRecipeIds).toEqual([]);
        expect(defaults.youtubeUrl).toBe('');
        expect(defaults.questId).toBe('');
        expect(defaults.draftId).toBe('');
        expect(defaults.inviteToken).toBe('');

        for (let i = 0; i < RECIPE_MAX_INGREDIENTS; i++) {
            expect(defaults[`ingredient-${i}`]).toBe('');
        }
        for (let i = 0; i < RECIPE_MAX_STEPS; i++) {
            expect(defaults[`step-${i}`]).toBe('');
        }
    });

    it('inherits questId from recipeModal when available in default mode', () => {
        const defaults = buildInitialRecipeDefaultValues(
            { ...defaultModalState, questId: 'quest-999' },
            null
        );
        expect(defaults.questId).toBe('quest-999');
    });

    it('populates form defaults from editRecipeData when isEditMode is true', () => {
        const editRecipeData: any = {
            id: 'rec-123',
            title: 'Lasagna',
            description: 'Delicious homemade lasagna',
            categories: ['Italian', 'Pasta'],
            method: 'Bake',
            imageSrc: 'https://img.test/lasagna.jpg',
            imageSrc1: 'https://img.test/lasagna1.jpg',
            imageSrc2: '',
            imageSrc3: '',
            minutes: 60,
            prepTime: 20,
            cookTime: 40,
            ingredients: ['Pasta sheets', 'Tomato sauce', 'Ricotta'],
            steps: ['Boil pasta', 'Layer sauce and cheese', 'Bake at 180C'],
            coCooks: [{ id: 'user-cook-1', name: 'Chef Mario' }],
            linkedRecipes: [{ id: 'rec-garlic-bread', title: 'Garlic Bread' }],
            youtubeUrl: 'https://youtube.com/watch?v=123',
            questId: 'quest-italian-master',
        };

        const defaults = buildInitialRecipeDefaultValues(
            {
                isOpen: true,
                isEditMode: true,
                editRecipeData,
            },
            null
        );

        expect(defaults.title).toBe('Lasagna');
        expect(defaults.description).toBe('Delicious homemade lasagna');
        expect(defaults.categories).toEqual(['Italian', 'Pasta']);
        expect(defaults.method).toBe('Bake');
        expect(defaults.imageSrc).toBe('https://img.test/lasagna.jpg');
        expect(defaults.imageSrc1).toBe('https://img.test/lasagna1.jpg');
        expect(defaults.minutes).toBe(60);
        expect(defaults.prepTime).toBe(20);
        expect(defaults.cookTime).toBe(40);
        expect(defaults.ingredients).toEqual([
            'Pasta sheets',
            'Tomato sauce',
            'Ricotta',
        ]);
        expect(defaults.steps).toEqual([
            'Boil pasta',
            'Layer sauce and cheese',
            'Bake at 180C',
        ]);
        expect(defaults['ingredient-0']).toBe('Pasta sheets');
        expect(defaults['ingredient-1']).toBe('Tomato sauce');
        expect(defaults['ingredient-2']).toBe('Ricotta');
        expect(defaults['ingredient-3']).toBe('');
        expect(defaults['step-0']).toBe('Boil pasta');
        expect(defaults['step-1']).toBe('Layer sauce and cheese');
        expect(defaults['step-2']).toBe('Bake at 180C');
        expect(defaults['step-3']).toBe('');
        expect(defaults.coCooksIds).toEqual(['user-cook-1']);
        expect(defaults.linkedRecipeIds).toEqual(['rec-garlic-bread']);
        expect(defaults.youtubeUrl).toBe('https://youtube.com/watch?v=123');
        expect(defaults.questId).toBe('quest-italian-master');
    });

    it('prefers explicit coCooksIds and linkedRecipeIds in editRecipeData', () => {
        const editRecipeData: any = {
            title: 'Salad',
            coCooksIds: ['explicit-user-1'],
            coCooks: [{ id: 'fallback-user' }],
            linkedRecipeIds: ['explicit-rec-1'],
            linkedRecipes: [{ id: 'fallback-rec' }],
        };

        const defaults = buildInitialRecipeDefaultValues(
            { isOpen: true, isEditMode: true, editRecipeData },
            null
        );

        expect(defaults.coCooksIds).toEqual(['explicit-user-1']);
        expect(defaults.linkedRecipeIds).toEqual(['explicit-rec-1']);
    });

    it('populates form defaults from draftData when provided in non-edit mode', () => {
        const draftData: any = {
            draftId: 'draft-abc-123',
            inviteToken: 'invite-tok-xyz',
            title: 'Draft Pancakes',
            description: 'Fluffy weekend pancakes',
            categories: ['Breakfast'],
            method: 'Pan fry',
            imageSrc: 'https://img.test/pancake.jpg',
            minutes: 15,
            prepTime: 5,
            cookTime: 10,
            ingredients: ['Flour', 'Milk', 'Eggs'],
            steps: ['Mix batter', 'Cook on pan until golden'],
            coCooks: [{ id: 'user-friend-1' }],
            linkedRecipeIds: ['recipe-syrup'],
            youtubeUrl: 'https://youtube.com/watch?v=pancake',
            questId: 'quest-breakfast-club',
        };

        const defaults = buildInitialRecipeDefaultValues(
            defaultModalState,
            draftData
        );

        expect(defaults.draftId).toBe('draft-abc-123');
        expect(defaults.inviteToken).toBe('invite-tok-xyz');
        expect(defaults.title).toBe('Draft Pancakes');
        expect(defaults.description).toBe('Fluffy weekend pancakes');
        expect(defaults.categories).toEqual(['Breakfast']);
        expect(defaults.method).toBe('Pan fry');
        expect(defaults.minutes).toBe(15);
        expect(defaults.prepTime).toBe(5);
        expect(defaults.cookTime).toBe(10);
        expect(defaults['ingredient-0']).toBe('Flour');
        expect(defaults['ingredient-1']).toBe('Milk');
        expect(defaults['ingredient-2']).toBe('Eggs');
        expect(defaults['ingredient-3']).toBe('');
        expect(defaults['step-0']).toBe('Mix batter');
        expect(defaults['step-1']).toBe('Cook on pan until golden');
        expect(defaults['step-2']).toBe('');
        expect(defaults.coCooksIds).toEqual(['user-friend-1']);
        expect(defaults.linkedRecipeIds).toEqual(['recipe-syrup']);
        expect(defaults.youtubeUrl).toBe('https://youtube.com/watch?v=pancake');
        expect(defaults.questId).toBe('quest-breakfast-club');
    });

    it('uses fallback 30 minutes when draftData has undefined minutes', () => {
        const defaults = buildInitialRecipeDefaultValues(defaultModalState, {
            draftId: 'draft-no-minutes',
            minutes: undefined,
        });

        expect(defaults.minutes).toBe(30);
    });

    it('uses fallback 30 minutes in edit mode when editRecipeData.minutes is undefined', () => {
        const defaults = buildInitialRecipeDefaultValues(
            {
                isOpen: true,
                isEditMode: true,
                editRecipeData: {
                    title: 'Quick Snack',
                    minutes: undefined as any,
                },
            },
            null
        );

        expect(defaults.minutes).toBe(30);
    });

    it('clamps ingredients and steps to RECIPE_MAX_INGREDIENTS and RECIPE_MAX_STEPS when input exceeds limits', () => {
        const oversizedIngredients = Array.from(
            { length: 50 },
            (_, i) => `Ingredient ${i}`
        );
        const oversizedSteps = Array.from(
            { length: 50 },
            (_, i) => `Step ${i}`
        );

        const defaults = buildInitialRecipeDefaultValues(
            {
                isOpen: true,
                isEditMode: true,
                editRecipeData: {
                    title: 'Massive Feast',
                    ingredients: oversizedIngredients,
                    steps: oversizedSteps,
                },
            },
            null
        );

        expect((defaults.ingredients as string[]).length).toBe(
            RECIPE_MAX_INGREDIENTS
        );
        expect((defaults.steps as string[]).length).toBe(RECIPE_MAX_STEPS);
        expect(defaults[`ingredient-${RECIPE_MAX_INGREDIENTS - 1}`]).toBe(
            `Ingredient ${RECIPE_MAX_INGREDIENTS - 1}`
        );
        expect(
            defaults[`ingredient-${RECIPE_MAX_INGREDIENTS}`]
        ).toBeUndefined();
        expect(defaults[`step-${RECIPE_MAX_STEPS - 1}`]).toBe(
            `Step ${RECIPE_MAX_STEPS - 1}`
        );
        expect(defaults[`step-${RECIPE_MAX_STEPS}`]).toBeUndefined();
    });

    it('populates form defaults from forkRecipeData with translated title and empty imageSrc', () => {
        const forkRecipeData: any = {
            title: 'Classic Tiramisu',
            description: 'Traditional Italian dessert',
            categories: ['Dessert', 'Italian'],
            method: 'Chilled',
            ingredients: ['Mascarpone', 'Savoiardi', 'Espresso'],
            steps: ['Dip cookies in espresso', 'Layer with mascarpone cream'],
            minutes: 45,
            prepTime: 20,
            cookTime: 0,
        };

        const mockTranslate = (key: string, options?: any) => {
            if (key === 'remix_of') return `Remix of ${options?.title}`;
            return key;
        };

        const defaults = buildInitialRecipeDefaultValues(
            {
                isOpen: true,
                isEditMode: false,
                forkRecipeData,
                forkedFromRecipeId: 'parent-recipe-123',
            },
            null,
            mockTranslate
        );

        expect(defaults.title).toBe('Remix of Classic Tiramisu');
        expect(defaults.description).toBe('Traditional Italian dessert');
        expect(defaults.categories).toEqual(['Dessert', 'Italian']);
        expect(defaults.method).toBe('Chilled');
        expect(defaults.minutes).toBe(45);
        expect(defaults.prepTime).toBe(20);
        expect(defaults.cookTime).toBe(0);
        expect(defaults.ingredients).toEqual([
            'Mascarpone',
            'Savoiardi',
            'Espresso',
        ]);
        expect(defaults.steps).toEqual([
            'Dip cookies in espresso',
            'Layer with mascarpone cream',
        ]);
        expect(defaults.imageSrc).toBe('');
        expect(defaults.imageSrc1).toBe('');
        expect(defaults.forkedFromRecipeId).toBe('parent-recipe-123');
        expect(defaults['ingredient-0']).toBe('Mascarpone');
        expect(defaults['step-0']).toBe('Dip cookies in espresso');
    });

    it('falls back to standard Remix of prefix when translation function is omitted', () => {
        const forkRecipeData: any = {
            title: 'Paella',
            categories: ['Spanish'],
            method: 'Simmer',
            ingredients: ['Rice', 'Saffron'],
            steps: ['Cook rice'],
            minutes: 60,
        };

        const defaults = buildInitialRecipeDefaultValues(
            {
                isOpen: true,
                isEditMode: false,
                forkRecipeData,
                forkedFromRecipeId: 'paella-999',
            },
            null
        );

        expect(defaults.title).toBe('Remix of Paella');
        expect(defaults.forkedFromRecipeId).toBe('paella-999');
        expect(defaults.imageSrc).toBe('');
    });
});
