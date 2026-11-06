import Container from '@/app/components/utils/Container';

const LikesClientSkeleton = () => {
    return (
        <Container>
            <div className="mx-auto w-full max-w-[800px] pt-2 pb-12 sm:pt-4">
                {/* Back button skeleton */}
                <div className="mb-5 flex items-center gap-2.5">
                    <div className="size-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
                    <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                </div>

                {/* Recipe preview header card skeleton */}
                <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:p-5 dark:border-neutral-800 dark:bg-neutral-900/90">
                    <div className="size-16 animate-pulse rounded-xl bg-neutral-200 sm:size-20 dark:bg-neutral-800"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        <div className="h-4 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                    </div>
                    <div className="h-7 w-20 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
                </div>

                {/* Users list skeleton */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-11 animate-pulse rounded-full bg-neutral-200 sm:size-12 dark:bg-neutral-800"></div>
                                <div className="space-y-1.5">
                                    <div className="h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                                    <div className="h-3.5 w-14 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="size-7 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
                                <div className="size-7 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default LikesClientSkeleton;
