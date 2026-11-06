const ChefCardSkeleton = () => {
    return (
        <div
            className="group animate-pulse overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-800/90"
            data-cy="chef-card-skeleton"
            data-testid="chef-card-skeleton"
        >
            {/* Level badge placeholder */}
            <div className="mb-2 flex w-full justify-end">
                <div className="h-5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>

            {/* Avatar placeholder */}
            <div className="my-2 flex justify-center">
                <div className="size-24 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>

            {/* Chef Name placeholder */}
            <div className="mt-1 flex flex-col items-center gap-1.5">
                <div className="h-5 w-32 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-3.5 w-20 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            </div>

            {/* Stats Grid Shelf placeholder */}
            <div className="mt-4 grid w-full grid-cols-3 gap-2 rounded-xl border border-neutral-100 bg-neutral-50/70 p-2.5 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                <div className="flex flex-col items-center gap-1">
                    <div className="size-3.5 rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-4 w-6 rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-2.5 w-10 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="size-3.5 rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-4 w-6 rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-2.5 w-10 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="size-3.5 rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-4 w-6 rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-2.5 w-10 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
            </div>

            {/* Recent Activity Indicator placeholder */}
            <div className="mt-3 h-8 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800/50" />
        </div>
    );
};

export default ChefCardSkeleton;
