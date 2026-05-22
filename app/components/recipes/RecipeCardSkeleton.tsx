import React from 'react';

const RecipeCardSkeleton: React.FC = () => {
    return (
        <div className="col-span-1 animate-pulse">
            <div className="flex w-full flex-col gap-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-6 w-3/4 rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-1/4 rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
        </div>
    );
};

export default RecipeCardSkeleton;
