import Container from '@/app/components/utils/Container';

const UserStatsSkeleton = () => {
    return (
        <Container>
            <div className="py-4">
                <div className="mb-4 h-7 w-48 animate-pulse rounded bg-neutral-200 px-2 dark:bg-neutral-700"></div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {/* Stat Cards Skeleton */}
                    {[1, 2, 3, 4].map((index) => (
                        <div
                            key={index}
                            className="dark:bg-dark flex flex-col rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700"
                        >
                            <div className="mb-2 flex items-center">
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-5 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                            <div className="mb-2 h-8 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 mb-4 h-7 w-48 animate-pulse rounded bg-neutral-200 px-2 dark:bg-neutral-700"></div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Preference Cards Skeleton */}
                    {[1, 2].map((index) => (
                        <div
                            key={index}
                            className="dark:bg-dark flex items-center rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700"
                        >
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="flex flex-col">
                                <div className="mb-1 h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-6 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default UserStatsSkeleton;
