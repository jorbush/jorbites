import React from 'react';
import Container from '@/app/components/utils/Container';
import { SafeWeeklyChallenge } from '@/app/types';

interface EventsSkeletonProps {
    weeklyChallenge?: SafeWeeklyChallenge | null;
}

export const EventsSkeleton: React.FC<EventsSkeletonProps> = ({
    weeklyChallenge,
}) => {
    return (
        <Container>
            <div className="px-4 py-8">
                {/* SectionHeader Skeleton */}
                <div className="mb-10 animate-pulse text-center">
                    <div className="mb-3 flex items-center justify-center gap-2">
                        {/* Icon placeholder */}
                        <div className="size-8 rounded bg-neutral-200 sm:size-10 dark:bg-neutral-700"></div>
                        {/* Title placeholder */}
                        <div className="h-8 w-40 rounded bg-neutral-200 sm:h-10 sm:w-48 dark:bg-neutral-700"></div>
                    </div>
                    {/* Description placeholder */}
                    <div className="mx-auto h-4 w-64 rounded bg-neutral-200 sm:w-80 dark:bg-neutral-700"></div>
                </div>

                {/* WeeklyChallenge Skeleton (only if it exists) */}
                {weeklyChallenge && (
                    <div className="mb-10 animate-pulse rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center gap-2">
                            {/* Icon placeholder */}
                            <div className="size-6 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                            {/* Title placeholder */}
                            <div className="h-6 w-36 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        </div>
                        {/* Challenge name placeholder */}
                        <div className="mb-2 h-5 w-48 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        {/* Description placeholder */}
                        <div className="mb-4 space-y-2">
                            <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        </div>
                        {/* Date placeholder */}
                        <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                )}

                {/* EventCalendar Skeleton */}
                <div className="mb-10 animate-pulse rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
                    {/* Calendar Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="h-7 w-32 rounded bg-neutral-200 md:h-8 md:w-40 dark:bg-neutral-700"></div>
                        <div className="flex gap-2">
                            <div className="size-8 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="size-8 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
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
                                className="relative h-[64px] rounded-lg border border-neutral-100 bg-neutral-50/50 p-1 md:h-[104px] md:p-2 dark:border-neutral-800 dark:bg-neutral-950/20"
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
                        <div className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth px-6 pb-2">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="min-w-[280px] flex-shrink-0 sm:min-w-[320px] md:min-w-[350px]"
                                >
                                    {/* EventCardSkeleton matching design */}
                                    <div className="dark:bg-dark overflow-hidden rounded-xl border-[1px] border-neutral-200 bg-white dark:border-neutral-700">
                                        <div className="relative h-40 w-full bg-neutral-200 dark:bg-neutral-700"></div>
                                        <div className="p-4">
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
