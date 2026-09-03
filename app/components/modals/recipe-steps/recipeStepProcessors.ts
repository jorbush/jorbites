import { toast } from 'react-hot-toast';
import { UseFormGetValues } from 'react-hook-form';
import {
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';
import { parseIngredientsText, parseStepsText } from '@/app/utils/textParser';

export interface ToastNotifier {
    success: (msg: string) => void;
    error: (msg: string) => void;
}

interface IngredientProcessorProps {
    ingredientsInputMode: 'list' | 'text';
    getValues: UseFormGetValues<any>;
    setIngredients: (items: string[]) => void;
    setIngredientsInputMode: (mode: 'list' | 'text') => void;
    setCustomValue: (id: string, value: unknown) => void;
    isCurrentStepLocked?: boolean;
    t: (key: string) => string;
    toastNotifier?: ToastNotifier;
}

export function processIngredientsOnStepAdvance({
    ingredientsInputMode,
    getValues,
    setIngredients,
    setIngredientsInputMode,
    setCustomValue,
    isCurrentStepLocked,
    t,
    toastNotifier,
}: IngredientProcessorProps): boolean {
    const notifier = toastNotifier || toast;

    if (ingredientsInputMode === 'text') {
        const textareaValue = getValues('ingredients-plain-text');
        const parsedItems = parseIngredientsText(
            textareaValue,
            RECIPE_MAX_INGREDIENTS
        );
        if (parsedItems.length > 0) {
            setIngredients(parsedItems);
            setIngredientsInputMode('list');
            notifier.success(
                `${parsedItems.length} ${t('ingredients_applied')}`
            );
            return true;
        }
        if (!isCurrentStepLocked) {
            notifier.error(t('no_ingredients_found') || 'No ingredients found');
            return false;
        }
        return true;
    }

    const newIngredients: string[] = [];
    for (let i = 0; i < RECIPE_MAX_INGREDIENTS; i++) {
        const val = getValues(`ingredient-${i}`);
        if (typeof val === 'string' && val.trim() !== '') {
            newIngredients.push(val.trim());
        }
    }

    if (newIngredients.length === 1) {
        const parsedItems = parseIngredientsText(
            newIngredients[0],
            RECIPE_MAX_INGREDIENTS
        );
        if (parsedItems.length > 1) {
            setIngredients(parsedItems);
            notifier.success(
                `${parsedItems.length} ${t('ingredients_applied')}`
            );
            return true;
        }
    }

    setCustomValue('ingredients', newIngredients);
    return true;
}

interface StepProcessorProps {
    stepsInputMode: 'list' | 'text';
    getValues: UseFormGetValues<any>;
    setSteps: (items: string[]) => void;
    setStepsInputMode: (mode: 'list' | 'text') => void;
    setCustomValue: (id: string, value: unknown) => void;
    isCurrentStepLocked?: boolean;
    t: (key: string) => string;
    toastNotifier?: ToastNotifier;
}

export function processStepsOnStepAdvance({
    stepsInputMode,
    getValues,
    setSteps,
    setStepsInputMode,
    setCustomValue,
    isCurrentStepLocked,
    t,
    toastNotifier,
}: StepProcessorProps): boolean {
    const notifier = toastNotifier || toast;

    if (stepsInputMode === 'text') {
        const textareaValue = getValues('steps-plain-text');
        const parsedItems = parseStepsText(textareaValue, RECIPE_MAX_STEPS);
        if (parsedItems.length > 0) {
            setSteps(parsedItems);
            setStepsInputMode('list');
            notifier.success(`${parsedItems.length} ${t('steps_applied')}`);
            return true;
        }
        if (!isCurrentStepLocked) {
            notifier.error(t('no_steps_found') || 'No steps found');
            return false;
        }
        return true;
    }

    const newSteps: string[] = [];
    for (let i = 0; i < RECIPE_MAX_STEPS; i++) {
        const val = getValues(`step-${i}`);
        if (typeof val === 'string' && val.trim() !== '') {
            newSteps.push(val.trim());
        }
    }

    if (newSteps.length === 1) {
        const parsedItems = parseStepsText(newSteps[0], RECIPE_MAX_STEPS);
        if (parsedItems.length > 1) {
            setSteps(parsedItems);
            notifier.success(`${parsedItems.length} ${t('steps_applied')}`);
            return true;
        }
    }

    setCustomValue('steps', newSteps);
    return true;
}
