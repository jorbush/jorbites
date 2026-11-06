import Container from '@/app/components/utils/Container';

const RecipeDetailSkeleton = () => {
    return (
        <Container>
            <div className="mx-auto max-w-[800px] pt-2 pb-12 sm:pt-4">
                <div className="flex flex-col gap-6">
                    {/* Header Skeleton */}
                    <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6 sm:gap-4 sm:px-2">
                        <div className="size-9 animate-pulse rounded-xl bg-neutral-200 md:h-9 md:w-20 dark:bg-neutral-800"></div>
                        <div className="flex flex-1 flex-col items-center">
                            <div className="mb-2 h-7 w-3/4 max-w-md animate-pulse rounded-md bg-neutral-200 sm:h-8 dark:bg-neutral-800"></div>
                            <div className="h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        </div>
                        <div className="size-9 animate-pulse rounded-xl bg-neutral-200 md:h-9 md:w-20 dark:bg-neutral-800"></div>
                    </div>

                    {/* Hero Image Skeleton */}
                    <div className="relative h-[60vh] w-full animate-pulse overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800"></div>

                    {/* Chef Info Card Skeleton */}
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs sm:p-5 dark:border-neutral-800 dark:bg-neutral-900/90">
                        <div className="flex items-center gap-3">
                            <div className="size-11 animate-pulse rounded-full bg-neutral-200 sm:size-12 dark:bg-neutral-800"></div>
                            <div className="flex flex-col gap-1.5">
                                <div className="h-5 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                                <div className="h-4 w-16 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
                            <div className="size-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
                            <div className="h-5 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        </div>
                    </div>

                    {/* Inset Metadata Shelf Skeleton */}
                    <div className="flex flex-wrap items-center justify-around gap-3 rounded-xl border border-neutral-100/80 bg-neutral-50/70 p-3 sm:gap-6 sm:p-3.5 dark:border-neutral-800/60 dark:bg-neutral-800/50">
                        <div className="h-5 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        <div className="h-5 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        <div className="h-5 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        <div className="h-5 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                    </div>

                    {/* Description Skeleton */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
                        <div className="space-y-2">
                            <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                            <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                            <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        </div>
                    </div>

                    {/* Ingredients Skeleton */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
                        <div className="mb-4 h-6 w-32 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
                        <div className="space-y-3">
                            <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                            <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                            <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        </div>
                    </div>

                    {/* Steps Skeleton */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
                        <div className="mb-4 h-6 w-24 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
                        <div className="space-y-4">
                            <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
                            <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
                            <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default RecipeDetailSkeleton;
