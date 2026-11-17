'use client';

import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { QUEST_TITLE_MAX_LENGTH } from '@/app/utils/constants';
import { QuestRecipeReply } from '@/app/hooks/useQuestModal';
import Heading from '@/app/components/navigation/Heading';
import Input from '@/app/components/inputs/Input';
import QuestDescriptionField from './QuestDescriptionField';
import QuestEditFields from './QuestEditFields';

interface QuestModalBodyProps {
    title: string;
    subtitle: string;
    isEditMode: boolean;
    isLoading: boolean;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    statusValue: string;
    recipes?: QuestRecipeReply[];
}

const QuestModalBody: React.FC<QuestModalBodyProps> = ({
    title,
    subtitle,
    isEditMode,
    isLoading,
    register,
    errors,
    statusValue,
    recipes,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4">
            <Heading
                title={title}
                subtitle={subtitle}
            />
            <Input
                id="title"
                label={t('title') || 'Title'}
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                validation={{
                    required: t('title_required') || 'Title is required',
                    maxLength: {
                        value: QUEST_TITLE_MAX_LENGTH,
                        message:
                            t('title_max_length') ||
                            `Title must be ${QUEST_TITLE_MAX_LENGTH} characters or less`,
                    },
                }}
                dataCy="quest-title"
            />
            <QuestDescriptionField
                register={register}
                errors={errors}
                disabled={isLoading}
            />
            {isEditMode && (
                <QuestEditFields
                    register={register}
                    disabled={isLoading}
                    statusValue={statusValue}
                    recipes={recipes}
                />
            )}
        </div>
    );
};

export default QuestModalBody;
