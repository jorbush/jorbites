'use client';

import React from 'react';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';

interface RecipeSelectResultsProps {
    results: any[];
    isLoading: boolean;
    canShowNoResults: boolean;
    onSelectRecipe: (recipe: any) => void;
    t: any;
}

export const RecipeSelectResults: React.FC<RecipeSelectResultsProps> = ({
    results,
    isLoading,
    canShowNoResults,
    onSelectRecipe,
    t,
}) => {
    if (isLoading) {
        return (
            <div className="max-h-[300px] overflow-y-auto pr-1">
                <div className="py-6 text-center text-sm font-light text-neutral-400">
                    {t('loading') || 'Loading...'}
                </div>
            </div>
        );
    }

    if (results.length > 0) {
        return (
            <div className="max-h-[300px] overflow-y-auto pr-1">
                <div className="flex flex-col gap-2">
                    {results.map((recipe) => (
                        <button
                            key={recipe.id}
                            type="button"
                            onClick={() => onSelectRecipe(recipe)}
                            data-cy="recipe-select-option"
                            className="flex w-full cursor-pointer flex-row items-center gap-3 rounded-xl p-2 text-left transition-colors duration-200 hover:bg-neutral-100 focus:outline-hidden dark:hover:bg-neutral-800"
                        >
                            {recipe.imageSrc && (
                                <CustomProxyImage
                                    src={recipe.imageSrc}
                                    alt={recipe.title}
                                    width={48}
                                    height={48}
                                    className="size-12 shrink-0 rounded-lg object-cover"
                                />
                            )}
                            <div className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate text-sm font-semibold">
                                    {recipe.title}
                                </span>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-light text-neutral-400">
                                    {recipe.user && (
                                        <span>
                                            by {recipe.user.name || 'Anonymous'}
                                        </span>
                                    )}
                                    {typeof recipe.calories === 'number' && (
                                        <span className="font-medium text-neutral-500 dark:text-neutral-300">
                                            {recipe.calories} kcal
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-h-[300px] overflow-y-auto pr-1">
            {canShowNoResults ? (
                <div className="text-neutral-450 py-6 text-center text-sm font-light">
                    {t('no_recipes_found')}
                </div>
            ) : (
                <div className="text-neutral-450 py-8 text-center text-sm font-light dark:text-neutral-500">
                    {t('type_to_search') ||
                        'Type at least 2 characters to search'}
                </div>
            )}
        </div>
    );
};
