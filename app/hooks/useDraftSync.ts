'use client';

import { useRef, useCallback } from 'react';
import useSWR from 'swr';
import {
    UseFormSetValue,
    UseFormGetValues,
    FieldValues,
} from 'react-hook-form';
import { axiosFetcher } from '@/app/utils/fetcher';
import { SafeUser } from '@/app/types';
import { SHARED_DRAFT_POLL_INTERVAL_MS } from '@/app/utils/constants';
import { syncRemoteDraftToForm, LockChecker } from '@/app/utils/draftSyncUtils';
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
    const draftEndpoint = activeDraftId
        ? `/api/draft?draftId=${encodeURIComponent(activeDraftId)}`
        : `/api/draft`;

    const isSharedDraft = Boolean(activeDraftId);

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
            refreshInterval: isSharedDraft ? SHARED_DRAFT_POLL_INTERVAL_MS : 0,
            shouldRetryOnError: false,
            keepPreviousData: true,
        }
    );

    const draftData =
        initialDraftData !== undefined ? initialDraftData : swrDraftData;
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
        [draftData, isEditMode]
    );

    return {
        draftData,
        isLoadingDraft,
        mutateDraft,
        syncFormFromDraft,
    };
}
