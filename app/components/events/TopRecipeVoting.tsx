'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiAward, FiCheck, FiHeart, FiUser } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Candidate {
    id: string;
    title: string;
    imageSrc: string;
    numLikes: number;
    voteCount: number;
    user: {
        name: string | null;
        image: string | null;
    };
}

interface TopRecipeVotingProps {
    category: 'week' | 'month' | 'year';
    session: {
        id: string;
        periodKey: string;
        candidates: Candidate[];
    };
    userVote: {
        recipeId: string;
    } | null;
    mutate: () => Promise<any>;
}

const TopRecipeVoting: React.FC<TopRecipeVotingProps> = ({
    category,
    session,
    userVote,
    mutate,
}) => {
    const { t } = useTranslation();
    const [votingId, setVotingId] = useState<string | null>(null);

    const totalVotes = session.candidates.reduce(
        (sum, c) => sum + (c.voteCount || 0),
        0
    );

    const handleVote = async (recipeId: string) => {
        if (votingId) return;

        setVotingId(recipeId);
        try {
            const response = await fetch('/api/top-recipe-vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: session.id,
                    recipeId,
                }),
            });

            if (response.status === 401) {
                toast.error(
                    t('login_required_to_vote') ||
                        'You must be logged in to vote'
                );
                return;
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to submit vote');
            }

            toast.success(t('vote_success') || 'Vote cast successfully!');
            await mutate();
        } catch (error: any) {
            toast.error(
                error.message || t('vote_error') || 'Failed to cast vote'
            );
        } finally {
            setVotingId(null);
        }
    };

    return (
        <div className="mb-10 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50 p-6 shadow-md transition-all duration-300 dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900/50">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-500">
                        <FiAward className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
                            {t(`recipe_of_the_${category}_voting`)}
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {t('voting_period') || 'Voting period'}:{' '}
                            {session.periodKey}
                        </p>
                    </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-500/20">
                    <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                    {t('live_voting') || 'Live Voting'}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {session.candidates.map((candidate) => {
                    const isSelected = userVote?.recipeId === candidate.id;
                    const votePercent =
                        totalVotes > 0
                            ? Math.round(
                                  ((candidate.voteCount || 0) / totalVotes) *
                                      100
                              )
                            : 0;
                    const isVotingThis = votingId === candidate.id;

                    return (
                        <div
                            key={candidate.id}
                            className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
                                isSelected
                                    ? 'border-amber-500 bg-amber-50/10 shadow-sm dark:border-amber-500/50 dark:bg-amber-950/10'
                                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700'
                            }`}
                        >
                            <div className="flex gap-4">
                                <Link
                                    href={`/recipe/${candidate.id}`}
                                    className="relative size-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 transition-opacity hover:opacity-90 dark:bg-neutral-800"
                                >
                                    <Image
                                        src={
                                            candidate.imageSrc ||
                                            '/avocado.webp'
                                        }
                                        alt={candidate.title}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={`/recipe/${candidate.id}`}
                                        className="block truncate font-semibold text-neutral-800 hover:text-amber-600 dark:text-neutral-100 dark:hover:text-amber-500"
                                    >
                                        {candidate.title}
                                    </Link>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        <span className="flex items-center gap-1">
                                            <FiUser />
                                            {candidate.user?.name ||
                                                t('anonymous') ||
                                                'Chef'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiHeart className="fill-red-500/10 text-red-500" />
                                            {candidate.numLikes || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="mb-1 flex justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                        <span>
                                            {candidate.voteCount || 0}{' '}
                                            {candidate.voteCount === 1
                                                ? t('vote') || 'vote'
                                                : t('votes') || 'votes'}
                                        </span>
                                        <span>{votePercent}%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                    : 'bg-neutral-400 dark:bg-neutral-600'
                                            }`}
                                            style={{ width: `${votePercent}%` }}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleVote(candidate.id)}
                                    disabled={!!votingId}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                    } disabled:opacity-50`}
                                >
                                    {isVotingThis ? (
                                        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : isSelected ? (
                                        <>
                                            <FiCheck />
                                            {t('voted')}
                                        </>
                                    ) : (
                                        t('vote_now')
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopRecipeVoting;
