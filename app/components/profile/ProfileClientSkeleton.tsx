import Container from '@/app/components/utils/Container';

const ProfileClientSkeleton = () => {
    return (
        <Container>
            {/* Tabs skeleton */}
            <div className="mt-2 mb-8 flex border-b border-neutral-200 dark:border-neutral-600">
                <div className="flex flex-1 items-center justify-center gap-2 py-2">
                    <div className="size-5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-5 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
                <div className="flex flex-1 items-center justify-center gap-2 py-2">
                    <div className="size-5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-5 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
            </div>

            {/* Dropdown filter skeleton */}
            <div className="mb-4 flex justify-end">
                <div className="h-9 w-36 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700"></div>
            </div>

            {/* Card Skeletons Grid */}
            <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div
                        key={index}
                        className="dark:bg-dark col-span-1 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700"
                    >
                        {/* Image placeholder */}
                        <div className="aspect-square w-full animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>

                        {/* Content placeholder */}
                        <div className="p-4">
                            <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="mb-4 flex items-center">
                                <div className="mr-2 size-4 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="h-4 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-4 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    );
};

export default ProfileClientSkeleton;
