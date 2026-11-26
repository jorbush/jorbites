'use client';

import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { FiTarget } from 'react-icons/fi';
import Modal from '@/app/components/modals/Modal';
import Input from '@/app/components/inputs/Input';
import Textarea from '@/app/components/inputs/Textarea';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import { useTranslation } from 'react-i18next';
import {
    DAILY_TARGET_LIMITS,
    DailyNutritionTargets,
    DailyTargetField,
} from '@/app/utils/planningNutrition';

export interface PlanningModalFormData extends DailyNutritionTargets {
    name: string;
    description: string;
    isPrivate: boolean;
}

interface PlanningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PlanningModalFormData) => void;
    title: string;
    actionLabel: string;
    initialValues?: PlanningModalFormData;
    isLoading?: boolean;
}

const TARGET_INPUT_SPECS: ReadonlyArray<{
    field: DailyTargetField;
    labelKey: string;
    fallbackLabel: string;
    placeholder: string;
    dataCy: string;
}> = [
    {
        field: 'targetCalories',
        labelKey: 'daily_target_calories',
        fallbackLabel: 'Daily calories (kcal)',
        placeholder: '2000',
        dataCy: 'plan-target-calories-input',
    },
    {
        field: 'targetProtein',
        labelKey: 'daily_target_protein',
        fallbackLabel: 'Protein (g)',
        placeholder: '140',
        dataCy: 'plan-target-protein-input',
    },
    {
        field: 'targetCarbohydrates',
        labelKey: 'daily_target_carbohydrates',
        fallbackLabel: 'Carbs (g)',
        placeholder: '220',
        dataCy: 'plan-target-carbohydrates-input',
    },
    {
        field: 'targetFat',
        labelKey: 'daily_target_fat',
        fallbackLabel: 'Fat (g)',
        placeholder: '65',
        dataCy: 'plan-target-fat-input',
    },
];

const toInputValue = (value?: number | null): string =>
    typeof value === 'number' && Number.isFinite(value) ? String(value) : '';

const parseTargetInput = (value: unknown): number | null => {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    if (!trimmed) return null;
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

const PlanningModal: React.FC<PlanningModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    actionLabel,
    initialValues,
    isLoading,
}) => {
    const { t } = useTranslation();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: {
            name: initialValues?.name ?? '',
            description: initialValues?.description ?? '',
            isPrivate: initialValues?.isPrivate ?? true,
            targetCalories: toInputValue(initialValues?.targetCalories),
            targetProtein: toInputValue(initialValues?.targetProtein),
            targetCarbohydrates: toInputValue(
                initialValues?.targetCarbohydrates
            ),
            targetFat: toInputValue(initialValues?.targetFat),
        },
    });

    const handleFormSubmit: SubmitHandler<FieldValues> = (data) => {
        const payload: PlanningModalFormData = {
            name: data.name,
            description: data.description,
            isPrivate: data.isPrivate,
        };

        for (const { field } of TARGET_INPUT_SPECS) {
            const parsed = parseTargetInput(data[field]);
            const hadInitial =
                initialValues?.[field] !== undefined &&
                initialValues?.[field] !== null;

            if (parsed !== null || hadInitial) {
                payload[field] = parsed;
            }
        }

        onSubmit(payload);
    };

    const isPrivate = watch('isPrivate');

    const bodyContent = (
        <div className="flex flex-col gap-4 text-neutral-900 dark:text-neutral-100">
            <Input
                id="name"
                label={t('plan_name')}
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                dataCy="plan-name-input"
            />
            <Textarea
                id="description"
                label={t('plan_description')}
                disabled={isLoading}
                register={register}
                errors={errors}
                dataCy="plan-description-textarea"
                rows={3}
            />
            <div className="flex flex-row items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-800">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        {t('private_meal_plan') || 'Private meal plan'}
                    </span>
                    <span className="text-xs font-light text-neutral-400">
                        {isPrivate ? t('plan_is_private') : t('plan_is_public')}
                    </span>
                </div>
                <ToggleSwitch
                    checked={isPrivate}
                    onChange={() => setValue('isPrivate', !isPrivate)}
                    disabled={isLoading}
                    dataCy="plan-private-toggle"
                />
            </div>

            {/* Optional Daily Nutrition Targets */}
            <div
                data-testid="daily-nutrition-goals-section"
                className="flex flex-col gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40"
            >
                <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-neutral-700 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-200">
                        <FiTarget
                            size={15}
                            className="dark:text-green-450 text-green-500"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            {String(
                                t('daily_nutrition_goals', {
                                    defaultValue: 'Daily nutrition goals',
                                }) || 'Daily nutrition goals'
                            )}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {String(
                                t('daily_nutrition_goals_hint', {
                                    defaultValue:
                                        'Optional targets to track daily progress',
                                }) || 'Optional targets to track daily progress'
                            )}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {TARGET_INPUT_SPECS.map((spec) => {
                        const max = DAILY_TARGET_LIMITS[spec.field];
                        const label = String(
                            t(spec.labelKey, {
                                defaultValue: spec.fallbackLabel,
                            }) || spec.fallbackLabel
                        );
                        const fieldError = errors[spec.field];

                        return (
                            <div
                                key={spec.field}
                                className="flex flex-col gap-1"
                            >
                                <label
                                    htmlFor={spec.field}
                                    className="text-xs font-medium text-neutral-600 dark:text-neutral-300"
                                >
                                    {label}
                                </label>
                                <input
                                    id={spec.field}
                                    type="number"
                                    inputMode="numeric"
                                    min={1}
                                    max={max}
                                    step={1}
                                    disabled={isLoading}
                                    placeholder={spec.placeholder}
                                    data-cy={spec.dataCy}
                                    data-testid={spec.dataCy}
                                    {...register(spec.field, {
                                        validate: (val) => {
                                            if (
                                                val === undefined ||
                                                val === null ||
                                                String(val).trim() === ''
                                            ) {
                                                return true;
                                            }
                                            const trimmed = String(val).trim();
                                            if (!/^\d+$/.test(trimmed)) {
                                                return String(
                                                    t(
                                                        'target_must_be_positive',
                                                        {
                                                            defaultValue:
                                                                'Enter a whole number greater than 0',
                                                        }
                                                    ) ||
                                                        'Enter a whole number greater than 0'
                                                );
                                            }
                                            const num = Number.parseInt(
                                                trimmed,
                                                10
                                            );
                                            if (num < 1 || num > max) {
                                                return String(
                                                    t(
                                                        'target_must_be_positive',
                                                        {
                                                            defaultValue:
                                                                'Enter a whole number greater than 0',
                                                        }
                                                    ) ||
                                                        'Enter a whole number greater than 0'
                                                );
                                            }
                                            return true;
                                        },
                                    })}
                                    className={`focus:border-green-450 focus:ring-green-450/30 w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 outline-hidden transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-900 dark:text-neutral-100 ${
                                        fieldError
                                            ? 'border-rose-500'
                                            : 'border-neutral-200 dark:border-neutral-700'
                                    }`}
                                />
                                {fieldError && (
                                    <span className="text-[11px] text-rose-500">
                                        {String(fieldError.message || '')}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit(handleFormSubmit)}
            actionLabel={actionLabel}
            title={title}
            body={bodyContent}
            isLoading={isLoading}
        />
    );
};

export default PlanningModal;
