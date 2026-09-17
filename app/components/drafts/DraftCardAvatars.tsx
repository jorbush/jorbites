'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import Avatar from '@/app/components/utils/Avatar';
import { axiosFetcher } from '@/app/utils/fetcher';
import { SafeUser } from '@/app/types';
import { MAX_CO_COOKS } from '@/app/utils/constants';

const MAX_DISPLAYED_AVATARS = MAX_CO_COOKS + 1; // 1 owner + up to 4 co-cooks (5 total)

export interface DraftCardAvatarsProps {
    ownerId?: string;
    ownerName?: string;
    coCooksIds?: string[];
    onManageCoCooks?: (e: React.MouseEvent) => void;
    users?: SafeUser[];
    usersMap?: Map<string, SafeUser>;
}

const DraftCardAvatars: React.FC<DraftCardAvatarsProps> = ({
    ownerId,
    ownerName,
    coCooksIds,
    onManageCoCooks,
    users,
    usersMap,
}) => {
    const { t } = useTranslation();

    const userEntries = useMemo(() => {
        const entries: { id: string; isOwner: boolean }[] = [];
        if (ownerId) {
            entries.push({ id: ownerId, isOwner: true });
        }
        if (Array.isArray(coCooksIds)) {
            coCooksIds.forEach((id) => {
                if (id && id !== ownerId && !entries.some((e) => e.id === id)) {
                    entries.push({ id, isOwner: false });
                }
            });
        }
        return entries;
    }, [ownerId, coCooksIds]);

    const allUserIds = useMemo(() => {
        return userEntries.map((e) => e.id);
    }, [userEntries]);

    const shouldFetch = !users && !usersMap && allUserIds.length > 0;
    const { data: fetchedUsers } = useSWR<SafeUser[]>(
        shouldFetch ? `/api/users/multiple?ids=${allUserIds.join(',')}` : null,
        axiosFetcher
    );

    const resolvedUsersMap = useMemo(() => {
        if (usersMap) return usersMap;
        const map = new Map<string, SafeUser>();
        const list = users || fetchedUsers;
        if (Array.isArray(list)) {
            list.forEach((u) => {
                if (u?.id) map.set(u.id, u);
            });
        }
        return map;
    }, [usersMap, users, fetchedUsers]);

    if (userEntries.length === 0) {
        return null;
    }

    const displayedEntries = userEntries.slice(0, MAX_DISPLAYED_AVATARS);
    const extraCount = userEntries.length - MAX_DISPLAYED_AVATARS;

    const avatarList = (
        <>
            {displayedEntries.map((entry) => {
                const user = resolvedUsersMap.get(entry.id);
                const roleLabel = entry.isOwner
                    ? (t('role_owner', { defaultValue: 'Owner' }) as string)
                    : (t('role_collaborator', {
                          defaultValue: 'Collaborator',
                      }) as string);
                const displayName = entry.isOwner
                    ? user?.name || ownerName || roleLabel
                    : user?.name || roleLabel;
                const tooltip = `${displayName} (${roleLabel})`;

                return (
                    <div
                        key={entry.id}
                        className="-ml-2 flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white first:ml-0 dark:ring-neutral-900"
                        title={tooltip}
                        data-testid={
                            entry.isOwner
                                ? 'draft-card-owner-avatar'
                                : `draft-card-collaborator-avatar-${entry.id}`
                        }
                    >
                        <Avatar
                            src={user?.image}
                            size={24}
                        />
                    </div>
                );
            })}
            {extraCount > 0 && (
                <div
                    data-testid="draft-card-avatars-overflow"
                    className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-600 ring-1 ring-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
                    title={`+${extraCount} more`}
                >
                    +{extraCount}
                </div>
            )}
        </>
    );

    if (onManageCoCooks) {
        const title = (t('manage_co_cooks_invite', {
            defaultValue: 'Manage Co-Cooks & Invites',
        }) ?? 'Manage Co-Cooks & Invites') as string;

        return (
            <button
                type="button"
                className="relative z-10 flex w-fit cursor-pointer items-center text-left hover:opacity-80 focus:outline-none"
                onClick={onManageCoCooks}
                data-testid="draft-card-avatars"
                title={title}
                aria-label={title}
            >
                {avatarList}
            </button>
        );
    }

    return (
        <div
            className="relative z-10 flex w-fit items-center"
            data-testid="draft-card-avatars"
        >
            {avatarList}
        </div>
    );
};

export default DraftCardAvatars;
