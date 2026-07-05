'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeRecipe, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import Avatar from '@/app/components/utils/Avatar';
import VerificationBadge from '@/app/components/VerificationBadge';
import { FiArrowLeft } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import Image from 'next/image';
import getUserDisplayName from '@/app/utils/responsive';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import Badge from '@/app/components/utils/Badge';

interface LikesClientProps {
    recipe: SafeRecipe & {
        user: SafeUser;
    };
    currentUser?: SafeUser | null;
    likedUsers: SafeUser[];
}

const LikesClient: React.FC<LikesClientProps> = ({
    recipe,
    currentUser,
    likedUsers,
}) => {
    const { push } = useRouter() || {};
    const { t } = useTranslation();
    const isMdOrSmaller = useMediaQuery('(max-width: 675px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 530px)');

    return (
        <Container>
            <div className="mx-auto w-full max-w-(--breakpoint-md) px-4 py-6">
                {/* Back button */}
                <button
                    type="button"
                    onClick={() => push(`/recipes/${recipe.id}`)}
                    className="group mb-6 flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-neutral-600 transition-colors hover:text-neutral-900 focus:outline-hidden dark:text-neutral-300 dark:hover:text-white"
                >
                    <FiArrowLeft className="text-xl transition-transform group-hover:-translate-x-1" />
                    <span className="font-medium">{t('back_to_recipe')}</span>
                </button>

                {/* Recipe preview header card */}
                <div className="mb-8 flex flex-col gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 sm:flex-row sm:items-center dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <Image
                            src={recipe.imageSrc}
                            alt={recipe.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-xl font-bold text-neutral-800 dark:text-white">
                            {recipe.title}
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {t('liked_by')}
                        </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                        <AiFillHeart
                            className="fill-green-450"
                            size={22}
                        />
                        <span>
                            {recipe.numLikes}{' '}
                            {recipe.numLikes === 1
                                ? t('likes').toLowerCase().replace('s', '')
                                : t('likes').toLowerCase()}
                        </span>
                    </div>
                </div>

                {/* List of liked users */}
                {likedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-lg text-neutral-500 dark:text-neutral-400">
                            {t('no_likes_yet')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {likedUsers.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => push(`/profile/${user.id}`)}
                                className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-100 bg-white p-4 shadow-xs transition-all duration-200 hover:border-neutral-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={user.image}
                                        size={50}
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <span className="font-semibold text-neutral-800 hover:underline dark:text-white">
                                                {getUserDisplayName(
                                                    user,
                                                    isMdOrSmaller,
                                                    isSmOrSmaller
                                                )}
                                            </span>
                                            {user.verified && (
                                                <VerificationBadge className="text-md" />
                                            )}
                                        </div>
                                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {t('level')} {user.level}
                                        </span>
                                    </div>
                                </div>

                                {/* Badges */}
                                {user.badges && user.badges.length > 0 && (
                                    <div className="flex max-w-[150px] items-center gap-1 overflow-hidden sm:max-w-[200px]">
                                        {user.badges
                                            .slice(0, 3)
                                            .map((badge) => (
                                                <Badge
                                                    key={badge}
                                                    src={`/badges/${badge}.webp`}
                                                    alt={`${badge} badge`}
                                                    size={32}
                                                    className="opacity-90 hover:opacity-100"
                                                />
                                            ))}
                                        {user.badges.length > 3 && (
                                            <span className="ml-1 text-xs font-semibold text-neutral-400">
                                                +{user.badges.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
};

export default LikesClient;
