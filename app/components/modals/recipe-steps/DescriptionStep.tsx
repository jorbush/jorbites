import { useState } from 'react';
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
    prepTime?: number | null;
    onPrepTimeChange?: (prepTime: number | undefined) => void;
    cookTime?: number | null;
    onCookTimeChange?: (cookTime: number | undefined) => void;
}

const DescriptionStep: React.FC<DescriptionStepProps> = ({
    isLoading,
    register,
    errors,
    minutes,
    onMinutesChange,
    prepTime,
    onPrepTimeChange,
    cookTime,
    onCookTimeChange,
}) => {
    const { t } = useTranslation();
    const [showBreakdown, setShowBreakdown] = useState<boolean>(() => {
        return (
            (prepTime !== undefined && prepTime !== null && prepTime > 0) ||
            (cookTime !== undefined && cookTime !== null && cookTime > 0)
        );
    });

    const toggleBreakdown = () => {
        if (showBreakdown) {
            onPrepTimeChange?.(undefined);
            onCookTimeChange?.(undefined);
            setShowBreakdown(false);
        } else {
            setShowBreakdown(true);
        }
    };

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
            <div className="flex flex-col gap-2">
                <Counter
                    title={t('minutes')}
                    subtitle={t('minutes_subtitle')}
                    value={minutes}
                    onChange={onMinutesChange}
                    minValue={Math.max(1, (prepTime || 0) + (cookTime || 0))}
                />
                <button
                    type="button"
                    onClick={toggleBreakdown}
                    className="cursor-pointer self-start text-sm font-medium text-neutral-500 transition hover:text-neutral-700 hover:underline focus:outline-hidden dark:text-neutral-400 dark:hover:text-neutral-200"
                    data-testid="toggle-time-breakdown"
                >
                    {showBreakdown
                        ? (t('hide_time_breakdown') ?? 'Remove detailed times')
                        : (t('add_time_breakdown') ??
                          '+ Add prep & cook time breakdown')}
                </button>
                {showBreakdown && (
                    <div className="mt-2 flex flex-col gap-6 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                        <Counter
                            title={t('prep_time') ?? 'Prep time'}
                            subtitle={
                                t('prep_time_subtitle') ??
                                'Preparation or resting time (optional)'
                            }
                            value={prepTime || 0}
                            onChange={(val) => {
                                onPrepTimeChange?.(val);
                                if (
                                    cookTime !== undefined &&
                                    cookTime !== null
                                ) {
                                    if (val + cookTime > minutes) {
                                        onMinutesChange(val + cookTime);
                                    }
                                }
                            }}
                            minValue={0}
                        />
                        <Counter
                            title={t('cook_time') ?? 'Cook time'}
                            subtitle={
                                t('cook_time_subtitle') ??
                                'Cooking or baking time (optional)'
                            }
                            value={cookTime || 0}
                            onChange={(val) => {
                                onCookTimeChange?.(val);
                                if (
                                    prepTime !== undefined &&
                                    prepTime !== null
                                ) {
                                    if (val + prepTime > minutes) {
                                        onMinutesChange(val + prepTime);
                                    }
                                }
                            }}
                            minValue={0}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DescriptionStep;
