import {
    STEPS,
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';
import { parseTextToList } from '@/app/utils/textParser';
import { DraftData, SaveDraftPayload } from '@/app/types/draft';

export interface FormAccessor {
    getValues: (field: string) => unknown;
    setValue: (field: string, value: unknown) => void;
}

export function extractIngredientsAndSteps(
    form: FormAccessor,
    _step: number,
    draftData: Partial<DraftData> | null | undefined,
    _effectiveNumIngredients: number,
    _effectiveNumSteps: number,
    ingredientsInputMode: string,
    stepsInputMode: string
): { newIngredients: string[]; newSteps: string[] } {
    let localIngredients: string[] = [];
    if (ingredientsInputMode === 'text') {
        const textareaValue = String(
            form.getValues('ingredients-plain-text') || ''
        );
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
    } else if (_step !== STEPS.INGREDIENTS) {
        const formIngredients = form.getValues('ingredients');
        if (Array.isArray(formIngredients) && formIngredients.length > 0) {
            newIngredients = formIngredients.filter(
                (item: unknown): item is string =>
                    typeof item === 'string' && item.trim() !== ''
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
        const textareaValue = String(form.getValues('steps-plain-text') || '');
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
    } else if (_step !== STEPS.STEPS) {
        const formSteps = form.getValues('steps');
        if (Array.isArray(formSteps) && formSteps.length > 0) {
            newSteps = formSteps.filter(
                (item: unknown): item is string =>
                    typeof item === 'string' && item.trim() !== ''
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
    draftData: Partial<DraftData> | null | undefined,
    effectiveNumIngredients: number,
    effectiveNumSteps: number,
    ingredientsInputMode: string,
    stepsInputMode: string,
    stepOverride?: number,
    _isFullPayload = false,
    isLocked = false
): {
    data: SaveDraftPayload;
    currentDraftId?: string;
    currentInviteToken?: string;
} {
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

    const formDraftId = form.getValues('draftId');
    const currentDraftId =
        typeof formDraftId === 'string' && formDraftId
            ? formDraftId
            : draftData?.draftId;

    const formInviteToken = form.getValues('inviteToken');
    const currentInviteToken =
        typeof formInviteToken === 'string' && formInviteToken
            ? formInviteToken
            : draftData?.inviteToken;

    // For shared (collaborative) drafts we only send the fields belonging to
    // the step the user is currently editing. Sending stale local values for
    // other steps would overwrite concurrent co-cook edits stored in Redis.
    // For solo drafts there is no collaborator risk and the server now merges
    // with the existing Redis record, so we always send the full payload.
    const isSharedDraft = Boolean(
        currentInviteToken ||
        draftData?.type === 'shared' ||
        (Array.isArray(draftData?.coCooksIds) &&
            draftData.coCooksIds.length > 0) ||
        (Array.isArray(draftData?.coCooks) && draftData.coCooks.length > 0)
    );

    const data: SaveDraftPayload = {
        draftId: currentDraftId,
        inviteToken: currentInviteToken,
        currentStep: stepToSave,
        updatedAt: new Date().toISOString(),
    };

    const addCategoryFields = () => {
        const categories = form.getValues('categories');
        data.categories = Array.isArray(categories) ? categories : [];
    };
    const addDescriptionFields = () => {
        const title = form.getValues('title');
        data.title = typeof title === 'string' ? title : undefined;
        const description = form.getValues('description');
        data.description =
            typeof description === 'string' ? description : undefined;
        const parseOptionalNumber = (
            val: unknown
        ): number | null | undefined => {
            if (val === null) return null;
            if (val === '' || val === undefined) return undefined;
            const parsed = typeof val === 'number' ? val : Number(val);
            return !Number.isNaN(parsed) ? parsed : undefined;
        };

        const minutes = parseOptionalNumber(form.getValues('minutes'));
        data.minutes = typeof minutes === 'number' ? minutes : undefined;
        data.prepTime = parseOptionalNumber(form.getValues('prepTime'));
        data.cookTime = parseOptionalNumber(form.getValues('cookTime'));
    };
    const addIngredientsFields = () => {
        data.ingredients = newIngredients;
    };
    const addMethodsFields = () => {
        const method = form.getValues('method');
        data.method = typeof method === 'string' ? method : '';
    };
    const addStepsFields = () => {
        data.steps = newSteps;
    };
    const addRelatedContentFields = () => {
        const coCooks = form.getValues('coCooksIds');
        data.coCooksIds = Array.isArray(coCooks) ? coCooks : [];
        const linked = form.getValues('linkedRecipeIds');
        data.linkedRecipeIds = Array.isArray(linked) ? linked : [];
        const youtubeUrl = form.getValues('youtubeUrl');
        data.youtubeUrl =
            typeof youtubeUrl === 'string' || youtubeUrl === null
                ? youtubeUrl
                : undefined;
        const questId = form.getValues('questId');
        data.questId =
            typeof questId === 'string' || questId === null
                ? questId
                : undefined;
    };
    const addImageFields = () => {
        const imageSrc = form.getValues('imageSrc');
        data.imageSrc = typeof imageSrc === 'string' ? imageSrc : undefined;
        const imageSrc1 = form.getValues('imageSrc1');
        data.imageSrc1 = typeof imageSrc1 === 'string' ? imageSrc1 : undefined;
        const imageSrc2 = form.getValues('imageSrc2');
        data.imageSrc2 = typeof imageSrc2 === 'string' ? imageSrc2 : undefined;
        const imageSrc3 = form.getValues('imageSrc3');
        data.imageSrc3 = typeof imageSrc3 === 'string' ? imageSrc3 : undefined;
    };

    if (!isSharedDraft || _isFullPayload) {
        addCategoryFields();
        addDescriptionFields();
        addIngredientsFields();
        addMethodsFields();
        addStepsFields();
        addRelatedContentFields();
        addImageFields();
    } else if (!isLocked) {
        const addFieldsForStep: Record<number, () => void> = {
            [STEPS.CATEGORY]: addCategoryFields,
            [STEPS.DESCRIPTION]: addDescriptionFields,
            [STEPS.INGREDIENTS]: addIngredientsFields,
            [STEPS.METHODS]: addMethodsFields,
            [STEPS.STEPS]: addStepsFields,
            [STEPS.RELATED_CONTENT]: addRelatedContentFields,
            [STEPS.IMAGES]: addImageFields,
        };
        addFieldsForStep[step]?.();
    }

    return {
        data,
        currentDraftId,
        currentInviteToken,
    };
}

export interface CheckIsCollaborativeSessionProps {
    isEditMode?: boolean;
    draftType?: string;
    coCooksIds?: string[];
    hasDraftCoCooks?: boolean;
    hasInviteToken?: boolean;
}

export function checkIsCollaborativeSession({
    isEditMode,
    draftType,
    coCooksIds,
    hasDraftCoCooks,
    hasInviteToken,
}: CheckIsCollaborativeSessionProps): boolean {
    if (isEditMode) return true;
    if (draftType === 'shared') return true;
    if (hasDraftCoCooks) return true;
    if (Array.isArray(coCooksIds) && coCooksIds.length > 0) return true;
    if (hasInviteToken) return true;
    return false;
}
