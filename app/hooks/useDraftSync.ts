'use client';

import { useRef, useCallback, useState } from 'react';
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
    UseFormSetValue,
    UseFormGetValues,
    FieldValues,
} from 'react-hook-form';
import { axiosFetcher } from '@/app/utils/fetcher';
import { SafeUser } from '@/app/types';
import { SHARED_DRAFT_POLL_INTERVAL_MS } from '@/app/utils/constants';
import {
    syncRemoteDraftToForm,
    detectStepConflict,
    LockChecker,
} from '@/app/utils/draftSyncUtils';
import { DraftData } from '@/app/types/draft';

interface UseDraftSyncOptions {
    activeDraftId: string | null | undefined;
    isEditMode: boolean;
    skipDefaultDraftFetch?: boolean;
    currentUser?: SafeUser | null;
    isOpen: boolean;
    initialDraftData?: Partial<DraftData> | null;
    initialMutateDraft?: () => Promise<unknown>;
}

interface UseDraftSyncReturn {
    draftData: Partial<DraftData> | null | undefined;
    isLoadingDraft: boolean;
    mutateDraft: () => Promise<unknown>;
    /** Call during render to sync remote draft changes into form state */
    syncFormFromDraft: (
        setValue: UseFormSetValue<FieldValues>,
        getValues: UseFormGetValues<FieldValues>,
        step: number,
        lock: LockChecker | null | undefined,
        _stepChanged?: boolean
    ) => void;
}

function isDraftShared(draft: Partial<DraftData> | null | undefined): boolean {
    if (!draft) return false;
    const hasCoCooks =
        Array.isArray(draft.coCooksIds) && draft.coCooksIds.length > 0;
    return draft.type === 'shared' || Boolean(draft.inviteToken) || hasCoCooks;
}

function buildDraftEndpoint(activeDraftId: string | null | undefined): string {
    return activeDraftId
        ? `/api/draft?draftId=${encodeURIComponent(activeDraftId)}`
        : `/api/draft`;
}

function resolveVisibleDraftData(
    activeDraftId: string | null | undefined,
    rawDraftData: Partial<DraftData> | null | undefined
): Partial<DraftData> | null | undefined {
    const isStaleDraft =
        Boolean(activeDraftId) &&
        Boolean(rawDraftData?.draftId) &&
        rawDraftData?.draftId !== activeDraftId;
    return isStaleDraft ? null : rawDraftData;
}

function notifyStepConflictIfNeeded(
    step: number,
    draftData: Partial<DraftData>,
    prevDraft: Partial<DraftData> | null,
    getValues: UseFormGetValues<FieldValues>,
    userId: string | undefined,
    lock: LockChecker | null | undefined,
    t: TFunction
) {
    const conflict = detectStepConflict(
        step,
        draftData,
        prevDraft,
        getValues,
        userId,
        lock
    );
    if (!conflict.remoteChanged || typeof toast !== 'function') {
        return;
    }
    const author = conflict.authorName || 'A co-cook';
    const stepLabel = conflict.stepKey.replace('_', ' ');
    const toastMessage =
        t('step_conflict_toast', {
            stepNumber: step + 1,
        }) || `${author} updated ${stepLabel}`;

    toast(toastMessage, {
        icon: '👨‍🍳',
        id: `step-sync-${step}`,
        duration: 3000,
    });
}

export function useDraftSync({
    activeDraftId,
    isEditMode,
    skipDefaultDraftFetch = false,
    currentUser,
    isOpen,
    initialDraftData,
    initialMutateDraft,
}: UseDraftSyncOptions): UseDraftSyncReturn {
    const { t } = useTranslation();
    const draftEndpoint = buildDraftEndpoint(activeDraftId);

    const [isSharedDraft, setIsSharedDraft] = useState<boolean>(() =>
        isDraftShared(initialDraftData)
    );

    const refreshInterval = useCallback(
        (latestData: Partial<DraftData> | undefined) => {
            const fallback: Partial<DraftData> | undefined = isSharedDraft
                ? { type: 'shared' }
                : undefined;
            const effective =
                initialDraftData !== undefined
                    ? initialDraftData
                    : (latestData ?? fallback);
            return isDraftShared(effective) ? SHARED_DRAFT_POLL_INTERVAL_MS : 0;
        },
        [initialDraftData, isSharedDraft]
    );

    const isDraftFetchAllowed =
        !skipDefaultDraftFetch || Boolean(activeDraftId);
    const shouldFetchDraft =
        Boolean(isOpen && !isEditMode && currentUser) && isDraftFetchAllowed;

    const {
        data: swrDraftData,
        isLoading: isLoadingDraft,
        mutate: swrMutateDraft,
    } = useSWR(shouldFetchDraft ? draftEndpoint : null, axiosFetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshWhenHidden: true,
        refreshInterval,
        shouldRetryOnError: false,
        keepPreviousData: true,
    });

    const rawDraftData =
        initialDraftData !== undefined ? initialDraftData : swrDraftData;

    const isCurrentShared = isDraftShared(rawDraftData);
    if (rawDraftData && isCurrentShared !== isSharedDraft) {
        setIsSharedDraft(isCurrentShared);
    }

    const draftData = resolveVisibleDraftData(activeDraftId, rawDraftData);
    const mutateDraft =
        initialMutateDraft !== undefined ? initialMutateDraft : swrMutateDraft;

    const prevDraftRef = useRef<Partial<DraftData> | null>(null);
    const prevDraftStrRef = useRef<string>('');

    const syncFormFromDraft = useCallback(
        (
            setValue: UseFormSetValue<FieldValues>,
            getValues: UseFormGetValues<FieldValues>,
            step: number,
            lock: LockChecker | null | undefined
        ) => {
            if (!draftData || isEditMode) {
                return;
            }

            const serialized = JSON.stringify(draftData);
            if (serialized === prevDraftStrRef.current) {
                return;
            }

            const prevDraft = prevDraftRef.current;
            prevDraftStrRef.current = serialized;
            prevDraftRef.current = draftData;

            notifyStepConflictIfNeeded(
                step,
                draftData,
                prevDraft,
                getValues,
                currentUser?.id,
                lock,
                t
            );

            syncRemoteDraftToForm(
                draftData,
                prevDraft,
                step,
                lock,
                getValues,
                setValue
            );
        },
        [currentUser?.id, draftData, isEditMode, t]
    );

    return {
        draftData,
        isLoadingDraft,
        mutateDraft,
        syncFormFromDraft,
    };
}
