import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    processIngredientsOnStepAdvance,
    processStepsOnStepAdvance,
} from '@/app/components/modals/recipe-steps/recipeStepProcessors';
import { toast } from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('recipeStepProcessors', () => {
    const mockT = vi.fn((key: string) => key);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('processIngredientsOnStepAdvance', () => {
        it('parses plain text mode, applies parsed items, switches mode to list and returns true', () => {
            const mockGetValues = vi.fn().mockImplementation((key: string) => {
                if (key === 'ingredients-plain-text') {
                    return '2 cups flour\n1 cup sugar\n1 tsp salt';
                }
                return '';
            });
            const mockSetIngredients = vi.fn();
            const mockSetIngredientsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processIngredientsOnStepAdvance({
                ingredientsInputMode: 'text',
                getValues: mockGetValues,
                setIngredients: mockSetIngredients,
                setIngredientsInputMode: mockSetIngredientsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: false,
                t: mockT,
            });

            expect(result).toBe(true);
            expect(mockSetIngredients).toHaveBeenCalledWith([
                '2 cups flour',
                '1 cup sugar',
                '1 tsp salt',
            ]);
            expect(mockSetIngredientsInputMode).toHaveBeenCalledWith('list');
            expect(toast.success).toHaveBeenCalledWith('3 ingredients_applied');
        });

        it('blocks navigation and shows error when plain text is empty and step is unlocked', () => {
            const mockGetValues = vi.fn().mockReturnValue('');
            const mockSetIngredients = vi.fn();
            const mockSetIngredientsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processIngredientsOnStepAdvance({
                ingredientsInputMode: 'text',
                getValues: mockGetValues,
                setIngredients: mockSetIngredients,
                setIngredientsInputMode: mockSetIngredientsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: false,
                t: mockT,
            });

            expect(result).toBe(false);
            expect(toast.error).toHaveBeenCalledWith('no_ingredients_found');
            expect(mockSetIngredients).not.toHaveBeenCalled();
        });

        it('allows navigation without error when plain text is empty but step is locked by another user', () => {
            const mockGetValues = vi.fn().mockReturnValue('');
            const mockSetIngredients = vi.fn();
            const mockSetIngredientsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processIngredientsOnStepAdvance({
                ingredientsInputMode: 'text',
                getValues: mockGetValues,
                setIngredients: mockSetIngredients,
                setIngredientsInputMode: mockSetIngredientsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: true,
                t: mockT,
            });

            expect(result).toBe(true);
            expect(toast.error).not.toHaveBeenCalled();
        });

        it('automatically splits single ingredient field with commas in list mode', () => {
            const mockGetValues = vi.fn().mockImplementation((key: string) => {
                if (key === 'ingredient-0') {
                    return 'Flour, Sugar, Butter, Milk';
                }
                return '';
            });
            const mockSetIngredients = vi.fn();
            const mockSetIngredientsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processIngredientsOnStepAdvance({
                ingredientsInputMode: 'list',
                getValues: mockGetValues,
                setIngredients: mockSetIngredients,
                setIngredientsInputMode: mockSetIngredientsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: false,
                t: mockT,
            });

            expect(result).toBe(true);
            expect(mockSetIngredients).toHaveBeenCalledWith([
                'Flour',
                'Sugar',
                'Butter',
                'Milk',
            ]);
            expect(toast.success).toHaveBeenCalledWith('4 ingredients_applied');
        });

        it('automatically splits single ingredient field with bullets and intro text in list mode', () => {
            const mockGetValues = vi.fn().mockImplementation((key: string) => {
                if (key === 'ingredient-0') {
                    return 'Solo necesitas: • 2 plátanos maduros 🍌 • 1 vaso de harina integral de avena • 2 huevos 🥚 • 1 cucharada de levadura • Pepitas de choc';
                }
                return '';
            });
            const mockSetIngredients = vi.fn();
            const mockSetIngredientsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processIngredientsOnStepAdvance({
                ingredientsInputMode: 'list',
                getValues: mockGetValues,
                setIngredients: mockSetIngredients,
                setIngredientsInputMode: mockSetIngredientsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: false,
                t: mockT,
            });

            expect(result).toBe(true);
            expect(mockSetIngredients).toHaveBeenCalledWith([
                '2 plátanos maduros 🍌',
                '1 vaso de harina integral de avena',
                '2 huevos 🥚',
                '1 cucharada de levadura',
                'Pepitas de choc',
            ]);
            expect(toast.success).toHaveBeenCalledWith('5 ingredients_applied');
        });

        it('collects multiple list slots and updates ingredients form value', () => {
            const mockGetValues = vi.fn().mockImplementation((key: string) => {
                if (key === 'ingredient-0') return '1 Apple';
                if (key === 'ingredient-1') return '2 Bananas';
                return '';
            });
            const mockSetIngredients = vi.fn();
            const mockSetIngredientsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processIngredientsOnStepAdvance({
                ingredientsInputMode: 'list',
                getValues: mockGetValues,
                setIngredients: mockSetIngredients,
                setIngredientsInputMode: mockSetIngredientsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: false,
                t: mockT,
            });

            expect(result).toBe(true);
            expect(mockSetCustomValue).toHaveBeenCalledWith('ingredients', [
                '1 Apple',
                '2 Bananas',
            ]);
        });

        it('does not split or remove headers when multiple ingredient items exist (e.g. "for the sauce: ketchup and mayonese")', () => {
            const mockGetValues = vi.fn().mockImplementation((key: string) => {
                if (key === 'ingredient-0') return '200g flour';
                if (key === 'ingredient-1')
                    return 'for the sauce: ketchup and mayonese';
                return '';
            });
            const mockSetIngredients = vi.fn();
            const mockSetIngredientsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processIngredientsOnStepAdvance({
                ingredientsInputMode: 'list',
                getValues: mockGetValues,
                setIngredients: mockSetIngredients,
                setIngredientsInputMode: mockSetIngredientsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: false,
                t: mockT,
            });

            expect(result).toBe(true);
            expect(mockSetIngredients).not.toHaveBeenCalled();
            expect(mockSetCustomValue).toHaveBeenCalledWith('ingredients', [
                '200g flour',
                'for the sauce: ketchup and mayonese',
            ]);
        });
    });

    describe('processStepsOnStepAdvance', () => {
        it('parses plain text mode, applies parsed steps, switches mode to list and returns true', () => {
            const mockGetValues = vi.fn().mockImplementation((key: string) => {
                if (key === 'steps-plain-text') {
                    return '1. Preheat oven\n2. Mix ingredients\n3. Bake for 30 mins';
                }
                return '';
            });
            const mockSetSteps = vi.fn();
            const mockSetStepsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processStepsOnStepAdvance({
                stepsInputMode: 'text',
                getValues: mockGetValues,
                setSteps: mockSetSteps,
                setStepsInputMode: mockSetStepsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: false,
                t: mockT,
            });

            expect(result).toBe(true);
            expect(mockSetSteps).toHaveBeenCalledWith([
                'Preheat oven',
                'Mix ingredients',
                'Bake for 30 mins',
            ]);
            expect(mockSetStepsInputMode).toHaveBeenCalledWith('list');
            expect(toast.success).toHaveBeenCalledWith('3 steps_applied');
        });

        it('blocks navigation and shows error when steps plain text is empty and step is unlocked', () => {
            const mockGetValues = vi.fn().mockReturnValue('');
            const mockSetSteps = vi.fn();
            const mockSetStepsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processStepsOnStepAdvance({
                stepsInputMode: 'text',
                getValues: mockGetValues,
                setSteps: mockSetSteps,
                setStepsInputMode: mockSetStepsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: false,
                t: mockT,
            });

            expect(result).toBe(false);
            expect(toast.error).toHaveBeenCalledWith('no_steps_found');
        });

        it('allows navigation without error when steps plain text is empty but step is locked', () => {
            const mockGetValues = vi.fn().mockReturnValue('');
            const mockSetSteps = vi.fn();
            const mockSetStepsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processStepsOnStepAdvance({
                stepsInputMode: 'text',
                getValues: mockGetValues,
                setSteps: mockSetSteps,
                setStepsInputMode: mockSetStepsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: true,
                t: mockT,
            });

            expect(result).toBe(true);
            expect(toast.error).not.toHaveBeenCalled();
        });

        it('automatically splits single step field into multiple steps if multiple sentences detected', () => {
            const mockGetValues = vi.fn().mockImplementation((key: string) => {
                if (key === 'step-0') {
                    return 'Preheat oven to 350. Mix the dry ingredients together. Pour into baking pan.';
                }
                return '';
            });
            const mockSetSteps = vi.fn();
            const mockSetStepsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processStepsOnStepAdvance({
                stepsInputMode: 'list',
                getValues: mockGetValues,
                setSteps: mockSetSteps,
                setStepsInputMode: mockSetStepsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: false,
                t: mockT,
            });

            expect(result).toBe(true);
            expect(mockSetSteps).toHaveBeenCalledWith([
                'Preheat oven to',
                'Mix the dry ingredients together',
                'Pour into baking pan',
            ]);
            expect(toast.success).toHaveBeenCalledWith('3 steps_applied');
        });

        it('automatically splits single step field with bullets and intro text in list mode', () => {
            const mockGetValues = vi.fn().mockImplementation((key: string) => {
                if (key === 'step-0') {
                    return 'Solo necesitas seguir estos pasos: • Pelar las patatas • Cortar en rodajas • Freír en abundante aceite';
                }
                return '';
            });
            const mockSetSteps = vi.fn();
            const mockSetStepsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processStepsOnStepAdvance({
                stepsInputMode: 'list',
                getValues: mockGetValues,
                setSteps: mockSetSteps,
                setStepsInputMode: mockSetStepsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: false,
                t: mockT,
            });

            expect(result).toBe(true);
            expect(mockSetSteps).toHaveBeenCalledWith([
                'Pelar las patatas',
                'Cortar en rodajas',
                'Freír en abundante aceite',
            ]);
            expect(toast.success).toHaveBeenCalledWith('3 steps_applied');
        });

        it('collects multiple list step slots and updates steps form value', () => {
            const mockGetValues = vi.fn().mockImplementation((key: string) => {
                if (key === 'step-0') return 'Boil water';
                if (key === 'step-1') return 'Add pasta';
                return '';
            });
            const mockSetSteps = vi.fn();
            const mockSetStepsInputMode = vi.fn();
            const mockSetCustomValue = vi.fn();

            const result = processStepsOnStepAdvance({
                stepsInputMode: 'list',
                getValues: mockGetValues,
                setSteps: mockSetSteps,
                setStepsInputMode: mockSetStepsInputMode,
                setCustomValue: mockSetCustomValue,
                isCurrentStepLocked: false,
                t: mockT,
            });

            expect(result).toBe(true);
            expect(mockSetCustomValue).toHaveBeenCalledWith('steps', [
                'Boil water',
                'Add pasta',
            ]);
        });

        it('uses custom toastNotifier instead of default toast when provided', () => {
            const customNotifier = {
                success: vi.fn(),
                error: vi.fn(),
            };
            const mockGetValues = vi.fn().mockReturnValue('');

            const result = processStepsOnStepAdvance({
                stepsInputMode: 'text',
                getValues: mockGetValues,
                setSteps: vi.fn(),
                setStepsInputMode: vi.fn(),
                setCustomValue: vi.fn(),
                isCurrentStepLocked: false,
                t: mockT,
                toastNotifier: customNotifier,
            });

            expect(result).toBe(false);
            expect(customNotifier.error).toHaveBeenCalledWith('no_steps_found');
            expect(toast.error).not.toHaveBeenCalled();
        });
    });
});
