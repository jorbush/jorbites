'use client';

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { DraftData } from '@/app/types/draft';
import { STEPS, STEPS_LENGTH } from '@/app/utils/constants';

export interface UseDraftSwitchSyncProps {
    isEditMode?: boolean;
    draftData?: Partial<DraftData> | null;
    isInSessionCreatedDraft?: (draftId?: string | null) => boolean;
    setStep: Dispatch<SetStateAction<number>>;
    setNumIngredients: Dispatch<SetStateAction<number>>;
    setNumSteps: Dispatch<SetStateAction<number>>;
}

function applyDraftSwitchState(
    draftData: Partial<DraftData> | null | undefined,
    setStep: Dispatch<SetStateAction<number>>,
    setNumIngredients: Dispatch<SetStateAction<number>>,
    setNumSteps: Dispatch<SetStateAction<number>>
) {
    if (!draftData) {
        setStep(STEPS.CATEGORY);
        setNumIngredients(1);
        setNumSteps(1);
        return;
    }
    if (Array.isArray(draftData.ingredients)) {
        setNumIngredients(Math.max(1, draftData.ingredients.length));
    }
    if (Array.isArray(draftData.steps)) {
        setNumSteps(Math.max(1, draftData.steps.length));
    }
    if (draftData.currentStep !== undefined) {
        setStep(Math.max(0, Math.min(draftData.currentStep, STEPS_LENGTH - 1)));
    }
}

export function useDraftSwitchSync({
    isEditMode,
    draftData,
    isInSessionCreatedDraft,
    setStep,
    setNumIngredients,
    setNumSteps,
}: UseDraftSwitchSyncProps) {
    const [prevDraftId, setPrevDraftId] = useState<string | null>(
        () => draftData?.draftId || null
    );

    const currentDraftId = draftData?.draftId || null;
    if (isEditMode || currentDraftId === prevDraftId) {
        return;
    }

    const wasNullDraft = prevDraftId === null;
    setPrevDraftId(currentDraftId);
    if (
        draftData &&
        wasNullDraft &&
        isInSessionCreatedDraft?.(currentDraftId)
    ) {
        return;
    }

    applyDraftSwitchState(draftData, setStep, setNumIngredients, setNumSteps);
}
