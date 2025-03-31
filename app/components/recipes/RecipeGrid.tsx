import RecipeCardSkeleton from '@/app/components/recipes/RecipeCardSkeleton';

export const RecipeGrid = () => (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array(12)
            .fill(0)
            .map((_, i) => (
                <RecipeCardSkeleton key={i} />
            ))}
    </div>
);
