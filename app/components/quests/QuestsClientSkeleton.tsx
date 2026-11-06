import Container from '@/app/components/utils/Container';

const QuestsClientSkeleton = () => {
    return (
        <Container>
            <div className="pt-2 pb-12 sm:pt-4">
                {/* Header Skeleton */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="size-11 animate-pulse rounded-xl bg-neutral-200 sm:size-12 dark:bg-neutral-800"></div>
                        <div>
                            <div className="mb-2 h-7 w-44 animate-pulse rounded-md bg-neutral-200 sm:h-8 sm:w-52 dark:bg-neutral-800"></div>
                            <div className="h-4 w-72 animate-pulse rounded bg-neutral-200 sm:w-96 dark:bg-neutral-800"></div>
                        </div>
                    </div>
                    <div className="hidden h-10 w-36 animate-pulse rounded-xl bg-neutral-200 md:block dark:bg-neutral-800"></div>
                </div>

                {/* Filters Skeleton */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-9 w-24 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"
                        ></div>
                    ))}
                </div>

                {/* Quest Cards Skeleton */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90"
                        >
                            <div>
                                {/* Header */}
                                <div className="mb-2 flex items-start justify-between gap-3">
                                    <div className="h-6 w-3/4 animate-pulse rounded-md bg-neutral-200 sm:h-7 dark:bg-neutral-800"></div>
                                    <div className="h-6 w-20 shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                                    <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
                                        <div className="space-y-1">
                                            <div className="h-3.5 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                                            <div className="h-3 w-14 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 w-14 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default QuestsClientSkeleton;
