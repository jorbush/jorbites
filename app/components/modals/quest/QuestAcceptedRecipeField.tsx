'use client';

import { FieldValues, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { QuestRecipeReply } from '@/app/hooks/useQuestModal';

interface QuestAcceptedRecipeFieldProps {
    recipes: QuestRecipeReply[];
    register: UseFormRegister<FieldValues>;
    disabled: boolean;
}

const QuestAcceptedRecipeField: React.FC<QuestAcceptedRecipeFieldProps> = ({
    recipes,
    register,
    disabled,
}) => {
    const { t } = useTranslation();

    return (
        <div className="relative">
            <label
                htmlFor="recipeId"
                className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
                {t('accepted_recipe') || 'Select Accepted Recipe'}
            </label>
            <select
                id="recipeId"
                {...register('recipeId')}
                disabled={disabled}
                className="w-full rounded-lg border border-neutral-300 p-3 text-neutral-900 transition focus:border-rose-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                data-cy="accepted-recipe-select"
            >
                <option value="">
                    {t('select_accepted_recipe') || 'Select accepted recipe...'}
                </option>
                {recipes.map((recipe) => (
                    <option
                        key={recipe.id}
                        value={recipe.id}
                    >
                        {recipe.title}
                        {recipe.user?.name ? ` (by ${recipe.user.name})` : ''}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default QuestAcceptedRecipeField;
