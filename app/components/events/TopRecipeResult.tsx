'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiAward, FiHeart } from 'react-icons/fi';
import Link from 'next/link';
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
        <div className="border-green-450/30 from-green-450/5 dark:border-green-450/20 relative mb-10 overflow-hidden rounded-2xl border-2 bg-gradient-to-br via-white to-emerald-50/10 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-neutral-900/40 dark:via-neutral-950 dark:to-emerald-950/5">
            {/* Background glowing decorations */}
            <div className="bg-green-450/10 dark:bg-green-450/5 absolute -top-16 -right-16 size-40 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 size-40 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/5" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
                {/* Winner Badge Image */}
                <div className="flex flex-shrink-0 justify-center">
                    <div className="bg-green-450/20 dark:bg-green-450/10 relative flex size-28 items-center justify-center rounded-full p-2 shadow-[0_0_20px_rgba(197,240,164,0.3)] dark:shadow-[0_0_20px_rgba(197,240,164,0.15)]">
                        <CustomProxyImage
                            src={badgePath}
                            alt={t(badgeSlug) || badgeSlug}
                            width={90}
                            height={90}
                            className="object-contain transition-transform duration-500 hover:rotate-12"
                        />
                        <div className="bg-green-450 absolute right-1 -bottom-1.5 rounded-full p-1 text-green-950 shadow-md">
                            <FiAward className="text-sm" />
                        </div>
                    </div>
                </div>

                {/* Content details */}
                <div className="flex-1 text-center md:text-left">
                    <span className="bg-green-450/20 dark:bg-green-450/10 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-green-800 ring-1 ring-green-600/20 ring-inset dark:text-green-400 dark:ring-green-500/20">
                        🏆 {t(`recipe_of_the_${category}`)}
                    </span>
                    <h3 className="mt-2.5 text-2xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">
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
                    <div className="mx-auto flex max-w-sm items-center gap-4 rounded-xl border border-neutral-100 bg-white/60 p-3 backdrop-blur-sm md:mx-0 dark:border-neutral-800 dark:bg-neutral-900/40">
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
                                className="hover:text-green-450 dark:hover:text-green-450 block truncate font-semibold text-neutral-800 dark:text-neutral-100"
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
