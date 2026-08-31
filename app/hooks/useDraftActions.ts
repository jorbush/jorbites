'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';

interface UseDraftActionsProps {
    currentUser?: SafeUser | null;
    onDraftMutate?: () => void | Promise<unknown>;
}

export function useDraftActions({
    currentUser,
    onDraftMutate,
}: UseDraftActionsProps = {}) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const createDraft = useCallback(
        async (type: 'solo' | 'shared' = 'solo'): Promise<string | null> => {
            if (!currentUser) {
                return null;
            }

            setIsLoading(true);
            try {
                if (type === 'shared') {
                    const response = await axios.post('/api/draft/invite', {
                        title: '',
                        categories: [],
                        ingredients: [],
                        steps: [],
                        currentStep: 0,
                    });
                    const draftId = response.data?.draftId;
                    mutate('/api/draft/active');
                    if (onDraftMutate) {
                        await onDraftMutate();
                    }
                    return draftId;
                } else {
                    const response = await axios.post('/api/draft', {
                        title: '',
                        categories: [],
                        ingredients: [],
                        steps: [],
                        currentStep: 0,
                    });
                    const draftId = response.data?.draftId;
                    mutate('/api/draft/active');
                    if (onDraftMutate) {
                        await onDraftMutate();
                    }
                    return draftId;
                }
            } catch (error: unknown) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 409
                ) {
                    toast.error(
                        t('max_drafts_reached', {
                            defaultValue: 'Maximum drafts reached',
                        })
                    );
                } else {
                    toast.error(
                        t('error_saving_draft', {
                            defaultValue: 'Failed to save draft.',
                        })
                    );
                }
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [currentUser, onDraftMutate, t]
    );

    const deleteDraft = useCallback(
        async (draftId: string): Promise<boolean> => {
            if (!currentUser) return false;

            setIsLoading(true);
            try {
                await axios.delete(
                    `/api/draft?draftId=${encodeURIComponent(draftId)}`
                );
                toast.success(
                    t('draft_deleted', { defaultValue: 'Draft deleted' })
                );
                mutate('/api/draft/active');
                mutate('/api/draft');
                mutate(`/api/draft?draftId=${encodeURIComponent(draftId)}`);
                if (onDraftMutate) {
                    await onDraftMutate();
                }
                return true;
            } catch (error) {
                console.error('Failed to delete draft', error);
                toast.error(
                    t('error_deleting_draft', {
                        defaultValue: 'Failed to delete draft.',
                    })
                );
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [currentUser, onDraftMutate, t]
    );

    const duplicateDraft = useCallback(
        async (draftId: string): Promise<string | null> => {
            if (!currentUser) return null;

            setIsLoading(true);
            try {
                // Fetch the existing draft data
                const response = await axios.get(
                    `/api/draft?draftId=${encodeURIComponent(draftId)}`
                );
                const existingDraft = response.data;
                if (!existingDraft) {
                    throw new Error('Draft not found');
                }

                // Prepare clone payload without old IDs or invite tokens
                const {
                    draftId: _oldId,
                    inviteToken: _oldToken,
                    id: _ignoreId,
                    _id: _ignoreMongoId,
                    createdAt: _ignoreCreatedAt,
                    updatedAt: _ignoreUpdatedAt,
                    ...draftContent
                } = existingDraft;

                const duplicateTitle = draftContent.title
                    ? `${draftContent.title} (Copy)`
                    : '';

                const payload = {
                    ...draftContent,
                    title: duplicateTitle,
                };

                const isShared =
                    existingDraft.type === 'shared' ||
                    Boolean(existingDraft.inviteToken);

                let newDraftId: string | null = null;
                if (isShared) {
                    const saveRes = await axios.post(
                        '/api/draft/invite',
                        payload
                    );
                    newDraftId = saveRes.data?.draftId;
                } else {
                    const saveRes = await axios.post('/api/draft', payload);
                    newDraftId = saveRes.data?.draftId;
                }

                toast.success(
                    t('draft_duplicated', { defaultValue: 'Draft duplicated' })
                );
                mutate('/api/draft/active');
                if (onDraftMutate) {
                    await onDraftMutate();
                }
                return newDraftId;
            } catch (error: unknown) {
                console.error('Failed to duplicate draft', error);
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 409
                ) {
                    toast.error(
                        t('max_drafts_reached', {
                            defaultValue: 'Maximum drafts reached',
                        })
                    );
                } else {
                    toast.error(
                        t('error_saving_draft', {
                            defaultValue: 'Failed to save draft.',
                        })
                    );
                }
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [currentUser, onDraftMutate, t]
    );

    const shareDraft = useCallback(
        async (draftId: string): Promise<string | null> => {
            if (!currentUser) return null;

            setIsLoading(true);
            try {
                const res = await axios.get(
                    `/api/draft?draftId=${encodeURIComponent(draftId)}`
                );
                const draft = res.data;
                if (!draft) throw new Error('Draft not found');

                let targetDraftId = draft.draftId;
                let token = draft.inviteToken;

                if (!token) {
                    const inviteRes = await axios.post('/api/draft/invite', {
                        ...draft,
                        draftId: draft.draftId,
                    });
                    token = inviteRes.data?.inviteToken;
                    targetDraftId = inviteRes.data?.draftId || targetDraftId;
                }

                const shareUrl = `${window.location.origin}/api/draft/join?draft=${targetDraftId}&token=${token}`;

                if (navigator?.clipboard) {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success(
                        t('co_cook_link_copied', {
                            defaultValue:
                                'Co-cook invite link copied to clipboard! 🔗',
                        })
                    );
                }

                mutate('/api/draft/active');
                if (onDraftMutate) {
                    await onDraftMutate();
                }

                return shareUrl;
            } catch (error) {
                console.error('Failed to share draft', error);
                toast.error(
                    t('error_copying_link', {
                        defaultValue: 'Failed to copy invite link',
                    })
                );
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [currentUser, onDraftMutate, t]
    );

    return {
        createDraft,
        deleteDraft,
        duplicateDraft,
        shareDraft,
        isLoading,
    };
}

export default useDraftActions;
