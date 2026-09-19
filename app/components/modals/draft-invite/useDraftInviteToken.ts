'use client';

import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate, KeyedMutator } from 'swr';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import type { TFunction } from 'i18next';
import { SharedDraft } from '@/app/types/draft';

interface UseDraftInviteTokenProps {
    isOpen: boolean;
    draftId: string | null;
    isOwner: boolean;
    draft?: SharedDraft | null;
    mutateDraft: KeyedMutator<SharedDraft>;
    t: TFunction;
}

export function useDraftInviteToken({
    isOpen,
    draftId,
    isOwner,
    draft,
    mutateDraft,
    t,
}: UseDraftInviteTokenProps) {
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [regeneratedState, setRegeneratedState] = useState<{
        draftId: string;
        token: string;
    } | null>(null);

    const regeneratedToken =
        isOpen && draftId && regeneratedState?.draftId === draftId
            ? regeneratedState.token
            : null;

    const shouldFetchInitialToken = Boolean(
        isOpen &&
        draftId &&
        isOwner &&
        draft &&
        !regeneratedToken &&
        !draft.inviteToken
    );

    const safeDraftId = draftId || '';

    const { data: initialTokenData } = useSWR(
        shouldFetchInitialToken
            ? `/api/draft/invite?draftId=${encodeURIComponent(safeDraftId)}`
            : null,
        async () => {
            if (!safeDraftId) return null;
            const res = await axios.post('/api/draft/invite', {
                draftId: safeDraftId,
                regenerate: false,
            });
            if (res.data?.draft) {
                await mutateDraft(res.data.draft, false);
            } else {
                await mutateDraft();
            }
            mutate('/api/draft/active');
            mutate(`/api/draft?draftId=${encodeURIComponent(safeDraftId)}`);
            return res.data;
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const effectiveToken =
        regeneratedToken || draft?.inviteToken || initialTokenData?.inviteToken;

    const inviteUrl = useMemo(() => {
        if (!effectiveToken || !draftId) return '';
        const origin =
            typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/api/draft/join?draft=${draftId}&token=${effectiveToken}`;
    }, [effectiveToken, draftId]);

    const handleRegenerate = useCallback(async () => {
        if (!draftId) return;
        setIsRegenerating(true);
        try {
            const res = await axios.post('/api/draft/invite', {
                draftId,
                regenerate: true,
            });
            if (res.data?.inviteToken) {
                setRegeneratedState({ draftId, token: res.data.inviteToken });
            }
            if (res.data?.draft) {
                await mutateDraft(res.data.draft, false);
            } else {
                await mutateDraft();
            }
            mutate('/api/draft/active');
            mutate(`/api/draft?draftId=${encodeURIComponent(draftId)}`);
            toast.success(
                t('invite_link_regenerated', {
                    defaultValue: 'Invite link regenerated!',
                })
            );
        } catch {
            toast.error(
                t('something_went_wrong', {
                    defaultValue: 'Something went wrong',
                })
            );
        } finally {
            setIsRegenerating(false);
        }
    }, [draftId, mutateDraft, t]);

    return {
        effectiveToken,
        inviteUrl,
        isRegenerating,
        handleRegenerate,
    };
}
