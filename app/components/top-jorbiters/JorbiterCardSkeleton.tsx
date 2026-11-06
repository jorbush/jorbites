const JorbiterCardSkeleton = () => {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs sm:p-5 dark:border-neutral-800 dark:bg-neutral-900/90">
            <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between md:gap-4">
                {/* Left section - Avatar and Basic Info */}
                <div className="flex min-w-0 items-center gap-3 md:gap-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200/60 bg-neutral-50 md:size-10 dark:border-neutral-800 dark:bg-neutral-800/60">
                        <div className="size-5 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                    <div className="relative shrink-0">
                        <div className="size-11 animate-pulse rounded-full bg-neutral-200 md:size-14 dark:bg-neutral-700"></div>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="h-5 w-24 animate-pulse rounded bg-neutral-200 md:w-32 dark:bg-neutral-700"></div>
                        <div className="mt-1.5 h-3.5 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                </div>

                {/* Right section - Stats Shelf */}
                <div className="flex w-full items-center justify-around rounded-xl border border-neutral-100/80 bg-neutral-50/70 px-3 py-2.5 md:w-auto md:justify-end md:gap-6 md:border-0 md:bg-transparent md:p-0 dark:border-neutral-800/60 dark:bg-neutral-800/50 md:dark:bg-transparent">
                    {/* Recipes stat */}
                    <div className="flex flex-col items-center">
                        <div className="h-5 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="mt-1 h-3 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>

                    {/* Favorites stat */}
                    <div className="flex flex-col items-center">
                        <div className="h-5 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="mt-1 h-3 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>

                    {/* Badges stat */}
                    <div className="flex flex-col items-center">
                        <div className="h-5 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="mt-1 h-3 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JorbiterCardSkeleton;
