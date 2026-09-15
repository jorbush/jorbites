import Container from '@/app/components/utils/Container';

const RecipeContributionGraphSkeleton = () => {
    return (
        <Container>
            <div className="w-full py-4">
                {/* Title skeleton */}
                <div className="mb-4 px-2">
                    <div className="h-6 w-64 animate-pulse rounded bg-neutral-200 sm:h-7 dark:bg-neutral-700" />
                </div>

                <div className="flex justify-center">
                    <div className="w-full max-w-4xl overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                        <div className="relative inline-flex min-w-[600px] flex-col">
                            {/* Month labels skeleton */}
                            <div className="mb-2 flex min-w-[600px] gap-0.5 sm:gap-1">
                                <div className="dark:bg-dark sticky left-0 z-10 w-6 shrink-0 bg-white sm:w-7" />
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
                                {/* Day labels skeleton - sticky on left */}
                                <div className="dark:bg-dark sticky left-0 z-10 flex flex-col gap-0.5 bg-white pr-1.5 sm:gap-1 sm:pr-2">
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
                                                            className="aspect-square size-2.5 shrink-0 animate-pulse rounded-xs bg-neutral-200 sm:size-3 sm:rounded-sm dark:bg-neutral-700"
                                                        />
                                                    )
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Legend skeleton */}
                            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 px-2 sm:gap-4">
                                <div className="h-3 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                                <div className="flex gap-0.5 sm:gap-1">
                                    {Array.from({ length: 5 }).map(
                                        (_, index) => (
                                            <div
                                                key={index}
                                                className="size-2.5 shrink-0 animate-pulse rounded-xs bg-neutral-200 sm:size-3 sm:rounded-sm dark:bg-neutral-700"
                                            />
                                        )
                                    )}
                                </div>
                                <div className="h-3 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default RecipeContributionGraphSkeleton;
