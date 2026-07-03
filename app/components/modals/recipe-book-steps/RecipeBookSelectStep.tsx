'use client';

import { useTranslation } from 'react-i18next';
import { SafeRecipe } from '@/app/types';
import { RecipeBookAction } from '@/app/hooks/recipeBookReducer';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import Loader from '@/app/components/shared/Loader';
import { FiCheck } from 'react-icons/fi';

interface RecipeBookSelectStepProps {
    recipes: SafeRecipe[];
    isLoadingRecipes: boolean;
    selectedRecipeIds: Set<string>;
    dispatch: (action: RecipeBookAction) => void;
}

const RecipeBookSelectStep: React.FC<RecipeBookSelectStepProps> = ({
    recipes,
    isLoadingRecipes,
    selectedRecipeIds,
    dispatch,
}) => {
    const { t } = useTranslation();

    const allSelected =
        recipes.length > 0 && selectedRecipeIds.size === recipes.length;
    const noneSelected = selectedRecipeIds.size === 0;

    const handleBulkToggle = () => {
        if (allSelected || !noneSelected) {
            dispatch({ type: 'DESELECT_ALL_RECIPES' });
        } else {
            dispatch({ type: 'SELECT_ALL_RECIPES' });
        }
    };

    if (isLoadingRecipes) {
        return <Loader height="240px" />;
    }

    if (recipes.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center py-12 text-sm font-light text-neutral-400 dark:text-neutral-500"
                data-testid="no-recipes-message"
            >
                {t('no_recipes_to_select') || 'No recipes found'}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header: count + bulk action */}
            <div className="flex items-center justify-between">
                <span
                    className="text-sm font-medium text-neutral-500 dark:text-neutral-400"
                    data-testid="recipes-selected-count"
                >
                    {t('recipes_selected', {
                        count: selectedRecipeIds.size,
                        total: recipes.length,
                    }) ||
                        `${selectedRecipeIds.size} of ${recipes.length} selected`}
                </span>
                <button
                    type="button"
                    onClick={handleBulkToggle}
                    data-testid="bulk-toggle-button"
                    className="text-sm font-medium text-green-600 transition hover:opacity-70 dark:text-green-400"
                >
                    {allSelected
                        ? t('deselect_all') || 'Deselect all'
                        : t('select_all') || 'Select all'}
                </button>
            </div>

            {/* Recipe list */}
            <div
                className="flex max-h-[340px] flex-col gap-2 overflow-y-auto pr-1"
                data-testid="recipe-list"
            >
                {recipes.map((recipe) => {
                    const isSelected = selectedRecipeIds.has(recipe.id);
                    return (
                        <button
                            key={recipe.id}
                            type="button"
                            data-testid={`recipe-item-${recipe.id}`}
                            onClick={() =>
                                dispatch({
                                    type: 'TOGGLE_RECIPE',
                                    payload: recipe.id,
                                })
                            }
                            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition ${
                                isSelected
                                    ? 'border-green-500/30 bg-green-50 dark:border-green-500/20 dark:bg-green-500/10'
                                    : 'border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800'
                            }`}
                            aria-pressed={isSelected}
                        >
                            {/* Checkbox indicator */}
                            <span
                                className={`flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                                    isSelected
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : 'border-neutral-300 dark:border-neutral-600'
                                }`}
                                aria-hidden="true"
                            >
                                {isSelected && (
                                    <FiCheck
                                        size={12}
                                        strokeWidth={3}
                                    />
                                )}
                            </span>

                            {/* Recipe thumbnail */}
                            {recipe.imageSrc ? (
                                <div className="shrink-0 overflow-hidden rounded-lg">
                                    <CustomProxyImage
                                        src={recipe.imageSrc}
                                        alt={recipe.title}
                                        width={44}
                                        height={44}
                                        className="size-11 object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="size-11 shrink-0 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                            )}

                            {/* Recipe info */}
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                    {recipe.title}
                                </span>
                                {recipe.categories &&
                                    recipe.categories.length > 0 && (
                                        <span className="truncate text-xs font-light text-neutral-400 dark:text-neutral-500">
                                            {recipe.categories
                                                .slice(0, 2)
                                                .join(', ')}
                                        </span>
                                    )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default RecipeBookSelectStep;
