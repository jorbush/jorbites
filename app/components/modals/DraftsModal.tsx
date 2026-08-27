'use client';

import React, { useCallback, useState } from 'react';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiFileText } from 'react-icons/fi';
import Modal from '@/app/components/modals/Modal';
import useDraftsModal from '@/app/hooks/useDraftsModal';
import useRecipeModal from '@/app/hooks/useRecipeModal';
import { useDraftActions } from '@/app/hooks/useDraftActions';
import { axiosFetcher } from '@/app/utils/fetcher';
import { SafeUser } from '@/app/types';
import { DraftSummary } from '@/app/types/draft';
import DraftCard from '@/app/components/drafts/DraftCard';
import Loader from '@/app/components/shared/Loader';

interface DraftsModalProps {
    currentUser?: SafeUser | null;
}

const DraftsModal: React.FC<DraftsModalProps> = ({ currentUser }) => {
    const { t } = useTranslation();
    const draftsModal = useDraftsModal();
    const recipeModal = useRecipeModal();
    const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);

    const {
        data: drafts,
        isLoading,
        mutate,
    } = useSWR<DraftSummary[]>(
        draftsModal.isOpen && currentUser ? '/api/draft/active' : null,
        axiosFetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            revalidateOnMount: true,
            dedupingInterval: 0,
        }
    );

    const {
        createDraft,
        deleteDraft,
        duplicateDraft,
        shareDraft,
        isLoading: isActionLoading,
    } = useDraftActions({
        currentUser,
        onDraftMutate: mutate,
    });

    const handleShareDraft = useCallback(
        async (draftId: string) => {
            await shareDraft(draftId);
        },
        [shareDraft]
    );

    const handleOpenDraft = useCallback(
        (draftId: string) => {
            draftsModal.onClose();
            recipeModal.onOpenSharedDraft(draftId);
        },
        [draftsModal, recipeModal]
    );

    const handleCreateNewDraft = useCallback(async () => {
        const newDraftId = await createDraft('solo');
        if (newDraftId) {
            draftsModal.onClose();
            recipeModal.onOpenSharedDraft(newDraftId);
        }
    }, [createDraft, draftsModal, recipeModal]);

    const handleDeleteClick = useCallback((draftId: string) => {
        setDeletingDraftId(draftId);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!deletingDraftId) return;
        const success = await deleteDraft(deletingDraftId);
        if (success) {
            setDeletingDraftId(null);
        }
    }, [deletingDraftId, deleteDraft]);

    const handleCancelDelete = useCallback(() => {
        setDeletingDraftId(null);
    }, []);

    const handleDuplicateDraft = useCallback(
        async (draftId: string) => {
            await duplicateDraft(draftId);
        },
        [duplicateDraft]
    );

    const bodyContent = (
        <div
            data-testid="drafts-modal"
            className="flex flex-col gap-4"
        >
            {deletingDraftId && (
                <div
                    data-testid="draft-delete-confirmation"
                    className="flex flex-col items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-center sm:flex-row sm:text-left dark:border-red-900/50 dark:bg-red-950/30"
                >
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        {t('delete_draft_confirm', {
                            defaultValue: 'Delete this draft?',
                        })}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            data-testid="draft-delete-cancel-btn"
                            onClick={handleCancelDelete}
                            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                            {t('cancel', { defaultValue: 'Cancel' })}
                        </button>
                        <button
                            type="button"
                            data-testid="draft-delete-confirm-btn"
                            onClick={handleConfirmDelete}
                            disabled={isActionLoading}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                            {t('delete_draft', { defaultValue: 'Delete' })}
                        </button>
                    </div>
                </div>
            )}

            {isLoading && (!drafts || drafts.length === 0) ? (
                <div className="flex h-48 items-center justify-center">
                    <Loader height="100px" />
                </div>
            ) : !drafts || drafts.length === 0 ? (
                <div
                    data-testid="drafts-modal-empty-state"
                    className="flex flex-col items-center justify-center py-12 text-center"
                >
                    <div className="flex size-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <FiFileText className="text-3xl text-neutral-400 dark:text-neutral-500" />
                    </div>
                    <h4 className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {t('no_drafts_yet', {
                            defaultValue: 'No drafts yet',
                        })}
                    </h4>
                    <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                        {t('start_first_recipe', {
                            defaultValue: 'Start your first recipe!',
                        })}
                    </p>
                    <button
                        type="button"
                        data-testid="drafts-modal-empty-create-btn"
                        onClick={handleCreateNewDraft}
                        disabled={isActionLoading}
                        className="bg-green-450 mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                        <FiPlus size={18} />
                        <span>
                            {t('new_draft', { defaultValue: 'New draft' })}
                        </span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {drafts.map((draft) => (
                        <DraftCard
                            key={draft.draftId}
                            draft={draft}
                            onOpen={handleOpenDraft}
                            onDelete={handleDeleteClick}
                            onDuplicate={handleDuplicateDraft}
                            onShare={handleShareDraft}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={draftsModal.isOpen}
            onClose={draftsModal.onClose}
            onSubmit={handleCreateNewDraft}
            actionLabel={(t('new_draft') ?? 'New draft') as string}
            title={(t('my_drafts') ?? 'My Drafts') as string}
            body={bodyContent}
            isLoading={isActionLoading}
            disabled={isActionLoading}
        />
    );
};

export default DraftsModal;
