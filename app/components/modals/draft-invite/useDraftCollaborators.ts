'use client';

import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate, KeyedMutator } from 'swr';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import type { TFunction } from 'i18next';
import { SafeUser } from '@/app/types';
import { SharedDraft, CoCookRole } from '@/app/types/draft';
import { MAX_CO_COOKS } from '@/app/utils/constants';
import { axiosFetcher } from '@/app/utils/fetcher';

interface UseDraftCollaboratorsProps {
    isOpen: boolean;
    draftId: string | null;
    currentUser?: SafeUser | null;
    draft?: SharedDraft | null;
    mutateDraft: KeyedMutator<SharedDraft>;
    onClose: () => void;
    t: TFunction;
}

export function useDraftCollaborators({
    isOpen,
    draftId,
    currentUser,
    draft,
    mutateDraft,
    onClose,
    t,
}: UseDraftCollaboratorsProps) {
    const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);
    const [isAddingUser, setIsAddingUser] = useState(false);

    const allUserIds = useMemo(() => {
        if (!draft) return [];
        const idSet = new Set<string>();
        if (draft.ownerId) idSet.add(draft.ownerId);
        if (Array.isArray(draft.coCooksIds)) {
            draft.coCooksIds.forEach((id) => {
                if (id) idSet.add(id);
            });
        }
        return Array.from(idSet);
    }, [draft]);

    const { data: usersList } = useSWR<SafeUser[]>(
        isOpen && allUserIds.length > 0
            ? `/api/users/multiple?ids=${allUserIds.join(',')}`
            : null,
        axiosFetcher
    );

    const usersMap = useMemo(() => {
        const map = new Map<string, SafeUser>();
        if (Array.isArray(usersList)) {
            usersList.forEach((u) => {
                if (u?.id) map.set(u.id, u);
            });
        }
        return map;
    }, [usersList]);

    const handleRoleChange = useCallback(
        async (targetUserId: string, newRole: CoCookRole) => {
            if (!draftId) return;
            setMutatingUserId(targetUserId);
            await mutateDraft(
                (prev) =>
                    prev
                        ? {
                              ...prev,
                              coCookRoles: {
                                  ...prev.coCookRoles,
                                  [targetUserId]: newRole,
                              },
                          }
                        : prev,
                false
            );
            try {
                const res = await axios.patch('/api/draft/role', {
                    draftId,
                    targetUserId,
                    role: newRole,
                });
                if (res.data?.draft) {
                    await mutateDraft(res.data.draft, false);
                } else {
                    await mutateDraft();
                }
                mutate('/api/draft/active');
                mutate(`/api/draft?draftId=${encodeURIComponent(draftId)}`);
                toast.success(
                    t('role_updated', { defaultValue: 'Role updated' })
                );
            } catch {
                await mutateDraft();
                toast.error(
                    t('something_went_wrong', {
                        defaultValue: 'Failed to update role',
                    })
                );
            } finally {
                setMutatingUserId(null);
            }
        },
        [draftId, mutateDraft, t]
    );

    const handleRemoveCollaborator = useCallback(
        async (targetUserId: string) => {
            if (!draftId) return;
            const isSelf = targetUserId === currentUser?.id;
            setMutatingUserId(targetUserId);
            try {
                await axios.delete(
                    `/api/draft/collaborator?draftId=${encodeURIComponent(draftId)}&userId=${encodeURIComponent(targetUserId)}`
                );
                if (isSelf) {
                    toast.success(
                        t('left_draft', {
                            defaultValue: 'You have left the draft',
                        })
                    );
                    onClose();
                } else {
                    toast.success(
                        t('co_cook_removed', {
                            defaultValue: 'Co-cook removed',
                        })
                    );
                    await mutateDraft();
                }
                mutate('/api/draft/active');
                mutate(`/api/draft?draftId=${encodeURIComponent(draftId)}`);
            } catch {
                toast.error(
                    t('something_went_wrong', {
                        defaultValue: 'Failed to remove collaborator',
                    })
                );
            } finally {
                setMutatingUserId(null);
            }
        },
        [currentUser?.id, draftId, mutateDraft, onClose, t]
    );

    const handleAddCollaborator = useCallback(
        async (user: SafeUser) => {
            if (!draftId || isAddingUser) return;
            if ((draft?.coCooksIds?.length || 0) >= MAX_CO_COOKS) {
                toast.error(
                    t('max_cooks_reached', {
                        defaultValue: `Maximum of ${MAX_CO_COOKS} co-cooks allowed`,
                    })
                );
                return;
            }
            setIsAddingUser(true);
            try {
                const res = await axios.post('/api/draft/collaborator', {
                    draftId,
                    userId: user.id,
                    role: 'editor',
                });
                if (res.data?.draft) {
                    await mutateDraft(res.data.draft, false);
                } else {
                    await mutateDraft();
                }
                mutate('/api/draft/active');
                mutate(`/api/draft?draftId=${encodeURIComponent(draftId)}`);
                toast.success(
                    t('co_cook_added', { defaultValue: 'Co-cook added' })
                );
            } catch (err: any) {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    t('something_went_wrong', {
                        defaultValue: 'Failed to add co-cook',
                    });
                toast.error(msg);
            } finally {
                setIsAddingUser(false);
            }
        },
        [draft?.coCooksIds?.length, draftId, isAddingUser, mutateDraft, t]
    );

    return {
        usersMap,
        mutatingUserId,
        isAddingUser,
        handleRoleChange,
        handleRemoveCollaborator,
        handleAddCollaborator,
    };
}
