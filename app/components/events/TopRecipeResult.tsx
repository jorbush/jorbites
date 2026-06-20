'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiAward, FiHeart, FiUser } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

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
    const { t } = useTranslation();

    if (!session || !session.winner) return null;

    const winner = session.winner;
    const badgeSlug = `recipe_of_${category === 'week' ? 'the_week' : category === 'month' ? 'the_month' : 'the_year'}`;
    const badgePath = `/badges/${badgeSlug}.webp`;

    return (
        <div className="relative mb-10 overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-amber-500/20 dark:from-neutral-900/40 dark:via-neutral-950 dark:to-orange-950/5">
            {/* Background glowing decorations */}
            <div className="absolute -top-16 -right-16 size-40 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/5" />
            <div className="absolute -bottom-16 -left-16 size-40 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/5" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
                {/* Winner Badge Image */}
                <div className="flex flex-shrink-0 justify-center">
                    <div className="relative flex size-28 items-center justify-center rounded-full bg-amber-100 p-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] dark:bg-amber-950/30 dark:shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                        <Image
                            src={badgePath}
                            alt={t(badgeSlug) || badgeSlug}
                            width={90}
                            height={90}
                            className="object-contain transition-transform duration-500 hover:rotate-12"
                        />
                        <div className="absolute right-1 -bottom-1.5 rounded-full bg-amber-500 p-1 text-white shadow-md">
                            <FiAward className="text-sm" />
                        </div>
                    </div>
                </div>

                {/* Content details */}
                <div className="flex-1 text-center md:text-left">
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/20">
                        🏆 {t(`recipe_of_the_${category}`)}
                    </span>
                    <h3 className="mt-2.5 text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
                        {t(`recipe_of_the_${category}_winner`)}
                    </h3>
                    <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
                        {t('period') || 'Period'}: {session.periodKey}
                    </p>

                    {/* Winner Recipe details */}
                    <div className="mx-auto flex max-w-sm items-center gap-4 rounded-xl border border-neutral-100 bg-white/60 p-3 backdrop-blur-sm md:mx-0 dark:border-neutral-800 dark:bg-neutral-900/40">
                        <Link
                            href={`/recipe/${winner.id}`}
                            className="relative size-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 transition-opacity hover:opacity-90 dark:bg-neutral-800"
                        >
                            <Image
                                src={winner.imageSrc || '/avocado.webp'}
                                alt={winner.title}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        </Link>
                        <div className="min-w-0 flex-1 text-left">
                            <Link
                                href={`/recipe/${winner.id}`}
                                className="block truncate font-semibold text-neutral-800 hover:text-amber-600 dark:text-neutral-100 dark:hover:text-amber-500"
                            >
                                {winner.title}
                            </Link>
                            <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                <span className="flex items-center gap-1">
                                    <FiUser />
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
