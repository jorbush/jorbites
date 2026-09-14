'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiUsers, FiShield, FiTrash2, FiLogOut } from 'react-icons/fi';
import Avatar from '@/app/components/utils/Avatar';
import { SafeUser } from '@/app/types';
import { CoCookRole } from '@/app/types/draft';

export interface DraftCollaboratorsListProps {
    ownerId?: string;
    ownerName?: string;
    coCooksIds?: string[];
    coCookRoles?: Record<string, CoCookRole>;
    usersMap: Map<string, SafeUser>;
    currentUser?: SafeUser | null;
    isOwner: boolean;
    mutatingUserId: string | null;
    onRoleChange: (targetUserId: string, newRole: CoCookRole) => void;
    onRemoveCollaborator: (targetUserId: string) => void;
}

const DraftCollaboratorsList: React.FC<DraftCollaboratorsListProps> = ({
    ownerId,
    ownerName,
    coCooksIds,
    coCookRoles,
    usersMap,
    currentUser,
    isOwner,
    mutatingUserId,
    onRoleChange,
    onRemoveCollaborator,
}) => {
    const { t } = useTranslation();

    const ownerUser = ownerId ? usersMap.get(ownerId) : undefined;
    const isCurrentUserOwner = Boolean(
        currentUser?.id && ownerId && currentUser.id === ownerId
    );

    return (
        <div className="flex flex-col gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-600 uppercase dark:text-neutral-400">
                <FiUsers size={14} />
                <span>
                    {t('co_cooks', { defaultValue: 'Co-Cooks' })} (
                    {(coCooksIds?.length || 0) + 1})
                </span>
            </span>

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
                            src={ownerUser?.image}
                            size={36}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {ownerUser?.name || ownerName || 'Owner'}
                            </span>
                            <span className="text-xs text-neutral-500">
                                {isCurrentUserOwner
                                    ? t('you', { defaultValue: 'You' })
                                    : ownerUser?.email || ''}
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
                {coCooksIds && coCooksIds.length > 0 ? (
                    coCooksIds.map((coCookId) => {
                        const user = usersMap.get(coCookId);
                        const role: CoCookRole =
                            coCookRoles?.[coCookId] || 'editor';
                        const isSelf = coCookId === currentUser?.id;
                        const isActionDisabled = mutatingUserId === coCookId;

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
                                                          defaultValue: 'You',
                                                      })
                                                    : 'Co-Cook')}
                                        </span>
                                        <span className="text-xs text-neutral-500">
                                            {user?.email ||
                                                (isSelf
                                                    ? t('you', {
                                                          defaultValue: 'You',
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
                                            disabled={isActionDisabled}
                                            onChange={(e) =>
                                                onRoleChange(
                                                    coCookId,
                                                    e.target.value as CoCookRole
                                                )
                                            }
                                            aria-label={String(
                                                t('collaborator_role', {
                                                    defaultValue:
                                                        'Collaborator Role',
                                                })
                                            )}
                                            className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 focus:outline-hidden disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                        >
                                            <option value="editor">
                                                {t('role_editor', {
                                                    defaultValue: 'Editor',
                                                })}
                                            </option>
                                            <option value="viewer">
                                                {t('role_viewer', {
                                                    defaultValue: 'Viewer',
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
                                                      defaultValue: 'Viewer',
                                                  })
                                                : t('role_editor', {
                                                      defaultValue: 'Editor',
                                                  })}
                                        </span>
                                    )}

                                    {/* Owner can remove any co-cook */}
                                    {isOwner && (
                                        <button
                                            type="button"
                                            data-testid={`remove-collaborator-${coCookId}`}
                                            onClick={() =>
                                                onRemoveCollaborator(coCookId)
                                            }
                                            disabled={isActionDisabled}
                                            title={
                                                t('remove_co_cook', {
                                                    defaultValue:
                                                        'Remove co-cook',
                                                }) as string
                                            }
                                            aria-label={
                                                t('remove_co_cook', {
                                                    defaultValue:
                                                        'Remove co-cook',
                                                }) as string
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
                                                onRemoveCollaborator(coCookId)
                                            }
                                            disabled={isActionDisabled}
                                            title={
                                                t('leave_draft', {
                                                    defaultValue: 'Leave draft',
                                                }) as string
                                            }
                                            aria-label={
                                                t('leave_draft', {
                                                    defaultValue: 'Leave draft',
                                                }) as string
                                            }
                                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                        >
                                            <FiLogOut size={12} />
                                            <span>
                                                {t('leave_draft', {
                                                    defaultValue: 'Leave',
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
    );
};

export default DraftCollaboratorsList;
