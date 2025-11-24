import ChefCardSkeleton from './ChefCardSkeleton';

interface ChefsListSkeletonProps {
    count?: number;
}

const ChefsListSkeleton: React.FC<ChefsListSkeletonProps> = ({
    count = 12,
}) => {
    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                    <div>
                        <div className="h-8 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="mt-2 h-4 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="h-12 flex-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="h-12 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Order By Filter Pills */}
                <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <div className="flex min-w-max gap-2 pb-2">
                        {[...Array(7)].map((_, i) => (
                            <div
                                key={i}
                                className="h-10 w-24 rounded-full bg-gray-200 dark:bg-gray-700"
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
                {[...Array(count)].map((_, i) => (
                    <ChefCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
};

export default ChefsListSkeleton;
