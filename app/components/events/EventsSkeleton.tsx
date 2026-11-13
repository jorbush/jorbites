import React from 'react';
import Container from '@/app/components/utils/Container';
import { SafeWeeklyChallenge } from '@/app/types';
import {
    TopRecipeCategory,
    TopRecipeSessionsMap,
} from '@/app/actions/top-recipe-vote';

interface EventsSkeletonProps {
    weeklyChallenge?: SafeWeeklyChallenge | null;
    topRecipeSessions?: TopRecipeSessionsMap;
}

const TOP_RECIPE_CATEGORIES: TopRecipeCategory[] = ['week', 'month', 'year'];

export const EventsSkeleton: React.FC<EventsSkeletonProps> = ({
    weeklyChallenge,
    topRecipeSessions,
}) => {
    return (
        <Container>
            <div className="px-4 py-8">
                {/* Header Skeleton */}
                <div className="mb-8 flex animate-pulse flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-3.5">
                        {/* Squircle Icon placeholder */}
                        <div className="size-11 shrink-0 rounded-xl bg-neutral-200 sm:size-12 dark:bg-neutral-700"></div>
                        <div className="space-y-2">
                            {/* Title placeholder */}
                            <div className="h-8 w-36 rounded-lg bg-neutral-200 sm:w-48 dark:bg-neutral-700"></div>
                            {/* Description placeholder */}
                            <div className="h-4 w-60 rounded bg-neutral-200 sm:w-80 dark:bg-neutral-700"></div>
                        </div>
                    </div>
                    {/* Action button placeholder */}
                    <div className="hidden h-10 w-36 rounded-xl bg-neutral-200 md:block dark:bg-neutral-700"></div>
                </div>

                {/* WeeklyChallenge Skeleton (only if it exists) */}
                {weeklyChallenge && (
                    <div className="mb-10 animate-pulse rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-800/90">
                        {/* Title placeholder */}
                        <div className="mb-2 h-7 w-44 rounded bg-neutral-200 sm:h-8 dark:bg-neutral-700"></div>
                        {/* Challenge name placeholder */}
                        <div className="mb-2 h-6 w-36 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        {/* Description placeholder */}
                        <div className="mb-4 space-y-2">
                            <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        </div>
                        {/* Date placeholder */}
                        <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                )}

                {/* TopRecipeSection Skeletons (only for sessions that exist) */}
                {TOP_RECIPE_CATEGORIES.map((category) => {
                    const session = topRecipeSessions?.[category]?.session;
                    if (!session) return null;

                    const isVoting = session.status === 'voting';
                    if (!isVoting && !session.winner) return null;

                    return isVoting ? (
                        <div
                            key={category}
                            className="mb-10 animate-pulse rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-800/90"
                        >
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 shrink-0 rounded-xl bg-neutral-200 sm:size-11 dark:bg-neutral-700" />
                                    <div className="space-y-2">
                                        <div className="h-6 w-48 rounded bg-neutral-200 sm:w-64 dark:bg-neutral-700" />
                                        <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
                                    </div>
                                </div>
                                <div className="h-6 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {[...Array(4)].map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="h-36 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-700/60 dark:bg-neutral-900/40"
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div
                            key={category}
                            className="mb-10 animate-pulse rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-800/90"
                        >
                            <div className="flex flex-col gap-6 md:flex-row md:items-center">
                                <div className="mx-auto size-20 shrink-0 rounded-2xl bg-neutral-200 md:mx-0 dark:bg-neutral-700" />
                                <div className="flex-1 space-y-3">
                                    <div className="mx-auto h-7 w-56 rounded bg-neutral-200 md:mx-0 dark:bg-neutral-700" />
                                    <div className="mx-auto h-4 w-36 rounded bg-neutral-200 md:mx-0 dark:bg-neutral-700" />
                                    <div className="mx-auto h-22 max-w-sm rounded-xl bg-neutral-100 md:mx-0 dark:bg-neutral-900/40" />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* EventCalendar Skeleton */}
                <div className="mb-10 animate-pulse rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-800/90">
                    {/* Calendar Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="h-7 w-32 rounded bg-neutral-200 md:h-8 md:w-40 dark:bg-neutral-700"></div>
                        <div className="flex gap-2">
                            <div className="size-8 rounded-xl bg-neutral-200 sm:size-9 dark:bg-neutral-700"></div>
                            <div className="size-8 rounded-xl bg-neutral-200 sm:size-9 dark:bg-neutral-700"></div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                        {/* Days of week */}
                        {[...Array(7)].map((_, i) => (
                            <div
                                key={i}
                                className="flex justify-center pb-2"
                            >
                                <div className="h-4 w-8 rounded bg-neutral-200 md:w-12 dark:bg-neutral-700"></div>
                            </div>
                        ))}
                        {/* Days of month (35 days standard fallback layout) */}
                        {[...Array(35)].map((_, i) => (
                            <div
                                key={i}
                                className="relative h-[64px] rounded-xl border border-neutral-100 bg-neutral-50/50 p-1 md:h-[104px] md:p-2 dark:border-neutral-800 dark:bg-neutral-900/40"
                            >
                                <div className="size-4 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories Lists Skeletons (4 categories) */}
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className="mb-10 animate-pulse"
                    >
                        {/* Category Title Placeholder */}
                        <div className="mb-5 h-8 w-40 rounded bg-neutral-200 dark:bg-neutral-700"></div>

                        {/* Category Cards Scrollable Wrapper */}
                        <div className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2 sm:px-3">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-[80vw] max-w-[300px] flex-shrink-0 sm:w-[320px] sm:max-w-none md:w-[350px]"
                                >
                                    {/* EventCardSkeleton matching design */}
                                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-800/90">
                                        <div className="relative h-40 w-full bg-neutral-200 dark:bg-neutral-700"></div>
                                        <div className="p-4 sm:p-5">
                                            <div className="h-[56px] space-y-2">
                                                <div className="h-5 w-5/6 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                                <div className="h-5 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="mr-2 size-4 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                                                <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    );
};

export default EventsSkeleton;
