import Container from '@/app/components/utils/Container';

const RecipeContributionGraphSkeleton = () => {
    return (
        <Container>
            <div className="w-full py-4">
                {/* Title skeleton */}
                <div className="mb-4 px-2">
                    <div className="h-6 w-64 animate-pulse rounded bg-neutral-200 sm:h-7 dark:bg-neutral-700"></div>
                </div>

                <div className="flex justify-center">
                    <div className="w-full max-w-4xl overflow-x-auto">
                        <div className="relative min-w-[600px] sm:min-w-0">
                            {/* Month labels skeleton */}
                            <div className="mb-2 flex min-w-[600px] gap-0.5 sm:min-w-0 sm:gap-1">
                                <div className="w-6 shrink-0 sm:w-7" />
                                <div className="flex gap-0.5 sm:gap-1">
                                    {Array.from({ length: 53 }).map(
                                        (_, index) => (
                                            <div
                                                key={index}
                                                className="flex w-2.5 items-start justify-start sm:w-3"
                                            >
                                                {index % 13 === 0 && (
                                                    <div className="h-3 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Calendar grid skeleton */}
                            <div className="flex gap-0.5 sm:gap-1">
                                {/* Day labels skeleton */}
                                <div className="flex flex-col gap-0.5 pr-1.5 sm:gap-1 sm:pr-2">
                                    {Array.from({ length: 7 }).map(
                                        (_, index) => (
                                            <div
                                                key={index}
                                                className="flex h-2.5 items-center justify-end sm:h-3"
                                            >
                                                {index % 2 === 0 && (
                                                    <div className="h-2 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
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
                                                className="flex flex-col gap-0.5 sm:gap-1"
                                            >
                                                {Array.from({ length: 7 }).map(
                                                    (_, dayIndex) => (
                                                        <div
                                                            key={dayIndex}
                                                            className="h-2.5 w-2.5 animate-pulse rounded-sm bg-neutral-200 sm:h-3 sm:w-3 dark:bg-neutral-700"
                                                        />
                                                    )
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Legend skeleton */}
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 px-2 sm:gap-4">
                                <div className="h-3 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="flex gap-0.5 sm:gap-1">
                                    {Array.from({ length: 5 }).map(
                                        (_, index) => (
                                            <div
                                                key={index}
                                                className="h-2.5 w-2.5 animate-pulse rounded-sm bg-neutral-200 sm:h-3 sm:w-3 dark:bg-neutral-700"
                                            />
                                        )
                                    )}
                                </div>
                                <div className="h-3 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default RecipeContributionGraphSkeleton;
