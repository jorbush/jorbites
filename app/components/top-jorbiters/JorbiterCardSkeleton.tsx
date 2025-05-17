const JorbiterCardSkeleton = () => {
    return (
        <div className="dark:bg-dark relative overflow-hidden rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700">
            <div className="flex items-center justify-between">
                {/* Left section - Avatar and Basic Info */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex items-center justify-center">
                        <div className="h-6 w-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                    <div className="relative">
                        <div className="h-[50px] w-[50px] animate-pulse rounded-full bg-neutral-200 sm:h-[65px] sm:w-[65px] md:h-[70px] md:w-[70px] dark:bg-neutral-700"></div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center gap-1">
                            <div className="h-6 w-24 animate-pulse rounded bg-neutral-200 sm:h-7 sm:w-32 md:h-8 md:w-40 dark:bg-neutral-700"></div>
                        </div>
                        <div className="mt-1 h-4 w-16 animate-pulse rounded bg-neutral-200 sm:h-5 sm:w-20 dark:bg-neutral-700"></div>
                    </div>
                </div>

                {/* Right section - Stats */}
                <div className="flex flex-row items-end gap-0 sm:gap-6 md:gap-6">
                    {/* Recipes stat */}
                    <div className="flex flex-col items-center">
                        <div className="h-6 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="mt-1 h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>

                    {/* Favorites stat */}
                    <div className="flex flex-col items-center">
                        <div className="h-6 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="mt-1 h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>

                    {/* Badges stat */}
                    <div className="flex flex-col items-center">
                        <div className="h-6 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="mt-1 h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JorbiterCardSkeleton;
