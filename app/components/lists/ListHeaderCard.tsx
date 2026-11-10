'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import VerificationBadge from '@/app/components/VerificationBadge';
import useIsMounted from '@/app/hooks/useIsMounted';
import { SafeList, SafeUser } from '@/app/types';

interface ListUserShelfProps {
    user: SafeUser;
}

const ListUserShelf: React.FC<ListUserShelfProps> = ({ user }) => {
    const router = useRouter();
    const { t } = useTranslation();

    const handleProfileClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            router?.push?.(`/profile/${user.id}`);
        },
        [router, user.id]
    );

    return (
        <div className="flex items-center gap-3">
            <Link
                href={`/profile/${user.id}`}
                onClick={handleProfileClick}
                className="cursor-pointer"
                aria-label={user.name || 'User profile'}
            >
                <Avatar
                    src={user.image}
                    size={42}
                    quality="auto:eco"
                />
            </Link>
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                    <Link
                        href={`/profile/${user.id}`}
                        className="hover:text-green-450 dark:hover:text-green-450 cursor-pointer text-left text-base font-semibold text-neutral-900 transition-colors duration-200 focus:outline-hidden sm:text-lg dark:text-white"
                        onClick={handleProfileClick}
                    >
                        {user.name}
                    </Link>
                    {user.verified && <VerificationBadge size={18} />}
                </div>
                {typeof user.level === 'number' && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {`${t('level')} ${user.level}`}
                    </div>
                )}
            </div>
        </div>
    );
};

export interface ListHeaderCardProps {
    list: SafeList;
    recipesCount: number;
}

const ListHeaderCard: React.FC<ListHeaderCardProps> = ({
    list,
    recipesCount,
}) => {
    const { t, i18n } = useTranslation();
    const isMounted = useIsMounted();

    const listTitle = list.isDefault ? t('to_cook_later') : list.name;
    const formattedDate = isMounted
        ? formatDate(list.createdAt, i18n.language)
        : null;
    const recipeCountLabel = `${recipesCount} ${recipesCount === 1 ? t('recipe') : t('recipes')}`;

    return (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
            {/* List Title & Date */}
            <div className="mb-5">
                <h1
                    className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
                    data-cy="list-title"
                >
                    {listTitle}
                </h1>
                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {formattedDate}
                </p>
            </div>

            {/* User Shelf & Recipes Count */}
            <div className="flex flex-col justify-between gap-4 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center dark:border-neutral-800">
                {list.user ? <ListUserShelf user={list.user} /> : <div />}
                <div
                    className="self-end text-xs font-semibold text-neutral-600 sm:self-auto dark:text-neutral-300"
                    data-cy="list-recipes-count"
                >
                    {recipeCountLabel}
                </div>
            </div>
        </div>
    );
};

export default ListHeaderCard;
