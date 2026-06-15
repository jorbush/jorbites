import ChefCardSkeleton from './ChefCardSkeleton';

interface ChefsListSkeletonProps {
    count?: number;
}

const FILTER_PILLS = ['fp1', 'fp2', 'fp3', 'fp4', 'fp5', 'fp6', 'fp7'];
const CHEF_SKELETONS = Array.from({ length: 20 }, (_, i) => `cs-${i}`);

const ChefsListSkeleton: React.FC<ChefsListSkeletonProps> = ({
    count = 12,
}) => {
    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                    <div>
                        <div className="h-8 w-32 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                        <div className="mt-2 h-4 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="h-12 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-12 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                </div>

                {/* Order By Filter Pills */}
                <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <div className="flex min-w-max gap-2 pb-2">
                        {FILTER_PILLS.map((id) => (
                            <div
                                key={id}
                                className="h-10 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Chefs Grid */}
            <div
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                data-cy="chefs-list-skeleton"
                data-testid="chefs-list-skeleton"
            >
                {CHEF_SKELETONS.slice(0, count).map((id) => (
                    <ChefCardSkeleton key={id} />
                ))}
            </div>
        </div>
    );
};

export default ChefsListSkeleton;
