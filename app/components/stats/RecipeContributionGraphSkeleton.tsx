import Container from '@/app/components/utils/Container';

const RecipeContributionGraphSkeleton = () => {
    return (
        <Container>
            <div className="w-full py-4">
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs sm:p-6 dark:border-neutral-700/60 dark:bg-neutral-800">
                    {/* Header with Title, Metrics, and Range Controls Skeleton */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="h-6 w-56 animate-pulse rounded-md bg-neutral-200 sm:h-7 dark:bg-neutral-700" />
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <div className="h-5 w-36 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                <div className="h-5 w-24 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                        </div>

                        {/* Range Selector Skeleton */}
                        <div className="h-7 w-28 animate-pulse self-start rounded-lg bg-neutral-200 sm:self-auto dark:bg-neutral-700" />
                    </div>

                    <div className="relative w-full overflow-x-auto pb-2">
                        <div className="relative inline-flex min-w-[600px] flex-col sm:min-w-0">
                            {/* Month labels skeleton */}
                            <div className="mb-2 flex min-w-[600px] gap-0.5 sm:min-w-0 sm:gap-1">
                                <div className="sticky left-0 z-10 w-6 shrink-0 bg-white sm:w-7 dark:bg-neutral-800" />
                                <div className="flex gap-0.5 sm:gap-1">
                                    {Array.from({ length: 53 }).map(
                                        (_, index) => (
                                            <div
                                                key={index}
                                                className="flex w-2.5 shrink-0 items-start justify-start sm:w-3"
                                            >
                                                {index % 13 === 0 && (
                                                    <div className="h-3 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Calendar grid skeleton */}
                            <div className="flex gap-0.5 sm:gap-1">
                                {/* Day labels skeleton - STICKY on left */}
                                <div className="sticky left-0 z-10 flex flex-col gap-0.5 bg-white pr-1.5 sm:gap-1 sm:pr-2 dark:bg-neutral-800">
                                    {Array.from({ length: 7 }).map(
                                        (_, index) => (
                                            <div
                                                key={index}
                                                className="flex h-2.5 items-center justify-end sm:h-3"
                                            >
                                                {index % 2 === 0 && (
                                                    <div className="h-2 w-5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Grid skeleton */}
                                <div className="flex gap-0.5 sm:gap-1">
                                    {Array.from({ length: 53 }).map(
                                        (_, weekIndex) => (
                                            <div
                                                key={weekIndex}
                                                className="flex shrink-0 flex-col gap-0.5 sm:gap-1"
                                            >
                                                {Array.from({ length: 7 }).map(
                                                    (_, dayIndex) => (
                                                        <div
                                                            key={dayIndex}
                                                            className="size-2.5 shrink-0 animate-pulse rounded-[2px] bg-neutral-200 sm:size-3 sm:rounded-sm dark:bg-neutral-700"
                                                        />
                                                    )
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legend skeleton */}
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 pt-1 sm:gap-4">
                        <div className="h-3 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="flex gap-0.5 sm:gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="size-2.5 animate-pulse rounded-[2px] bg-neutral-200 sm:size-3 sm:rounded-sm dark:bg-neutral-700"
                                />
                            ))}
                        </div>
                        <div className="h-3 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default RecipeContributionGraphSkeleton;
