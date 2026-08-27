import {
    STEPS,
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';
import { parseTextToList } from '@/app/utils/textParser';

export interface FormAccessor {
    getValues: (field: string) => any;
    setValue: (field: string, value: any) => void;
}

export function extractIngredientsAndSteps(
    form: FormAccessor,
    step: number,
    draftData: any,
    effectiveNumIngredients: number,
    effectiveNumSteps: number,
    ingredientsInputMode: string,
    stepsInputMode: string
): { newIngredients: string[]; newSteps: string[] } {
    let localIngredients: string[] = [];
    if (ingredientsInputMode === 'text') {
        const textareaValue = form.getValues('ingredients-plain-text');
        const parsedItems = parseTextToList(
            textareaValue,
            RECIPE_MAX_INGREDIENTS
        );
        if (parsedItems.length > 0) {
            localIngredients = parsedItems;
        }
    } else {
        for (let i = 0; i < effectiveNumIngredients; i++) {
            const val = form.getValues(`ingredient-${i}`);
            if (typeof val === 'string' && val.trim() !== '') {
                localIngredients.push(val);
            }
        }
    }

    let newIngredients: string[] = [];
    if (step === STEPS.INGREDIENTS) {
        newIngredients = localIngredients;
    } else {
        const remoteIngredients = draftData?.ingredients;
        if (Array.isArray(remoteIngredients) && remoteIngredients.length > 0) {
            newIngredients = remoteIngredients;
        } else if (localIngredients.length > 0) {
            newIngredients = localIngredients;
        } else {
            newIngredients = form.getValues('ingredients') || [];
        }
    }

    let localSteps: string[] = [];
    if (stepsInputMode === 'text') {
        const textareaValue = form.getValues('steps-plain-text');
        const parsedItems = parseTextToList(textareaValue, RECIPE_MAX_STEPS);
        if (parsedItems.length > 0) {
            localSteps = parsedItems;
        }
    } else {
        for (let i = 0; i < effectiveNumSteps; i++) {
            const val = form.getValues(`step-${i}`);
            if (typeof val === 'string' && val.trim() !== '') {
                localSteps.push(val);
            }
        }
    }

    let newSteps: string[] = [];
    if (step === STEPS.STEPS) {
        newSteps = localSteps;
    } else {
        const remoteSteps = draftData?.steps;
        if (Array.isArray(remoteSteps) && remoteSteps.length > 0) {
            newSteps = remoteSteps;
        } else if (localSteps.length > 0) {
            newSteps = localSteps;
        } else {
            newSteps = form.getValues('steps') || [];
        }
    }

    return { newIngredients, newSteps };
}

export function collectDraftFormData(
    form: FormAccessor,
    step: number,
    draftData: any,
    effectiveNumIngredients: number,
    effectiveNumSteps: number,
    ingredientsInputMode: string,
    stepsInputMode: string,
    stepOverride?: number,
    isFullPayload = false
) {
    const stepToSave = typeof stepOverride === 'number' ? stepOverride : step;
    const { newIngredients, newSteps } = extractIngredientsAndSteps(
        form,
        step,
        draftData,
        effectiveNumIngredients,
        effectiveNumSteps,
        ingredientsInputMode,
        stepsInputMode
    );

    const currentDraftId = form.getValues('draftId') || draftData?.draftId;
    const currentInviteToken =
        form.getValues('inviteToken') || draftData?.inviteToken;
    const isShared = Boolean(currentDraftId);

    const data: any = {
        draftId: currentDraftId,
        inviteToken: currentInviteToken,
        currentStep: stepToSave,
        categories: form.getValues('categories') || draftData?.categories || [],
        method:
            step === STEPS.METHODS
                ? form.getValues('method')
                : draftData?.method || form.getValues('method') || '',
        imageSrc: form.getValues('imageSrc'),
        imageSrc1: form.getValues('imageSrc1'),
        imageSrc2: form.getValues('imageSrc2'),
        imageSrc3: form.getValues('imageSrc3'),
        title: form.getValues('title'),
        description: form.getValues('description'),
        minutes: form.getValues('minutes'),
        prepTime: form.getValues('prepTime'),
        cookTime: form.getValues('cookTime'),
        coCooksIds:
            step === STEPS.RELATED_CONTENT
                ? form.getValues('coCooksIds')
                : draftData?.coCooksIds || form.getValues('coCooksIds') || [],
        linkedRecipeIds:
            step === STEPS.RELATED_CONTENT
                ? form.getValues('linkedRecipeIds')
                : draftData?.linkedRecipeIds ||
                  form.getValues('linkedRecipeIds') ||
                  [],
        youtubeUrl: form.getValues('youtubeUrl'),
        questId: form.getValues('questId'),
        updatedAt: new Date().toISOString(),
    };

    if (step === STEPS.INGREDIENTS || !isShared || isFullPayload) {
        data.ingredients = newIngredients;
    }
    if (step === STEPS.STEPS || !isShared || isFullPayload) {
        data.steps = newSteps;
    }

    return {
        data,
        currentDraftId,
        currentInviteToken,
    };
}
