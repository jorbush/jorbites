'use client';

import { UseFormWatch, FieldValues } from 'react-hook-form';
import { SafeUser } from '@/app/types';
import { DraftData } from '@/app/types/draft';
import { useRecipeLock } from '@/app/hooks/useRecipeLock';
import { checkIsCollaborativeSession } from '@/app/utils/draftFormUtils';
import { RecipeModalStateLike } from './useRecipeFormState';

export interface UseRecipeFormLockProps {
    recipeModal: RecipeModalStateLike;
    draftData?: Partial<DraftData> | null;
    coCooksIds: string[];
    watch: UseFormWatch<FieldValues>;
    step: number;
    currentUser?: SafeUser | null;
}

export function useRecipeFormLock({
    recipeModal,
    draftData,
    coCooksIds,
    watch,
    step,
    currentUser,
}: UseRecipeFormLockProps) {
    const lockTargetId = recipeModal.isEditMode
        ? recipeModal.editRecipeData?.id
        : watch('draftId') || draftData?.draftId || recipeModal.activeDraftId;

    const hasDraftCoCooks = Boolean(
        (draftData?.coCooksIds && draftData.coCooksIds.length > 0) ||
        (draftData?.coCooks && draftData.coCooks.length > 0)
    );
    const hasInviteToken = Boolean(
        draftData?.inviteToken || watch('inviteToken')
    );
    const isCollaborativeSession = checkIsCollaborativeSession({
        isEditMode: recipeModal.isEditMode,
        draftType: draftData?.type,
        coCooksIds,
        hasDraftCoCooks,
        hasInviteToken,
    });

    const activeLockField =
        recipeModal.isOpen && isCollaborativeSession && lockTargetId
            ? `step:${step}`
            : null;

    const lock = useRecipeLock(
        isCollaborativeSession ? lockTargetId : null,
        currentUser?.id,
        activeLockField
    );
    const isCurrentStepLocked = Boolean(lock?.isLockedByOther(`step:${step}`));

    return {
        lock,
        isCurrentStepLocked,
        isCollaborativeSession,
        lockTargetId,
    };
}
