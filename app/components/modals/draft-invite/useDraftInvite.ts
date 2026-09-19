'use client';

import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import useDraftInviteModal from '@/app/hooks/useDraftInviteModal';
import { axiosFetcher } from '@/app/utils/fetcher';
import { SafeUser } from '@/app/types';
import { SharedDraft } from '@/app/types/draft';
import { useDraftInviteToken } from './useDraftInviteToken';
import { useDraftCollaborators } from './useDraftCollaborators';

export function useDraftInvite(currentUser?: SafeUser | null) {
    const { t } = useTranslation();
    const { isOpen, draftId, onClose } = useDraftInviteModal();

    const safeDraftId = draftId || '';

    const {
        data: draft,
        isLoading: isDraftLoading,
        mutate: mutateDraft,
    } = useSWR<SharedDraft>(
        isOpen && draftId
            ? `/api/draft?draftId=${encodeURIComponent(safeDraftId)}`
            : null,
        axiosFetcher,
        {
            revalidateOnFocus: true,
            revalidateOnMount: true,
        }
    );

    const isOwner = Boolean(
        currentUser?.id && draft?.ownerId && currentUser.id === draft.ownerId
    );

    const { inviteUrl, isRegenerating, handleRegenerate } = useDraftInviteToken(
        {
            isOpen,
            draftId,
            isOwner,
            draft,
            mutateDraft,
            t,
        }
    );

    const {
        usersMap,
        mutatingUserId,
        isAddingUser,
        handleRoleChange,
        handleRemoveCollaborator,
        handleAddCollaborator,
    } = useDraftCollaborators({
        isOpen,
        draftId,
        currentUser,
        draft,
        mutateDraft,
        onClose,
        t,
    });

    return {
        isOpen,
        draftId,
        onClose,
        draft,
        isDraftLoading,
        usersMap,
        isOwner,
        inviteUrl,
        isRegenerating,
        handleRegenerate,
        mutatingUserId,
        handleRoleChange,
        handleRemoveCollaborator,
        isAddingUser,
        handleAddCollaborator,
        t,
    };
}
