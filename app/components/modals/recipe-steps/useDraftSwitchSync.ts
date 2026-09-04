'use client';

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { DraftData } from '@/app/types/draft';
import { STEPS, STEPS_LENGTH } from '@/app/utils/constants';

export interface UseDraftSwitchSyncProps {
    isEditMode?: boolean;
    draftData?: Partial<DraftData> | null;
    setStep: Dispatch<SetStateAction<number>>;
    setNumIngredients: Dispatch<SetStateAction<number>>;
    setNumSteps: Dispatch<SetStateAction<number>>;
}

export function useDraftSwitchSync({
    isEditMode,
    draftData,
    setStep,
    setNumIngredients,
    setNumSteps,
}: UseDraftSwitchSyncProps) {
    const [prevDraftId, setPrevDraftId] = useState<string | null>(
        () => draftData?.draftId || null
    );

    const currentDraftId = draftData?.draftId || null;
    if (!isEditMode && currentDraftId !== prevDraftId) {
        setPrevDraftId(currentDraftId);
        if (draftData) {
            if (Array.isArray(draftData.ingredients)) {
                setNumIngredients(Math.max(1, draftData.ingredients.length));
            }
            if (Array.isArray(draftData.steps)) {
                setNumSteps(Math.max(1, draftData.steps.length));
            }
            if (draftData.currentStep !== undefined) {
                setStep(
                    Math.max(
                        0,
                        Math.min(draftData.currentStep, STEPS_LENGTH - 1)
                    )
                );
            }
        } else {
            setStep(STEPS.CATEGORY);
            setNumIngredients(1);
            setNumSteps(1);
        }
    }
}
