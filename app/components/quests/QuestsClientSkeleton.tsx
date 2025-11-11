import Container from '@/app/components/utils/Container';

const QuestsClientSkeleton = () => {
    return (
        <Container>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header Skeleton */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 h-9 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="h-5 w-96 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                    <div className="h-12 w-40 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700"></div>
                </div>

                {/* Filters Skeleton */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-10 w-24 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"
                        ></div>
                    ))}
                </div>

                {/* Quest Cards Skeleton */}
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            {/* Header */}
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                                    </div>
                                    <div className="mb-2 h-7 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                                    <div className="space-y-1">
                                        <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                        <div className="h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    </div>
                                </div>
                                <div className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default QuestsClientSkeleton;
