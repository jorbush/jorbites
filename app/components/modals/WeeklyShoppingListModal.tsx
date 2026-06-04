'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';
import Modal from '@/app/components/modals/Modal';
import { SafePlanningMeal } from '@/app/types';

interface WeeklyShoppingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    meals: SafePlanningMeal[];
    planningName: string;
}

const WeeklyShoppingListModal: React.FC<WeeklyShoppingListModalProps> = ({
    isOpen,
    onClose,
    meals,
    planningName,
}) => {
    const { t } = useTranslation();
    const [checkedIngredients, setCheckedIngredients] = useState<
        Record<string, boolean>
    >({});

    // Extract all ingredients and their check status
    const allIngredients = useMemo(() => {
        const ingredientsByRecipe: Record<
            string,
            { recipeTitle: string; items: string[] }
        > = {};
        const consolidatedSet = new Set<string>();

        meals.forEach((meal) => {
            if (meal.recipe) {
                const recipeId = meal.recipe.id;
                if (!ingredientsByRecipe[recipeId]) {
                    ingredientsByRecipe[recipeId] = {
                        recipeTitle: meal.recipe.title,
                        items: [],
                    };
                }
                const recipeIngredients = meal.recipe.ingredients || [];
                recipeIngredients.forEach((ing: string) => {
                    if (!ingredientsByRecipe[recipeId].items.includes(ing)) {
                        ingredientsByRecipe[recipeId].items.push(ing);
                    }
                    consolidatedSet.add(ing);
                });
            }
        });

        return {
            byRecipe: Object.values(ingredientsByRecipe),
            consolidated: Array.from(consolidatedSet),
        };
    }, [meals]);

    // Copy ingredients checklist to clipboard
    const copyShoppingListToClipboard = () => {
        let text = `${planningName} - ${t('shopping_list')}\n\n`;
        allIngredients.byRecipe.forEach((recipe) => {
            text += `■ ${recipe.recipeTitle}:\n`;
            recipe.items.forEach((ing) => {
                const isChecked = checkedIngredients[ing] ? ' [x]' : ' [ ]';
                text += `  ${isChecked} ${ing}\n`;
            });
            text += '\n';
        });

        navigator.clipboard.writeText(text);
        toast.success(t('list_copied_success'));
    };

    const bodyContent = (
        <div className="flex flex-col gap-4 text-black dark:text-white">
            {allIngredients.consolidated.length === 0 ? (
                <div className="py-6 text-center font-light text-neutral-500">
                    {t('no_recipes_yet')}
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Grouped by Recipe Accordions */}
                    <div
                        className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1 md:max-h-[350px]"
                        data-testid="ingredients-scroll-container"
                    >
                        {allIngredients.byRecipe.map((recipe, rIdx) => (
                            <div
                                key={rIdx}
                                className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50/30 p-3 dark:border-neutral-800 dark:bg-neutral-950/20"
                            >
                                <div className="border-b border-neutral-100 pb-1.5 text-sm font-bold dark:border-neutral-900">
                                    {recipe.recipeTitle}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {recipe.items.map((ing, iIdx) => {
                                        const isChecked =
                                            !!checkedIngredients[ing];
                                        return (
                                            <div
                                                key={iIdx}
                                                onClick={() => {
                                                    setCheckedIngredients(
                                                        (prev) => ({
                                                            ...prev,
                                                            [ing]: !prev[ing],
                                                        })
                                                    );
                                                }}
                                                className="flex cursor-pointer flex-row items-center gap-2 py-0.5 select-none"
                                            >
                                                <div
                                                    className={`flex size-4 items-center justify-center rounded-sm border transition ${
                                                        isChecked
                                                            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                                                            : 'dark:border-neutral-750 border-neutral-300'
                                                    }`}
                                                >
                                                    {isChecked && (
                                                        <FiCheck size={11} />
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-sm font-light ${
                                                        isChecked
                                                            ? 'text-neutral-400 line-through dark:text-neutral-500'
                                                            : 'text-neutral-800 dark:text-neutral-200'
                                                    }`}
                                                >
                                                    {ing}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onClose}
            title={t('weekly_shopping_list') || 'Weekly Shopping List'}
            actionLabel={t('done') || 'Done'}
            secondaryAction={
                allIngredients.consolidated.length > 0
                    ? copyShoppingListToClipboard
                    : undefined
            }
            secondaryActionLabel={
                allIngredients.consolidated.length > 0
                    ? t('copy_list') || 'Copy List'
                    : undefined
            }
            body={bodyContent}
        />
    );
};

export default WeeklyShoppingListModal;
