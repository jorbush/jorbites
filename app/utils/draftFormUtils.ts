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
    _step: number,
    draftData: any,
    _effectiveNumIngredients: number,
    _effectiveNumSteps: number,
    ingredientsInputMode: string,
    stepsInputMode: string
): { newIngredients: string[]; newSteps: string[] } {
    let localIngredients: string[] = [];
    if (ingredientsInputMode === 'text') {
        const textareaValue = form.getValues('ingredients-plain-text');
        const parsedItems = parseTextToList(
            textareaValue,
            RECIPE_MAX_INGREDIENTS,
            'ingredient'
        );
        if (parsedItems.length > 0) {
            localIngredients = parsedItems;
        }
    } else {
        for (let i = 0; i < RECIPE_MAX_INGREDIENTS; i++) {
            const val = form.getValues(`ingredient-${i}`);
            if (typeof val === 'string' && val.trim() !== '') {
                localIngredients.push(val.trim());
            }
        }
    }

    let newIngredients: string[] = [];
    if (localIngredients.length > 0) {
        newIngredients = localIngredients;
    } else {
        const formIngredients = form.getValues('ingredients');
        if (Array.isArray(formIngredients) && formIngredients.length > 0) {
            newIngredients = formIngredients.filter(
                (item: any) => typeof item === 'string' && item.trim() !== ''
            );
        } else {
            const remoteIngredients = draftData?.ingredients;
            if (
                Array.isArray(remoteIngredients) &&
                remoteIngredients.length > 0
            ) {
                newIngredients = remoteIngredients;
            }
        }
    }

    let localSteps: string[] = [];
    if (stepsInputMode === 'text') {
        const textareaValue = form.getValues('steps-plain-text');
        const parsedItems = parseTextToList(
            textareaValue,
            RECIPE_MAX_STEPS,
            'step'
        );
        if (parsedItems.length > 0) {
            localSteps = parsedItems;
        }
    } else {
        for (let i = 0; i < RECIPE_MAX_STEPS; i++) {
            const val = form.getValues(`step-${i}`);
            if (typeof val === 'string' && val.trim() !== '') {
                localSteps.push(val.trim());
            }
        }
    }

    let newSteps: string[] = [];
    if (localSteps.length > 0) {
        newSteps = localSteps;
    } else {
        const formSteps = form.getValues('steps');
        if (Array.isArray(formSteps) && formSteps.length > 0) {
            newSteps = formSteps.filter(
                (item: any) => typeof item === 'string' && item.trim() !== ''
            );
        } else {
            const remoteSteps = draftData?.steps;
            if (Array.isArray(remoteSteps) && remoteSteps.length > 0) {
                newSteps = remoteSteps;
            }
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
    _isFullPayload = false
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

    // For shared (collaborative) drafts we only send the fields belonging to
    // the step the user is currently editing. Sending stale local values for
    // other steps would overwrite concurrent co-cook edits stored in Redis.
    // For solo drafts there is no collaborator risk and the server now merges
    // with the existing Redis record, so we always send the full payload.
    const isSharedDraft = Boolean(
        currentInviteToken ||
        draftData?.type === 'shared' ||
        (Array.isArray(draftData?.coCooksIds) &&
            draftData.coCooksIds.length > 0)
    );

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

    // Include ingredients/steps unconditionally for solo drafts.
    // For shared drafts, only include them when the user is actively on that step.
    if (!isSharedDraft || step === STEPS.INGREDIENTS) {
        data.ingredients = newIngredients;
    }
    if (!isSharedDraft || step === STEPS.STEPS) {
        data.steps = newSteps;
    }

    return {
        data,
        currentDraftId,
        currentInviteToken,
    };
}
