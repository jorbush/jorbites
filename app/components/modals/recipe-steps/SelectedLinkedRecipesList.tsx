'use client';

import React from 'react';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import { AiFillDelete } from 'react-icons/ai';

interface SelectedLinkedRecipesListProps {
    selectedLinkedRecipes: any[];
    onRemoveLinkedRecipe: (recipeId: string) => void;
    t: (key: string) => string;
}

export const SelectedLinkedRecipesList: React.FC<
    SelectedLinkedRecipesListProps
> = ({ selectedLinkedRecipes, onRemoveLinkedRecipe, t }) => {
    if (selectedLinkedRecipes.length === 0) return null;

    return (
        <div>
            <h3 className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t('selected_linked_recipes') || 'Selected Linked Recipes'}
                <span className="ml-1 text-xs text-neutral-400 dark:text-neutral-500">
                    ({selectedLinkedRecipes.length}/2)
                </span>
            </h3>
            <div className="flex flex-col gap-2">
                {selectedLinkedRecipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="flex items-center justify-between rounded-lg border border-neutral-300 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900"
                    >
                        <div className="flex items-center gap-2">
                            <div className="relative size-10 overflow-hidden rounded-md">
                                <CustomProxyImage
                                    src={recipe.imageSrc || '/avocado.webp'}
                                    fill
                                    className="object-cover"
                                    alt={recipe.title}
                                    quality="auto:eco"
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    {recipe.title}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {recipe.user.name}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemoveLinkedRecipe(recipe.id)}
                            className="text-neutral-500 hover:text-rose-500 dark:text-neutral-400 dark:hover:text-rose-500"
                        >
                            <AiFillDelete size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
