'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeRecipe, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import Avatar from '@/app/components/utils/Avatar';
import VerificationBadge from '@/app/components/VerificationBadge';
import { FiChevronLeft } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import Image from 'next/image';
import getUserDisplayName from '@/app/utils/responsive';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import Badge from '@/app/components/utils/Badge';

interface LikesClientProps {
    recipe: SafeRecipe & {
        user: SafeUser;
    };
    likedUsers: SafeUser[];
}

const LikesClient: React.FC<LikesClientProps> = ({ recipe, likedUsers }) => {
    const { back, push } = useRouter() || {};
    const { t } = useTranslation();
    const isMdOrSmaller = useMediaQuery('(max-width: 675px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 530px)');

    return (
        <Container>
            <div className="mx-auto w-full max-w-[800px] pt-2 pb-12 sm:pt-4">
                {/* Back button */}
                <button
                    type="button"
                    onClick={() => back()}
                    className="group mb-5 inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 focus:outline-hidden dark:text-neutral-400 dark:hover:text-white"
                    aria-label={t('back_to_recipe') || 'Back to recipe'}
                >
                    <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 group-hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:border-neutral-600">
                        <FiChevronLeft size={18} />
                    </div>
                    <span>{t('back_to_recipe')}</span>
                </button>

                {/* Recipe preview header card */}
                <div className="mb-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:p-5 dark:border-neutral-800 dark:bg-neutral-900/90">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200/60 sm:size-20 dark:border-neutral-700/60">
                        <Image
                            src={recipe.imageSrc}
                            alt={recipe.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-lg font-bold tracking-tight text-neutral-900 sm:text-xl dark:text-white">
                            {recipe.title}
                        </h1>
                        <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                            {t('liked_by')}
                        </p>
                    </div>
                    <div className="border-green-450/30 bg-green-450/15 dark:text-green-450 flex shrink-0 items-center gap-1.5 self-start rounded-full border px-3 py-1 text-sm font-semibold text-neutral-900 sm:self-center">
                        <AiFillHeart
                            className="fill-green-450 text-green-450"
                            size={18}
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
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200/80 bg-white py-16 text-center shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
                        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-neutral-200/80 bg-neutral-100 text-neutral-400 shadow-2xs dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-500">
                            <AiFillHeart size={24} />
                        </div>
                        <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                            {t('no_likes_yet')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        {likedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs transition-colors duration-200 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-neutral-700"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="relative z-10 shrink-0">
                                        <Avatar
                                            src={user.image}
                                            size={48}
                                            extraClasses="size-11 sm:size-12 ring-2 ring-neutral-100 dark:ring-neutral-800"
                                            onClick={() =>
                                                push(`/profile/${user.id}`)
                                            }
                                        />
                                    </div>
                                    <div className="flex min-w-0 flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    push(`/profile/${user.id}`)
                                                }
                                                className="hover:text-green-450 dark:hover:text-green-450 cursor-pointer truncate text-left font-bold text-neutral-900 transition-colors duration-200 after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus:outline-hidden dark:text-white"
                                            >
                                                {getUserDisplayName(
                                                    user,
                                                    isMdOrSmaller,
                                                    isSmOrSmaller
                                                )}
                                            </button>
                                            {user.verified && (
                                                <VerificationBadge className="text-green-450 relative z-10 shrink-0" />
                                            )}
                                        </div>
                                        <div className="mt-0.5 inline-flex items-center">
                                            <span className="border-green-450/30 bg-green-450/15 dark:text-green-450 rounded-full border px-2 py-0.5 text-xs font-semibold text-neutral-800">
                                                {t('level')} {user.level}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Badges */}
                                {user.badges && user.badges.length > 0 && (
                                    <div className="relative z-10 flex max-w-[150px] shrink-0 items-center gap-1.5 overflow-hidden sm:max-w-[200px]">
                                        {user.badges
                                            .slice(0, 3)
                                            .map((badge) => (
                                                <Badge
                                                    key={badge}
                                                    src={`/badges/${badge}.webp`}
                                                    alt={`${badge} badge`}
                                                    size={30}
                                                    className="opacity-90 transition-opacity duration-200 hover:opacity-100"
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
