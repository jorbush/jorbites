'use client';

const QuestDetailSkeleton = () => {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Back button skeleton */}
            <div className="mb-6">
                <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* Quest Header Skeleton */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex gap-2">
                        <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                </div>

                <div className="mb-4 h-9 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="mb-6 h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div>
                            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                    </div>
                    <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                </div>
            </div>

            {/* Recipe Replies Skeleton */}
            <div>
                <div className="mb-4 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="animate-pulse"
                        >
                            <div className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                            <div className="mt-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestDetailSkeleton;
