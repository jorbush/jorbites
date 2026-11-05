import Container from '@/app/components/utils/Container';

const UserStatsSkeleton = () => {
    return (
        <Container>
            <div className="py-4">
                {/* Header Skeleton */}
                <div className="mb-4 flex items-center gap-2 px-1">
                    <div className="size-7 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-6 w-44 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                    {/* Stat Cards Skeleton - match StatCard layout */}
                    {[1, 2, 3, 4].map((index) => (
                        <div
                            key={index}
                            className="flex flex-col justify-between rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-800/90 sm:p-5"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2">
                                    {/* Title skeleton */}
                                    <div className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                                    {/* Icon skeleton */}
                                    <div className="size-9 shrink-0 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700 sm:size-10" />
                                </div>
                                {/* Value skeleton */}
                                <div className="mt-2 h-8 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                            {/* Footer skeleton */}
                            <div className="mt-3.5 flex items-center border-t border-neutral-100 pt-2.5 dark:border-neutral-800/80">
                                <div className="h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preferences Header Skeleton */}
                <div className="mb-4 mt-8 flex items-center gap-2 px-1">
                    <div className="size-7 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-6 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {/* Preference Cards Skeleton - match PreferenceCard layout */}
                    {[1, 2].map((index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-800/90 sm:gap-4 sm:p-5"
                        >
                            {/* Icon skeleton */}
                            <div className="size-11 shrink-0 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700 sm:size-12" />
                            <div className="flex flex-col gap-1.5">
                                {/* Title skeleton */}
                                <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                                {/* Value skeleton */}
                                <div className="h-5 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default UserStatsSkeleton;
