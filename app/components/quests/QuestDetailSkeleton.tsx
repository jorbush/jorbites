'use client';

const QuestDetailSkeleton = () => {
    return (
        <div className="mx-auto max-w-[800px] px-4 pt-2 pb-12 sm:px-6 sm:pt-4">
            {/* Back button and actions skeleton */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="size-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
                    <div className="h-4 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                </div>
                <div className="flex gap-2">
                    <div className="size-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
                    <div className="size-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
                </div>
            </div>

            {/* Quest Header Skeleton */}
            <div className="mb-8 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
                <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="h-8 w-3/4 animate-pulse rounded-md bg-neutral-200 sm:h-9 dark:bg-neutral-800"></div>
                    <div className="h-6 w-24 shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
                </div>

                <div className="mb-3 h-8 w-3/4 animate-pulse rounded-md bg-neutral-200 sm:h-9 dark:bg-neutral-800"></div>
                <div className="mb-2 h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                <div className="mb-6 h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>

                <div className="flex flex-col justify-between gap-4 border-t border-neutral-200/80 pt-4 sm:flex-row sm:items-center dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="size-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
                        <div className="space-y-1">
                            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                            <div className="h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        </div>
                    </div>
                    <div className="h-9 w-36 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
                </div>
            </div>

            {/* Recipe Replies Skeleton */}
            <div>
                <div className="mb-4 h-7 w-48 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="animate-pulse"
                        >
                            <div className="aspect-square w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800"></div>
                            <div className="mt-2 h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800"></div>
                            <div className="mt-2 h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestDetailSkeleton;
