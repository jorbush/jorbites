'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiAward, FiHeart } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import Avatar from '@/app/components/utils/Avatar';
import { formatPeriodKey } from '@/app/utils/date-utils';

interface WinnerRecipe {
    id: string;
    title: string;
    imageSrc: string;
    numLikes: number;
    user: {
        name: string | null;
        image: string | null;
    };
}

interface TopRecipeResultProps {
    category: 'week' | 'month' | 'year';
    session: {
        periodKey: string;
        winner: WinnerRecipe | null;
    };
}

const TopRecipeResult: React.FC<TopRecipeResultProps> = ({
    category,
    session,
}) => {
    const { t, i18n } = useTranslation();

    if (!session || !session.winner) return null;

    const winner = session.winner;
    const badgeSlug = `recipe_of_${category === 'week' ? 'the_week' : category === 'month' ? 'the_month' : 'the_year'}`;
    const badgePath = `/badges/${badgeSlug}.webp`;

    return (
        <div className="relative mb-10 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-colors duration-200 hover:border-neutral-300 sm:p-6 dark:border-neutral-800 dark:bg-neutral-800/90 dark:hover:border-neutral-700">
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
                {/* Winner Badge Image */}
                <div className="flex flex-shrink-0 justify-center">
                    <div className="relative flex size-20 items-center justify-center rounded-2xl border border-neutral-200/70 bg-neutral-100 p-2 dark:border-neutral-700/60 dark:bg-neutral-800">
                        <Image
                            src={badgePath}
                            alt={t(badgeSlug) || badgeSlug}
                            width={64}
                            height={64}
                            className="object-contain transition-transform duration-500 hover:rotate-12"
                        />
                        <div className="bg-green-450 absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-lg text-neutral-900 shadow-xs">
                            <FiAward className="text-xs" />
                        </div>
                    </div>
                </div>

                {/* Content details */}
                <div className="flex-1 text-center md:text-left">
                    <span className="border-green-450/30 bg-green-450/15 dark:text-green-450 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold text-neutral-800">
                        🏆 {t(`recipe_of_the_${category}`)}
                    </span>
                    <h3 className="mt-2.5 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        {t(`recipe_of_the_${category}_winner`)}
                    </h3>
                    <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
                        {t('period') || 'Period'}:{' '}
                        {formatPeriodKey(
                            category,
                            session.periodKey,
                            i18n.language
                        )}
                    </p>

                    {/* Winner Recipe details */}
                    <div className="mx-auto flex max-w-sm items-center gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3 md:mx-0 dark:border-neutral-700/60 dark:bg-neutral-900/40">
                        <Link
                            href={`/recipes/${winner.id}`}
                            className="relative size-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 transition-opacity hover:opacity-90 dark:bg-neutral-800"
                        >
                            <CustomProxyImage
                                src={winner.imageSrc || '/avocado.webp'}
                                alt={winner.title}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        </Link>
                        <div className="min-w-0 flex-1 text-left">
                            <Link
                                href={`/recipes/${winner.id}`}
                                className="hover:text-green-450 dark:hover:text-green-450 block truncate font-semibold text-neutral-800 transition-colors duration-200 dark:text-neutral-100"
                            >
                                {winner.title}
                            </Link>
                            <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                <span className="flex items-center gap-1.5">
                                    <Avatar
                                        src={winner.user?.image}
                                        size={20}
                                    />
                                    {winner.user?.name ||
                                        t('anonymous') ||
                                        'Chef'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FiHeart className="fill-red-500/10 text-red-500" />
                                    {winner.numLikes || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopRecipeResult;
