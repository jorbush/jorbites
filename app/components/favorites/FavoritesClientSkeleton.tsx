import Container from '@/app/components/utils/Container';
import RecipeCardSkeleton from '@/app/components/recipes/RecipeCardSkeleton';

const FavoritesClientSkeleton = () => {
    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4">
                {/* Header Skeleton */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3.5">
                        <div className="size-11 animate-pulse rounded-xl bg-neutral-200 sm:size-12 dark:bg-neutral-800"></div>
                        <div>
                            <div className="mb-2 h-7 w-40 animate-pulse rounded-md bg-neutral-200 sm:h-8 sm:w-48 dark:bg-neutral-800"></div>
                            <div className="h-4 w-64 animate-pulse rounded bg-neutral-200 sm:w-80 dark:bg-neutral-800"></div>
                        </div>
                    </div>
                    <div className="h-10 w-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
                </div>

                {/* Recipe Grid Skeleton */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                        <RecipeCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default FavoritesClientSkeleton;
