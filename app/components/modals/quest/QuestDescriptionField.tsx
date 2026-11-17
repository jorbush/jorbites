'use client';

import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { QUEST_DESCRIPTION_MAX_LENGTH } from '@/app/utils/constants';

interface QuestDescriptionFieldProps {
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    disabled: boolean;
}

const QuestDescriptionField: React.FC<QuestDescriptionFieldProps> = ({
    register,
    errors,
    disabled,
}) => {
    const { t } = useTranslation();

    const borderClass = errors.description
        ? 'border-rose-500 focus:border-rose-500'
        : 'border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100 dark:focus:ring-neutral-100';

    return (
        <div className="relative">
            <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
                {t('description') || 'Description'}
            </label>
            <textarea
                id="description"
                {...register('description', {
                    required:
                        t('description_required') || 'Description is required',
                    maxLength: {
                        value: QUEST_DESCRIPTION_MAX_LENGTH,
                        message:
                            t('description_max_length') ||
                            `Description must be ${QUEST_DESCRIPTION_MAX_LENGTH} characters or less`,
                    },
                })}
                disabled={disabled}
                rows={5}
                className={`w-full rounded-xl border p-3 text-sm text-neutral-900 transition-colors duration-200 focus:outline-hidden dark:bg-neutral-900 dark:text-neutral-100 ${borderClass}`}
                placeholder={
                    t('quest_description_placeholder') ||
                    'Describe the recipe you would like someone to create...'
                }
                data-cy="quest-description"
            />
            {errors.description && (
                <p className="mt-1 text-xs text-rose-500">
                    {errors.description.message as string}
                </p>
            )}
        </div>
    );
};

export default QuestDescriptionField;
