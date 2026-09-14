'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
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

export function useDraftSync({
    activeDraftId,
    isEditMode,
    currentUser,
    isOpen,
    initialDraftData,
    initialMutateDraft,
}: UseDraftSyncOptions): UseDraftSyncReturn {
    const { t } = useTranslation();
    const draftEndpoint = activeDraftId
        ? `/api/draft?draftId=${encodeURIComponent(activeDraftId)}`
        : `/api/draft`;

    const [isSharedDraft, setIsSharedDraft] = useState<boolean>(() =>
        Boolean(
            initialDraftData?.type === 'shared' ||
            initialDraftData?.inviteToken ||
            (Array.isArray(initialDraftData?.coCooksIds) &&
                initialDraftData.coCooksIds.length > 0)
        )
    );

    const refreshInterval = useCallback(
        (latestData: Partial<DraftData> | undefined) => {
            const effective =
                initialDraftData !== undefined
                    ? initialDraftData
                    : (latestData ??
                      (isSharedDraft ? { type: 'shared' } : undefined));
            const isShared =
                effective?.type === 'shared' ||
                Boolean(effective?.inviteToken) ||
                (Array.isArray(effective?.coCooksIds) &&
                    effective.coCooksIds.length > 0);
            return isShared ? SHARED_DRAFT_POLL_INTERVAL_MS : 0;
        },
        [initialDraftData, isSharedDraft]
    );

    const {
        data: swrDraftData,
        isLoading: isLoadingDraft,
        mutate: swrMutateDraft,
    } = useSWR(
        isOpen && !isEditMode && currentUser ? draftEndpoint : null,
        axiosFetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshWhenHidden: true,
            refreshInterval,
            shouldRetryOnError: false,
            keepPreviousData: true,
        }
    );

    useEffect(() => {
        const currentData =
            initialDraftData !== undefined ? initialDraftData : swrDraftData;
        if (currentData) {
            const isShared = Boolean(
                currentData?.type === 'shared' ||
                currentData?.inviteToken ||
                (Array.isArray(currentData?.coCooksIds) &&
                    currentData.coCooksIds.length > 0)
            );
            if (isShared !== isSharedDraft) {
                setIsSharedDraft(isShared);
            }
        }
    }, [initialDraftData, swrDraftData, isSharedDraft]);

    const rawDraftData =
        initialDraftData !== undefined ? initialDraftData : swrDraftData;

    const draftData =
        activeDraftId &&
        rawDraftData?.draftId &&
        rawDraftData.draftId !== activeDraftId
            ? null
            : rawDraftData;
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
            if (!draftData) {
                return;
            }

            const serialized = JSON.stringify(draftData);
            if (serialized === prevDraftStrRef.current) {
                return;
            }

            const prevDraft = prevDraftRef.current;
            prevDraftStrRef.current = serialized;
            prevDraftRef.current = draftData;

            if (!isEditMode) {
                // Check if a remote change on the active step conflicts with local edits (D-09)
                const conflict = detectStepConflict(
                    step,
                    draftData,
                    prevDraft,
                    getValues,
                    currentUser?.id,
                    lock
                );

                if (conflict.remoteChanged && typeof toast === 'function') {
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

                syncRemoteDraftToForm(
                    draftData,
                    prevDraft,
                    step,
                    lock,
                    getValues,
                    setValue
                );
            }
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
