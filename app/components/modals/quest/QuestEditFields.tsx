'use client';

import { FieldValues, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { QuestRecipeReply } from '@/app/hooks/useQuestModal';
import QuestAcceptedRecipeField from './QuestAcceptedRecipeField';

interface QuestEditFieldsProps {
    register: UseFormRegister<FieldValues>;
    disabled: boolean;
    statusValue: string;
    recipes?: QuestRecipeReply[];
}

const QuestEditFields: React.FC<QuestEditFieldsProps> = ({
    register,
    disabled,
    statusValue,
    recipes,
}) => {
    const { t } = useTranslation();
    const showAcceptedRecipes =
        statusValue === 'completed' && Boolean(recipes?.length);

    return (
        <>
            <div className="relative">
                <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                    {t('status') || 'Status'}
                </label>
                <select
                    id="status"
                    {...register('status')}
                    disabled={disabled}
                    className="w-full rounded-xl border border-neutral-300 p-3 text-sm text-neutral-900 transition-colors duration-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-100 dark:focus:ring-neutral-100"
                    data-cy="quest-status"
                >
                    <option value="open">{t('open') || 'Open'}</option>
                    <option value="in_progress">
                        {t('in_progress') || 'In Progress'}
                    </option>
                    <option value="completed">
                        {t('completed') || 'Completed'}
                    </option>
                </select>
            </div>

            {showAcceptedRecipes && recipes && (
                <QuestAcceptedRecipeField
                    recipes={recipes}
                    register={register}
                    disabled={disabled}
                />
            )}
        </>
    );
};

export default QuestEditFields;
