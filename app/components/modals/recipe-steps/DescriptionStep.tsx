'use client';

import { useTranslation } from 'react-i18next';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import Heading from '@/app/components/navigation/Heading';
import Input from '@/app/components/inputs/Input';
import Counter from '@/app/components/inputs/Counter';
import {
    RECIPE_TITLE_MAX_LENGTH,
    RECIPE_DESCRIPTION_MAX_LENGTH,
} from '@/app/utils/constants';

interface DescriptionStepProps {
    isLoading: boolean;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    minutes: number;
    onMinutesChange: (minutes: number) => void;
}

const DescriptionStep: React.FC<DescriptionStepProps> = ({
    isLoading,
    register,
    errors,
    minutes,
    onMinutesChange,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-8">
            <Heading
                title={t('title_description')}
                subtitle={t('subtitle_description') ?? ''}
            />
            <Input
                id="title"
                label={t('title')}
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                maxLength={RECIPE_TITLE_MAX_LENGTH}
                dataCy="recipe-title"
            />
            <hr />
            <Input
                id="description"
                label={t('description')}
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                maxLength={RECIPE_DESCRIPTION_MAX_LENGTH}
                dataCy="recipe-description"
            />
            <hr />
            <Counter
                title={t('minutes')}
                subtitle={t('minutes_subtitle')}
                value={minutes}
                onChange={onMinutesChange}
            />
        </div>
    );
};

export default DescriptionStep;
