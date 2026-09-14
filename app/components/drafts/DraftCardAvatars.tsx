'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export interface DraftCardAvatarsProps {
    coCooksIds?: string[];
    onManageCoCooks?: (e: React.MouseEvent) => void;
}

const DraftCardAvatars: React.FC<DraftCardAvatarsProps> = ({
    coCooksIds,
    onManageCoCooks,
}) => {
    const { t } = useTranslation();

    if (!coCooksIds || coCooksIds.length === 0) {
        return null;
    }

    const displayedIds = coCooksIds.slice(0, 3);
    const extraCount = coCooksIds.length - 3;

    const avatarList = (
        <>
            {displayedIds.map((id) => (
                <div
                    key={id}
                    className="-ml-2 flex size-6 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-[10px] font-bold text-white first:ml-0 dark:border-neutral-900"
                >
                    {id.substring(0, 1).toUpperCase()}
                </div>
            ))}
            {extraCount > 0 && (
                <div className="-ml-2 flex size-6 items-center justify-center rounded-full border-2 border-white bg-neutral-200 text-[10px] font-medium text-neutral-600 first:ml-0 dark:border-neutral-900 dark:bg-neutral-700 dark:text-neutral-300">
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
                className="relative z-10 flex w-fit cursor-pointer text-left hover:opacity-80 focus:outline-none"
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
            className="relative z-10 flex w-fit"
            data-testid="draft-card-avatars"
        >
            {avatarList}
        </div>
    );
};

export default DraftCardAvatars;
