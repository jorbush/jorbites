import Container from '@/app/components/utils/Container';

const WorkshopClientSkeleton = () => {
    return (
        <Container>
            <div className="mx-auto flex max-w-screen-lg flex-col gap-6 pt-2">
                {/* Workshop Head Skeleton */}
                <div>
                    {/* Navigation and title area with back/share buttons */}
                    <div className="flex items-baseline justify-between sm:mr-4 sm:ml-4">
                        {/* Back button */}
                        <div className="mr-4 flex translate-y-3 items-center space-x-2 text-gray-600 md:translate-y-0">
                            <div className="h-6 w-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                        </div>

                        {/* Title and date */}
                        <div className="flex flex-1 flex-col items-center">
                            <div className="mb-2 h-8 w-3/4 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        </div>

                        {/* Share button */}
                        <div className="ml-4 flex translate-y-3 items-center space-x-2 text-gray-600 md:translate-y-0">
                            <div className="h-6 w-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                        </div>
                    </div>

                    {/* Workshop image */}
                    <div className="relative mt-4 h-[60vh] w-full animate-pulse overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
                </div>

                {/* Workshop Info and Actions Grid Skeleton */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-7 md:gap-10">
                    {/* Workshop Info Skeleton */}
                    <div className="col-span-4 flex flex-col gap-8 pr-2 pl-2">
                        {/* Host info */}
                        <div className="flex flex-row items-center gap-2">
                            <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="flex flex-col gap-1">
                                <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>

                        <hr />

                        {/* Workshop details */}
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2"
                                >
                                    <div className="h-6 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    <div className="h-5 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                </div>
                            ))}
                        </div>

                        <hr />

                        {/* Description */}
                        <div className="flex flex-col gap-4">
                            <div className="h-6 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>

                        <hr />

                        {/* Ingredients */}
                        <div className="flex flex-col gap-4">
                            <div className="h-6 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions Sidebar Skeleton */}
                    <div className="order-first mb-10 md:order-last md:col-span-3">
                        <div className="sticky top-24 flex flex-col gap-4">
                            {/* Join/Edit button */}
                            <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700"></div>

                            {/* Info card */}
                            <div className="rounded-lg border p-4 dark:border-neutral-700">
                                <div className="space-y-2">
                                    <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    <div className="h-4 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default WorkshopClientSkeleton;
