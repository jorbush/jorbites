const ChefCardSkeleton = () => {
    return (
        <div
            className="group animate-pulse cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-offset-gray-900"
            data-cy="chef-card-skeleton"
            data-testid="chef-card-skeleton"
        >
            {/* Header with gradient background */}
            <div className="relative h-24 bg-gray-200 dark:bg-gray-700" />

            {/* Avatar overlapping the header */}
            <div className="relative -mt-12 flex flex-col items-center px-4 pb-4">
                <div className="mb-3 rounded-full border-4 border-white bg-gray-300 dark:border-gray-800 dark:bg-gray-600">
                    <div className="h-24 w-24 rounded-full" />
                </div>

                {/* Chef Name */}
                <div className="mb-2 flex w-full flex-col items-center gap-2">
                    <div className="h-5 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-1/2 rounded-lg bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Most Used Category */}
                <div className="mb-3 h-4 w-1/3 rounded-lg bg-gray-200 dark:bg-gray-700" />

                {/* Stats Grid */}
                <div className="mt-2 grid w-full grid-cols-3 gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                    {/* Recipes */}
                    <div className="flex flex-col items-center">
                        <div className="mb-1 h-5 w-5 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="h-5 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="mt-1 h-3 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    </div>

                    {/* Likes */}
                    <div className="flex flex-col items-center">
                        <div className="mb-1 h-5 w-5 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="h-5 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="mt-1 h-3 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-col items-center">
                        <div className="mb-1 h-5 w-5 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="h-5 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="mt-1 h-3 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    </div>
                </div>

                {/* Recent Activity Indicator */}
                <div className="mt-4 h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-700/50" />

                {/* Average likes indicator */}
                <div className="mt-2 h-3 w-2/3 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
        </div>
    );
};

export default ChefCardSkeleton;
