import Container from '@/app/components/utils/Container';

const ProfileClientSkeleton = () => {
    return (
        <Container>
            <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {/* Recipe Card Skeletons */}
                {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div
                        key={index}
                        className="dark:bg-dark col-span-1 overflow-hidden rounded-xl border-[1px] border-neutral-200 bg-white dark:border-neutral-700"
                    >
                        {/* Image placeholder */}
                        <div className="aspect-square w-full animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>

                        {/* Content placeholder */}
                        <div className="p-4">
                            <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="mb-4 flex items-center">
                                <div className="mr-2 h-4 w-4 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
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
