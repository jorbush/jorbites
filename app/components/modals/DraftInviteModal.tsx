'use client';

import React, { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    FiCopy,
    FiCheck,
    FiRefreshCw,
    FiTrash2,
    FiLogOut,
    FiShield,
    FiUsers,
    FiLink,
} from 'react-icons/fi';
import Modal from '@/app/components/modals/Modal';
import Avatar from '@/app/components/utils/Avatar';
import Loader from '@/app/components/shared/Loader';
import useDraftInviteModal from '@/app/hooks/useDraftInviteModal';
import { axiosFetcher } from '@/app/utils/fetcher';
import { SafeUser } from '@/app/types';
import { SharedDraft, CoCookRole } from '@/app/types/draft';

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
        const ids: string[] = [];
        if (draft.ownerId) ids.push(draft.ownerId);
        if (Array.isArray(draft.coCooksIds)) {
            draft.coCooksIds.forEach((id) => {
                if (id && !ids.includes(id)) ids.push(id);
            });
        }
        return ids;
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

    const inviteUrl = useMemo(() => {
        if (!draft?.inviteToken || !draftId) return '';
        const origin =
            typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/recipes/new?draft=${draftId}&token=${draft.inviteToken}`;
    }, [draft?.inviteToken, draftId]);

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

    const handleGenerateOrRegenerate = useCallback(async () => {
        if (!draftId) return;
        setIsRegenerating(true);
        try {
            const res = await axios.post('/api/draft/invite', {
                draftId,
                regenerate: Boolean(draft?.inviteToken),
            });
            if (res.data?.draft) {
                await mutateDraft(res.data.draft, false);
            } else {
                await mutateDraft();
            }
            mutate('/api/draft/active');
            mutate(`/api/draft?draftId=${encodeURIComponent(draftId)}`);
            setShowRegenerateConfirm(false);
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
    }, [draft?.inviteToken, draftId, mutateDraft, t]);

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
                                  ...(prev.coCookRoles || {}),
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
                    {/* Section: Invite Link */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-600 uppercase dark:text-neutral-400">
                                <FiLink size={14} />
                                <span>
                                    {t('invite_link', {
                                        defaultValue: 'Invite Link',
                                    })}
                                </span>
                            </label>
                            {isOwner &&
                                draft?.inviteToken &&
                                !showRegenerateConfirm && (
                                    <button
                                        type="button"
                                        data-testid="regenerate-invite-link-btn"
                                        onClick={() =>
                                            setShowRegenerateConfirm(true)
                                        }
                                        disabled={isRegenerating}
                                        className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 disabled:opacity-50 dark:text-amber-400 dark:hover:text-amber-300"
                                    >
                                        <FiRefreshCw
                                            size={12}
                                            className={
                                                isRegenerating
                                                    ? 'animate-spin'
                                                    : ''
                                            }
                                        />
                                        <span>
                                            {t('regenerate_link', {
                                                defaultValue: 'Regenerate link',
                                            })}
                                        </span>
                                    </button>
                                )}
                        </div>

                        {showRegenerateConfirm && (
                            <div
                                data-testid="regenerate-confirm-box"
                                className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200"
                            >
                                <p>
                                    {t('regenerate_confirm', {
                                        defaultValue:
                                            'Are you sure? Previous invite links will stop working.',
                                    })}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        data-testid="regenerate-cancel-btn"
                                        onClick={() =>
                                            setShowRegenerateConfirm(false)
                                        }
                                        className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                    >
                                        {t('cancel', {
                                            defaultValue: 'Cancel',
                                        })}
                                    </button>
                                    <button
                                        type="button"
                                        data-testid="regenerate-confirm-btn"
                                        onClick={handleGenerateOrRegenerate}
                                        disabled={isRegenerating}
                                        className="rounded bg-amber-600 px-2.5 py-1 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                                    >
                                        {isRegenerating
                                            ? t('loading', {
                                                  defaultValue: 'Loading...',
                                              })
                                            : t('confirm', {
                                                  defaultValue: 'Regenerate',
                                              })}
                                    </button>
                                </div>
                            </div>
                        )}

                        {inviteUrl ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={inviteUrl}
                                    data-testid="invite-link-input"
                                    className="w-full truncate rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-700 select-all focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                />
                                <button
                                    type="button"
                                    data-testid="copy-invite-link-btn"
                                    onClick={handleCopy}
                                    className="bg-green-450 flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                                >
                                    {copied ? (
                                        <FiCheck size={14} />
                                    ) : (
                                        <FiCopy size={14} />
                                    )}
                                    <span>
                                        {copied
                                            ? t('copied', {
                                                  defaultValue: 'Copied!',
                                              })
                                            : t('copy_link', {
                                                  defaultValue: 'Copy Link',
                                              })}
                                    </span>
                                </button>
                            </div>
                        ) : isOwner ? (
                            <button
                                type="button"
                                data-testid="generate-invite-link-btn"
                                onClick={handleGenerateOrRegenerate}
                                disabled={isRegenerating}
                                className="bg-green-450 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                            >
                                <FiLink size={14} />
                                <span>
                                    {t('generate_invite_link', {
                                        defaultValue: 'Generate Invite Link',
                                    })}
                                </span>
                            </button>
                        ) : (
                            <p className="text-xs text-neutral-500 italic">
                                {t('only_owner_can_generate_link', {
                                    defaultValue:
                                        'Only the draft owner can generate invite links.',
                                })}
                            </p>
                        )}
                    </div>

                    {/* Section: Collaborators */}
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-600 uppercase dark:text-neutral-400">
                            <FiUsers size={14} />
                            <span>
                                {t('co_cooks', { defaultValue: 'Co-Cooks' })} (
                                {(draft?.coCooksIds?.length || 0) + 1})
                            </span>
                        </label>

                        <div
                            data-testid="collaborators-list"
                            className="flex flex-col divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            {/* Draft Owner Item */}
                            <div
                                data-testid="collaborator-owner"
                                className="flex items-center justify-between p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={
                                            draft?.ownerId
                                                ? usersMap.get(draft.ownerId)
                                                      ?.image
                                                : undefined
                                        }
                                        size={36}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                            {draft?.ownerId
                                                ? usersMap.get(draft.ownerId)
                                                      ?.name ||
                                                  draft.ownerName ||
                                                  'Owner'
                                                : 'Owner'}
                                        </span>
                                        <span className="text-xs text-neutral-500">
                                            {draft?.ownerId &&
                                            currentUser?.id === draft.ownerId
                                                ? t('you', {
                                                      defaultValue: 'You',
                                                  })
                                                : draft?.ownerId
                                                  ? usersMap.get(draft.ownerId)
                                                        ?.email
                                                  : ''}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    data-testid="role-badge-owner"
                                    className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                >
                                    <FiShield
                                        size={12}
                                        className="text-amber-500"
                                    />
                                    <span>
                                        {t('role_owner', {
                                            defaultValue: 'Owner',
                                        })}
                                    </span>
                                </span>
                            </div>

                            {/* Co-cooks List */}
                            {draft?.coCooksIds &&
                            draft.coCooksIds.length > 0 ? (
                                draft.coCooksIds.map((coCookId) => {
                                    const user = usersMap.get(coCookId);
                                    const role: CoCookRole =
                                        draft.coCookRoles?.[coCookId] ||
                                        'editor';
                                    const isSelf = coCookId === currentUser?.id;
                                    const isActionDisabled =
                                        mutatingUserId === coCookId;

                                    return (
                                        <div
                                            key={coCookId}
                                            data-testid={`collaborator-item-${coCookId}`}
                                            className="flex items-center justify-between p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    src={user?.image}
                                                    size={36}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                        {user?.name ||
                                                            (isSelf
                                                                ? t('you', {
                                                                      defaultValue:
                                                                          'You',
                                                                  })
                                                                : 'Co-Cook')}
                                                    </span>
                                                    <span className="text-xs text-neutral-500">
                                                        {user?.email ||
                                                            (isSelf
                                                                ? t('you', {
                                                                      defaultValue:
                                                                          'You',
                                                                  })
                                                                : '')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Role selection: Owner can toggle Editor vs Viewer */}
                                                {isOwner ? (
                                                    <select
                                                        data-testid={`role-select-${coCookId}`}
                                                        value={role}
                                                        disabled={
                                                            isActionDisabled
                                                        }
                                                        onChange={(e) =>
                                                            handleRoleChange(
                                                                coCookId,
                                                                e.target
                                                                    .value as CoCookRole
                                                            )
                                                        }
                                                        aria-label={t(
                                                            'collaborator_role',
                                                            {
                                                                defaultValue:
                                                                    'Collaborator Role',
                                                            }
                                                        )}
                                                        className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 focus:outline-hidden disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                                    >
                                                        <option value="editor">
                                                            {t('role_editor', {
                                                                defaultValue:
                                                                    'Editor',
                                                            })}
                                                        </option>
                                                        <option value="viewer">
                                                            {t('role_viewer', {
                                                                defaultValue:
                                                                    'Viewer',
                                                            })}
                                                        </option>
                                                    </select>
                                                ) : (
                                                    <span
                                                        data-testid={`role-badge-${coCookId}`}
                                                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            role === 'viewer'
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                        }`}
                                                    >
                                                        {role === 'viewer'
                                                            ? t('role_viewer', {
                                                                  defaultValue:
                                                                      'Viewer',
                                                              })
                                                            : t('role_editor', {
                                                                  defaultValue:
                                                                      'Editor',
                                                              })}
                                                    </span>
                                                )}

                                                {/* Owner can remove any co-cook */}
                                                {isOwner && (
                                                    <button
                                                        type="button"
                                                        data-testid={`remove-collaborator-${coCookId}`}
                                                        onClick={() =>
                                                            handleRemoveCollaborator(
                                                                coCookId
                                                            )
                                                        }
                                                        disabled={
                                                            isActionDisabled
                                                        }
                                                        title={
                                                            t(
                                                                'remove_co_cook',
                                                                {
                                                                    defaultValue:
                                                                        'Remove co-cook',
                                                                }
                                                            ) as string
                                                        }
                                                        aria-label={
                                                            t(
                                                                'remove_co_cook',
                                                                {
                                                                    defaultValue:
                                                                        'Remove co-cook',
                                                                }
                                                            ) as string
                                                        }
                                                        className="flex size-7 items-center justify-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                )}

                                                {/* Self co-cook can leave the draft */}
                                                {!isOwner && isSelf && (
                                                    <button
                                                        type="button"
                                                        data-testid="leave-draft-btn"
                                                        onClick={() =>
                                                            handleRemoveCollaborator(
                                                                coCookId
                                                            )
                                                        }
                                                        disabled={
                                                            isActionDisabled
                                                        }
                                                        title={
                                                            t('leave_draft', {
                                                                defaultValue:
                                                                    'Leave draft',
                                                            }) as string
                                                        }
                                                        aria-label={
                                                            t('leave_draft', {
                                                                defaultValue:
                                                                    'Leave draft',
                                                            }) as string
                                                        }
                                                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                                    >
                                                        <FiLogOut size={12} />
                                                        <span>
                                                            {t('leave_draft', {
                                                                defaultValue:
                                                                    'Leave',
                                                            })}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-3 text-center text-xs text-neutral-500 italic">
                                    {t('no_co_cooks_yet', {
                                        defaultValue:
                                            'No co-cooks have joined yet. Share the invite link above!',
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
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
