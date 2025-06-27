import Container from '@/app/components/utils/Container';

const UserStatsSkeleton = () => {
    return (
        <Container>
            <div className="py-4">
                <div className="mb-4 h-7 w-48 animate-pulse rounded bg-neutral-200 px-2 dark:bg-neutral-700"></div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {/* Stat Cards Skeleton - match StatCard layout */}
                    {[1, 2, 3, 4].map((index) => (
                        <div
                            key={index}
                            className="rounded-lg bg-white p-3 shadow-xs dark:bg-gray-800"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col">
                                    {/* Title skeleton */}
                                    <div className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    {/* Value skeleton */}
                                    <div className="mt-1 h-8 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                </div>
                                {/* Icon skeleton */}
                                <div className="rounded-full bg-neutral-200 p-2 dark:bg-neutral-700">
                                    <div className="h-5 w-5 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600"></div>
                                </div>
                            </div>
                            {/* Footer skeleton */}
                            <div className="mt-3 flex items-center">
                                <div className="h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 mb-4 h-7 w-48 animate-pulse rounded bg-neutral-200 px-2 dark:bg-neutral-700"></div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Preference Cards Skeleton - match PreferenceCard layout */}
                    {[1, 2].map((index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-xs dark:bg-gray-800"
                        >
                            {/* Icon skeleton */}
                            <div className="rounded-full bg-neutral-200 p-3 dark:bg-neutral-700">
                                <div className="h-5 w-5 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600"></div>
                            </div>
                            <div>
                                {/* Title skeleton */}
                                <div className="mb-1 h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                {/* Value skeleton */}
                                <div className="h-5 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default UserStatsSkeleton;
