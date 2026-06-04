const ChefCardSkeleton = () => {
    return (
        <div
            className="group animate-pulse cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:ring-offset-neutral-900"
            data-cy="chef-card-skeleton"
            data-testid="chef-card-skeleton"
        >
            {/* Header with gradient background */}
            <div className="relative h-24 bg-neutral-200 dark:bg-neutral-700" />

            {/* Avatar overlapping the header */}
            <div className="relative -mt-12 flex flex-col items-center px-4 pb-4">
                <div className="mb-3 rounded-full border-4 border-white bg-neutral-300 dark:border-neutral-800 dark:bg-neutral-600">
                    <div className="size-24 rounded-full" />
                </div>

                {/* Chef Name */}
                <div className="mb-2 flex w-full flex-col items-center gap-2">
                    <div className="h-5 w-3/4 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-4 w-1/2 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                </div>

                {/* Most Used Category */}
                <div className="mb-3 h-4 w-1/3 rounded-lg bg-neutral-200 dark:bg-neutral-700" />

                {/* Stats Grid */}
                <div className="mt-2 grid w-full grid-cols-3 gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                    {/* Recipes */}
                    <div className="flex flex-col items-center">
                        <div className="mb-1 size-5 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-5 w-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                        <div className="mt-1 h-3 w-12 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                    </div>

                    {/* Likes */}
                    <div className="flex flex-col items-center">
                        <div className="mb-1 size-5 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-5 w-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                        <div className="mt-1 h-3 w-10 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-col items-center">
                        <div className="mb-1 size-5 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-5 w-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                        <div className="mt-1 h-3 w-12 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>

                {/* Recent Activity Indicator */}
                <div className="mt-4 h-10 w-full rounded-lg bg-neutral-100 dark:bg-neutral-700/50" />

                {/* Average likes indicator */}
                <div className="mt-2 h-3 w-2/3 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            </div>
        </div>
    );
};

export default ChefCardSkeleton;
