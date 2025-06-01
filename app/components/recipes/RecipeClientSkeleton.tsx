import Container from '@/app/components/utils/Container';

const RecipeClientSkeleton = () => {
    return (
        <Container>
            <div className="mx-auto max-w-[800px]">
                <div className="flex flex-col gap-6">
                    {/* Recipe Head Skeleton */}
                    <div>
                        {/* Navigation and title area with back/share buttons */}
                        <div className="flex items-baseline justify-between sm:mr-4 sm:ml-4">
                            {/* Back button */}
                            <div className="mr-4 flex translate-y-3 items-center space-x-2 text-gray-600 md:translate-y-0">
                                <div className="h-6 w-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>

                            {/* Title and minutes */}
                            <div className="flex flex-1 flex-col items-center">
                                <div className="mb-2 h-8 w-3/4 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-5 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>

                            {/* Share button */}
                            <div className="ml-4 flex translate-y-3 items-center space-x-2 text-gray-600 md:translate-y-0">
                                <div className="h-6 w-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>

                        {/* Recipe image */}
                        <div className="relative mt-4 h-[60vh] w-full animate-pulse overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>

                    {/* Recipe Info Skeleton */}
                    <div className="mt-1 grid grid-cols-1 md:grid-cols-1 md:gap-10">
                        <div>
                            {/* User info */}
                            <div className="mb-4 flex items-center gap-3">
                                <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-6 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>

                            {/* Category and Method */}
                            <div className="mb-4 flex flex-wrap gap-2">
                                <div className="h-8 w-24 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-8 w-24 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <div className="mb-2 h-6 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div className="mb-6">
                                <div className="mb-2 h-6 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="mb-6">
                                <div className="mb-2 h-6 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="space-y-2"
                                        >
                                            <div className="h-5 w-1/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                            <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                            <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comments Skeleton */}
                    <div>
                        <div className="mb-4 h-6 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="flex gap-3"
                                >
                                    <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                                    <div className="flex-1">
                                        <div className="mb-1 h-4 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                        <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default RecipeClientSkeleton;
