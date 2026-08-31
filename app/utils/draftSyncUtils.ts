import {
    STEPS,
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';
import { DraftData } from '@/app/types/draft';

export interface LockChecker {
    isLockedByOther?: (lockKey: string) => boolean;
}

export interface SetValueOptions {
    shouldDirty?: boolean;
    shouldTouch?: boolean;
    shouldValidate?: boolean;
}

/**
 * Deep equality check for primitives, arrays, and plain objects.
 */
export function valuesEqual(current: unknown, incoming: unknown): boolean {
    if (Array.isArray(current) || Array.isArray(incoming)) {
        return JSON.stringify(current) === JSON.stringify(incoming);
    }
    return Object.is(current, incoming);
}

/**
 * Checks if a specific form field has been modified locally by the user
 * compared to the previously synced draft snapshot.
 */
export function isFieldLocallyEdited(
    currentVal: unknown,
    prevValue: unknown
): boolean {
    if (currentVal === undefined || currentVal === null || currentVal === '') {
        return false;
    }
    if (Array.isArray(currentVal) && currentVal.length === 0) {
        return false;
    }
    if (prevValue === undefined || prevValue === null) {
        return false;
    }
    return !valuesEqual(currentVal, prevValue);
}

/**
 * Determines if incoming remote fields for a step should be applied to the form.
 * Returns true if:
 * 1. The step is inactive (user is on a different step).
 * 2. The step is locked by another co-cook.
 * 3. The step is active but the user has not locally modified its fields.
 */
export function shouldApplyStep(
    stepIndex: number,
    currentStep: number,
    fields: string[],
    getValues: (field: string) => unknown,
    prevDraft: Partial<DraftData> | null | undefined,
    lock?: LockChecker | null
): boolean {
    if (currentStep !== stepIndex) return true;
    if (lock?.isLockedByOther?.(`step:${stepIndex}`)) return true;
    const locallyEdited = fields.some((field) =>
        isFieldLocallyEdited(
            getValues(field),
            (prevDraft as Record<string, unknown> | null | undefined)?.[field]
        )
    );
    return !locallyEdited;
}

/**
 * Checks if the ingredients step has local unsaved user modifications.
 */
export function isIngredientsLocallyEdited(
    currentStep: number,
    getValues: (field: string) => unknown,
    prevDraft: Partial<DraftData> | null | undefined,
    lock?: LockChecker | null
): boolean {
    if (currentStep !== STEPS.INGREDIENTS) return false;
    if (lock?.isLockedByOther?.(`step:${STEPS.INGREDIENTS}`)) return false;
    const currentList = getValues('ingredients');
    const prevList = prevDraft?.ingredients;
    if (
        Array.isArray(currentList) &&
        currentList.length > 0 &&
        !valuesEqual(currentList, prevList)
    ) {
        return true;
    }
    for (let idx = 0; idx < RECIPE_MAX_INGREDIENTS; idx++) {
        const val = getValues(`ingredient-${idx}`) ?? '';
        const prevVal = prevList?.[idx] ?? '';
        if (val !== prevVal) {
            return true;
        }
    }
    return false;
}

/**
 * Checks if the recipe steps step has local unsaved user modifications.
 */
export function isStepsLocallyEdited(
    currentStep: number,
    getValues: (field: string) => unknown,
    prevDraft: Partial<DraftData> | null | undefined,
    lock?: LockChecker | null
): boolean {
    if (currentStep !== STEPS.STEPS) return false;
    if (lock?.isLockedByOther?.(`step:${STEPS.STEPS}`)) return false;
    const currentList = getValues('steps');
    const prevList = prevDraft?.steps;
    if (
        Array.isArray(currentList) &&
        currentList.length > 0 &&
        !valuesEqual(currentList, prevList)
    ) {
        return true;
    }
    for (let idx = 0; idx < RECIPE_MAX_STEPS; idx++) {
        const val = getValues(`step-${idx}`) ?? '';
        const prevVal = prevList?.[idx] ?? '';
        if (val !== prevVal) {
            return true;
        }
    }
    return false;
}

/**
 * Synchronizes remote draft data into form inputs while preserving uncommitted
 * edits on active steps and avoiding state conflicts across co-cooks.
 */
export function syncRemoteDraftToForm(
    draftData: Partial<DraftData> | null | undefined,
    prevDraft: Partial<DraftData> | null | undefined,
    step: number,
    lock: LockChecker | null | undefined,
    getValues: (field: string) => unknown,
    setValue: (field: string, value: unknown, options?: SetValueOptions) => void
): void {
    const remoteRecord = draftData as
        | Record<string, unknown>
        | null
        | undefined;
    const hasRemoteField = (field: string) =>
        remoteRecord
            ? Object.prototype.hasOwnProperty.call(remoteRecord, field)
            : false;

    const applyField = (field: string) => {
        if (
            hasRemoteField(field) &&
            !valuesEqual(getValues(field), remoteRecord?.[field])
        ) {
            setValue(field, remoteRecord?.[field], {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        }
    };

    const applyStepFields = (stepIndex: number, fields: string[]) => {
        if (
            !shouldApplyStep(
                stepIndex,
                step,
                fields,
                getValues,
                prevDraft,
                lock
            )
        )
            return;
        fields.forEach(applyField);
    };

    applyStepFields(STEPS.CATEGORY, ['categories']);
    applyStepFields(STEPS.DESCRIPTION, [
        'title',
        'description',
        'minutes',
        'prepTime',
        'cookTime',
    ]);

    if (
        !isIngredientsLocallyEdited(step, getValues, prevDraft, lock) &&
        hasRemoteField('ingredients') &&
        Array.isArray(draftData.ingredients)
    ) {
        const incoming = draftData.ingredients;
        for (let idx = 0; idx < RECIPE_MAX_INGREDIENTS; idx++) {
            const value = incoming[idx] ?? '';
            if (getValues(`ingredient-${idx}`) !== value) {
                setValue(`ingredient-${idx}`, value, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                });
            }
        }
        if (!valuesEqual(getValues('ingredients'), incoming)) {
            setValue('ingredients', incoming, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        }
    }

    applyStepFields(STEPS.METHODS, ['method']);

    if (
        !isStepsLocallyEdited(step, getValues, prevDraft, lock) &&
        hasRemoteField('steps') &&
        Array.isArray(draftData.steps)
    ) {
        const incoming = draftData.steps;
        for (let idx = 0; idx < RECIPE_MAX_STEPS; idx++) {
            const value = incoming[idx] ?? '';
            if (getValues(`step-${idx}`) !== value) {
                setValue(`step-${idx}`, value, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                });
            }
        }
        if (!valuesEqual(getValues('steps'), incoming)) {
            setValue('steps', incoming, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        }
    }

    applyStepFields(STEPS.RELATED_CONTENT, [
        'coCooksIds',
        'linkedRecipeIds',
        'youtubeUrl',
        'questId',
    ]);
    applyStepFields(STEPS.IMAGES, [
        'imageSrc',
        'imageSrc1',
        'imageSrc2',
        'imageSrc3',
    ]);

    applyField('draftId');
    applyField('inviteToken');
}
