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
    if (Object.is(current, incoming)) {
        return true;
    }
    if (Array.isArray(current) && Array.isArray(incoming)) {
        if (current.length !== incoming.length) {
            return false;
        }
        for (let i = 0; i < current.length; i++) {
            if (!valuesEqual(current[i], incoming[i])) {
                return false;
            }
        }
        return true;
    }
    if (Array.isArray(current) || Array.isArray(incoming)) {
        return false;
    }
    return false;
}

/**
 * Checks if a specific form field has been modified locally by the user
 * compared to the previously synced draft snapshot.
 */
export function isFieldLocallyEdited(
    currentVal: unknown,
    prevValue: unknown
): boolean {
    const isCurrentEmpty =
        currentVal === undefined ||
        currentVal === null ||
        currentVal === '' ||
        (Array.isArray(currentVal) && currentVal.length === 0);
    const isPrevEmpty =
        prevValue === undefined ||
        prevValue === null ||
        prevValue === '' ||
        (Array.isArray(prevValue) && prevValue.length === 0);

    // If both values are empty, it is not a local edit
    if (isCurrentEmpty && isPrevEmpty) {
        return false;
    }
    // If one is empty and the other is not, or both have non-empty distinct content, it is a local edit (H4)
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
    if (!prevDraft) return true;
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
    if (!prevDraft) return false;
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
    if (!prevDraft) return false;
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
    if (!draftData) {
        return;
    }
    const remoteRecord = draftData as Record<string, unknown>;
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
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: true,
            });
        }
    };

    const isDraftSwitch = Boolean(
        prevDraft?.draftId &&
        draftData?.draftId &&
        prevDraft.draftId !== draftData.draftId
    );

    const applyStepFields = (stepIndex: number, fields: string[]) => {
        if (
            !isDraftSwitch &&
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
        (isDraftSwitch ||
            !isIngredientsLocallyEdited(step, getValues, prevDraft, lock)) &&
        hasRemoteField('ingredients') &&
        Array.isArray(draftData.ingredients)
    ) {
        const incoming = draftData.ingredients;
        for (let idx = 0; idx < RECIPE_MAX_INGREDIENTS; idx++) {
            const value = incoming[idx] ?? '';
            if (getValues(`ingredient-${idx}`) !== value) {
                setValue(`ingredient-${idx}`, value, {
                    shouldDirty: false,
                    shouldTouch: false,
                    shouldValidate: true,
                });
            }
        }
        if (!valuesEqual(getValues('ingredients'), incoming)) {
            setValue('ingredients', incoming, {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: true,
            });
        }
    }

    applyStepFields(STEPS.METHODS, ['method']);

    if (
        (isDraftSwitch ||
            !isStepsLocallyEdited(step, getValues, prevDraft, lock)) &&
        hasRemoteField('steps') &&
        Array.isArray(draftData.steps)
    ) {
        const incoming = draftData.steps;
        for (let idx = 0; idx < RECIPE_MAX_STEPS; idx++) {
            const value = incoming[idx] ?? '';
            if (getValues(`step-${idx}`) !== value) {
                setValue(`step-${idx}`, value, {
                    shouldDirty: false,
                    shouldTouch: false,
                    shouldValidate: true,
                });
            }
        }
        if (!valuesEqual(getValues('steps'), incoming)) {
            setValue('steps', incoming, {
                shouldDirty: false,
                shouldTouch: false,
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

export interface StepConflictInfo {
    hasConflict: boolean;
    stepIndex: number;
    stepKey: string;
    authorName?: string;
}

/**
 * Detects if remote incoming draft data modified fields on the user's active step
 * while the user has local uncommitted modifications (D-09).
 */
export function detectStepConflict(
    stepIndex: number,
    draftData: Partial<DraftData> | null | undefined,
    prevDraft: Partial<DraftData> | null | undefined,
    getValues: (field: string) => unknown,
    currentUserId?: string,
    lock?: LockChecker | null
): StepConflictInfo {
    if (
        !draftData ||
        !prevDraft ||
        !draftData.draftId ||
        draftData.draftId !== prevDraft.draftId
    ) {
        return { hasConflict: false, stepIndex, stepKey: '' };
    }

    // If change was made by the current user, no conflict toast needed
    if (
        draftData.lastModifiedBy?.id &&
        currentUserId &&
        draftData.lastModifiedBy.id === currentUserId
    ) {
        return { hasConflict: false, stepIndex, stepKey: '' };
    }

    const stepFieldsMap: Record<number, { key: string; fields: string[] }> = {
        [STEPS.CATEGORY]: { key: 'categories', fields: ['categories'] },
        [STEPS.DESCRIPTION]: {
            key: 'description',
            fields: ['title', 'description', 'minutes', 'prepTime', 'cookTime'],
        },
        [STEPS.INGREDIENTS]: { key: 'ingredients', fields: ['ingredients'] },
        [STEPS.METHODS]: { key: 'method', fields: ['method'] },
        [STEPS.STEPS]: { key: 'steps', fields: ['steps'] },
        [STEPS.RELATED_CONTENT]: {
            key: 'related_content',
            fields: ['coCooksIds', 'linkedRecipeIds', 'youtubeUrl', 'questId'],
        },
        [STEPS.IMAGES]: {
            key: 'images',
            fields: ['imageSrc', 'imageSrc1', 'imageSrc2', 'imageSrc3'],
        },
    };

    const stepMeta = stepFieldsMap[stepIndex];
    if (!stepMeta) return { hasConflict: false, stepIndex, stepKey: '' };

    // Did remote fields change on this step?
    let remoteChanged = false;
    if (stepIndex === STEPS.INGREDIENTS) {
        remoteChanged = !valuesEqual(
            prevDraft.ingredients,
            draftData.ingredients
        );
    } else if (stepIndex === STEPS.STEPS) {
        remoteChanged = !valuesEqual(prevDraft.steps, draftData.steps);
    } else {
        const prevRec = prevDraft as Record<string, unknown>;
        const currRec = draftData as Record<string, unknown>;
        remoteChanged = stepMeta.fields.some(
            (f) => !valuesEqual(prevRec?.[f], currRec?.[f])
        );
    }

    if (!remoteChanged) {
        return { hasConflict: false, stepIndex, stepKey: '' };
    }

    // Did local user edit this step?
    let locallyEdited = false;
    if (stepIndex === STEPS.INGREDIENTS) {
        locallyEdited = isIngredientsLocallyEdited(
            stepIndex,
            getValues,
            prevDraft,
            lock
        );
    } else if (stepIndex === STEPS.STEPS) {
        locallyEdited = isStepsLocallyEdited(
            stepIndex,
            getValues,
            prevDraft,
            lock
        );
    } else {
        locallyEdited = !shouldApplyStep(
            stepIndex,
            stepIndex,
            stepMeta.fields,
            getValues,
            prevDraft,
            lock
        );
    }

    if (!locallyEdited) {
        return { hasConflict: false, stepIndex, stepKey: '' };
    }

    return {
        hasConflict: true,
        stepIndex,
        stepKey: stepMeta.key,
        authorName:
            draftData.lastModifiedBy?.name ||
            draftData.ownerName ||
            'A co-cook',
    };
}

/**
 * Explicitly force-applies incoming remote fields for a step onto the form,
 * used when resolving a conflict notification (D-09).
 */
export function forceApplyStepFields(
    stepIndex: number,
    draftData: Partial<DraftData> | null | undefined,
    setValue: (field: string, value: unknown, options?: SetValueOptions) => void
): void {
    if (!draftData) return;
    const remote = draftData as Record<string, unknown>;
    const setOptions: SetValueOptions = {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
    };

    switch (stepIndex) {
        case STEPS.CATEGORY:
            if (remote.categories !== undefined) {
                setValue('categories', remote.categories, setOptions);
            }
            break;
        case STEPS.DESCRIPTION:
            ['title', 'description', 'minutes', 'prepTime', 'cookTime'].forEach(
                (f) => {
                    if (remote[f] !== undefined)
                        setValue(f, remote[f], setOptions);
                }
            );
            break;
        case STEPS.INGREDIENTS:
            if (Array.isArray(draftData.ingredients)) {
                for (let idx = 0; idx < RECIPE_MAX_INGREDIENTS; idx++) {
                    setValue(
                        `ingredient-${idx}`,
                        draftData.ingredients[idx] ?? '',
                        setOptions
                    );
                }
                setValue('ingredients', draftData.ingredients, setOptions);
            }
            break;
        case STEPS.METHODS:
            if (remote.method !== undefined) {
                setValue('method', remote.method, setOptions);
            }
            break;
        case STEPS.STEPS:
            if (Array.isArray(draftData.steps)) {
                for (let idx = 0; idx < RECIPE_MAX_STEPS; idx++) {
                    setValue(
                        `step-${idx}`,
                        draftData.steps[idx] ?? '',
                        setOptions
                    );
                }
                setValue('steps', draftData.steps, setOptions);
            }
            break;
        case STEPS.RELATED_CONTENT:
            ['coCooksIds', 'linkedRecipeIds', 'youtubeUrl', 'questId'].forEach(
                (f) => {
                    if (remote[f] !== undefined)
                        setValue(f, remote[f], setOptions);
                }
            );
            break;
        case STEPS.IMAGES:
            ['imageSrc', 'imageSrc1', 'imageSrc2', 'imageSrc3'].forEach((f) => {
                if (remote[f] !== undefined) setValue(f, remote[f], setOptions);
            });
            break;
    }
}
