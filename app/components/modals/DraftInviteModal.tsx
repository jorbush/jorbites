'use client';

import React, { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Modal from '@/app/components/modals/Modal';
import Loader from '@/app/components/shared/Loader';
import useDraftInviteModal from '@/app/hooks/useDraftInviteModal';
import { axiosFetcher } from '@/app/utils/fetcher';
import { SafeUser } from '@/app/types';
import { SharedDraft, CoCookRole } from '@/app/types/draft';
import { MAX_CO_COOKS } from '@/app/utils/constants';
import DraftInviteLinkSection from './draft-invite/DraftInviteLinkSection';
import DraftDirectSearchSection from './draft-invite/DraftDirectSearchSection';
import DraftCollaboratorsList from './draft-invite/DraftCollaboratorsList';

interface DraftInviteModalProps {
    currentUser?: SafeUser | null;
}

const DraftInviteModal: React.FC<DraftInviteModalProps> = ({ currentUser }) => {
    const { t } = useTranslation();
    const { isOpen, draftId, onClose } = useDraftInviteModal();

    const [copied, setCopied] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
    const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [regeneratedToken, setRegeneratedToken] = useState<string | null>(
        null
    );

    React.useEffect(() => {
        setRegeneratedToken(null);
    }, [draftId, isOpen]);

    const {
        data: draft,
        isLoading: isDraftLoading,
        mutate: mutateDraft,
    } = useSWR<SharedDraft>(
        isOpen && draftId
            ? `/api/draft?draftId=${encodeURIComponent(draftId)}`
            : null,
        axiosFetcher,
        {
            revalidateOnFocus: true,
            revalidateOnMount: true,
        }
    );

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

    const isOwner = Boolean(
        currentUser?.id && draft?.ownerId && currentUser.id === draft.ownerId
    );

    const effectiveToken = regeneratedToken || draft?.inviteToken;

    const inviteUrl = useMemo(() => {
        if (!effectiveToken || !draftId) return '';
        const origin =
            typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/recipes/new?draft=${draftId}&token=${effectiveToken}`;
    }, [effectiveToken, draftId]);

    const handleCopy = useCallback(async () => {
        if (!inviteUrl) return;
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            toast.success(
                t('co_cook_link_copied', {
                    defaultValue: 'Co-cook invite link copied to clipboard!',
                })
            );
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(
                t('could_not_copy_link', {
                    defaultValue: 'Could not copy link to clipboard',
                })
            );
        }
    }, [inviteUrl, t]);

    const handleGenerateOrRegenerate = useCallback(
        async (isAutoInitial: boolean = false) => {
            if (!draftId) return;
            setIsRegenerating(true);
            try {
                const res = await axios.post('/api/draft/invite', {
                    draftId,
                    regenerate: Boolean(effectiveToken),
                });
                if (res.data?.inviteToken) {
                    setRegeneratedToken(res.data.inviteToken);
                }
                if (res.data?.draft) {
                    await mutateDraft(res.data.draft, false);
                } else {
                    await mutateDraft();
                }
                mutate('/api/draft/active');
                mutate(`/api/draft?draftId=${encodeURIComponent(draftId)}`);
                setShowRegenerateConfirm(false);
                if (!isAutoInitial && effectiveToken) {
                    toast.success(
                        t('invite_link_regenerated', {
                            defaultValue: 'Invite link regenerated!',
                        })
                    );
                }
            } catch {
                if (!isAutoInitial) {
                    toast.error(
                        t('something_went_wrong', {
                            defaultValue: 'Something went wrong',
                        })
                    );
                }
            } finally {
                setIsRegenerating(false);
            }
        },
        [draftId, effectiveToken, mutateDraft, t]
    );

    const hasAutoGeneratedRef = React.useRef(false);

    React.useEffect(() => {
        if (!isOpen) {
            hasAutoGeneratedRef.current = false;
        }
    }, [isOpen]);

    React.useEffect(() => {
        hasAutoGeneratedRef.current = false;
    }, [draftId]);

    React.useEffect(() => {
        if (
            isOpen &&
            draftId &&
            isOwner &&
            draft &&
            !effectiveToken &&
            !isRegenerating &&
            !hasAutoGeneratedRef.current
        ) {
            hasAutoGeneratedRef.current = true;
            handleGenerateOrRegenerate(true);
        }
    }, [
        isOpen,
        draftId,
        isOwner,
        draft,
        effectiveToken,
        isRegenerating,
        handleGenerateOrRegenerate,
    ]);

    const handleRoleChange = useCallback(
        async (targetUserId: string, newRole: CoCookRole) => {
            if (!draftId) return;
            setMutatingUserId(targetUserId);
            // Optimistic update so select immediately reflects new role
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

    const bodyContent = (
        <div
            data-testid="draft-invite-modal"
            className="flex flex-col gap-6"
        >
            {isDraftLoading && !draft ? (
                <div className="flex h-48 items-center justify-center">
                    <Loader height="80px" />
                </div>
            ) : (
                <>
                    {/* Owner section: Invite Link & Direct User Search */}
                    {isOwner ? (
                        <div className="flex flex-col gap-5">
                            <DraftInviteLinkSection
                                isOwner={true}
                                inviteUrl={inviteUrl}
                                hasInviteToken={Boolean(draft?.inviteToken)}
                                isRegenerating={isRegenerating}
                                copied={copied}
                                showRegenerateConfirm={showRegenerateConfirm}
                                onCopy={handleCopy}
                                onRequestRegenerate={() =>
                                    setShowRegenerateConfirm(true)
                                }
                                onCancelRegenerate={() =>
                                    setShowRegenerateConfirm(false)
                                }
                                onConfirmRegenerate={() => {
                                    void handleGenerateOrRegenerate();
                                }}
                            />
                            <DraftDirectSearchSection
                                coCooksCount={draft?.coCooksIds?.length || 0}
                                ownerId={draft?.ownerId}
                                coCooksIds={draft?.coCooksIds}
                                isAddingUser={isAddingUser}
                                onAddCollaborator={handleAddCollaborator}
                            />
                        </div>
                    ) : (
                        <DraftInviteLinkSection
                            isOwner={false}
                            inviteUrl={inviteUrl}
                            hasInviteToken={Boolean(draft?.inviteToken)}
                            isRegenerating={isRegenerating}
                            copied={copied}
                            showRegenerateConfirm={false}
                            onCopy={handleCopy}
                            onRequestRegenerate={() => {}}
                            onCancelRegenerate={() => {}}
                            onConfirmRegenerate={() => {}}
                        />
                    )}

                    {/* Section: Collaborators */}
                    <DraftCollaboratorsList
                        ownerId={draft?.ownerId}
                        ownerName={draft?.ownerName}
                        coCooksIds={draft?.coCooksIds}
                        coCookRoles={draft?.coCookRoles}
                        usersMap={usersMap}
                        currentUser={currentUser}
                        isOwner={isOwner}
                        mutatingUserId={mutatingUserId}
                        onRoleChange={handleRoleChange}
                        onRemoveCollaborator={handleRemoveCollaborator}
                    />
                </>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onClose}
            actionLabel={t('close', { defaultValue: 'Close' }) as string}
            title={
                t('manage_co_cooks_invite', {
                    defaultValue: 'Manage Co-Cooks & Invites',
                }) as string
            }
            body={bodyContent}
        />
    );
};

export default DraftInviteModal;
