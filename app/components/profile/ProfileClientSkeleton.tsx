import Container from '@/app/components/utils/Container';

const ProfileClientSkeleton = () => {
    return (
        <Container>
            {/* Tabs skeleton */}
            <div className="mt-2 mb-6 flex gap-2 overflow-x-auto pb-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"
                    ></div>
                ))}
            </div>

            {/* Search bar & Dropdown filter skeleton */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="h-10 w-full animate-pulse rounded-xl bg-neutral-200 md:max-w-sm lg:w-72 xl:w-80 dark:bg-neutral-700"></div>
                <div className="flex justify-end">
                    <div className="h-9 w-36 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
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
