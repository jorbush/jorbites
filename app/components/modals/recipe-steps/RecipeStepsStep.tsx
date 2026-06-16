'use client';

import { useTranslation } from 'react-i18next';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import Heading from '@/app/components/navigation/Heading';
import Input from '@/app/components/inputs/Input';
import Textarea from '@/app/components/inputs/Textarea';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import Button from '@/app/components/buttons/Button';
import { parseTextToList } from '@/app/utils/textParser';
import {
    RECIPE_STEP_MAX_LENGTH,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';

interface RecipeStepsStepProps {
    numSteps: number;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    onAddStep: () => void;
    onRemoveStep: (index: number) => void;
    onSetSteps?: (steps: string[]) => void;
    getValues?: (name?: string | string[]) => any;
    setValue?: (name: string, value: any) => void;
    inputMode?: 'list' | 'text';
    setInputMode?: (mode: 'list' | 'text') => void;
}

const RecipeStepsStep: React.FC<RecipeStepsStepProps> = ({
    numSteps,
    register,
    errors,
    onAddStep,
    onRemoveStep,
    onSetSteps,
    getValues,
    setValue,
    inputMode: propInputMode,
    setInputMode: propSetInputMode,
}) => {
    const { t } = useTranslation();
    const [localInputMode, setLocalInputMode] = useState<'list' | 'text'>(
        'list'
    );

    const inputMode = propInputMode ?? localInputMode;
    const setInputMode = propSetInputMode ?? setLocalInputMode;

    const handleAddStep = () => {
        if (numSteps >= RECIPE_MAX_STEPS) {
            toast.error(
                t('max_steps_reached') ||
                    `Maximum of ${RECIPE_MAX_STEPS} steps allowed`
            );
            return;
        }
        onAddStep();
    };

    const handleModeToggle = () => {
        const nextMode = inputMode === 'list' ? 'text' : 'list';
        if (nextMode === 'text' && getValues && setValue) {
            // Collect current steps
            const currentSteps: string[] = [];
            for (let i = 0; i < numSteps; i++) {
                const value = getValues(`step-${i}`);
                if (value && value.trim() !== '') {
                    currentSteps.push(value.trim());
                }
            }
            // Convert to numbered plain text format
            const plainText = currentSteps
                .map((step, index) => `${index + 1}. ${step}`)
                .join('\n');
            setValue('steps-plain-text', plainText);
        } else if (nextMode === 'list' && getValues && onSetSteps) {
            // Collect text from textarea and parse it
            const textareaValue = getValues('steps-plain-text');
            const parsedItems = parseTextToList(
                textareaValue,
                RECIPE_MAX_STEPS
            );
            if (parsedItems.length > 0) {
                onSetSteps(parsedItems);
            }
        }
        setInputMode(nextMode);
    };

    const renderStepsInputs = () => {
        const stepKeys = Array.from(
            { length: numSteps },
            (_, idx) => `step-input-${idx}`
        );
        return stepKeys.map((stepKey, i) => (
            <div
                key={stepKey}
                className="relative flex w-full items-center gap-3 px-2"
            >
                <div className="shrink-0 text-base">{`${i + 1}.`}</div>

                <div className="grow">
                    <Input
                        id={`step-${i}`}
                        label=""
                        register={register}
                        errors={errors}
                        required={numSteps === 1}
                        maxLength={RECIPE_STEP_MAX_LENGTH}
                        dataCy={`recipe-step-${i}`}
                    />
                </div>
                {numSteps > 1 && i === numSteps - 1 ? (
                    <div className="shrink-0">
                        <AiFillDelete
                            data-testid="remove-step-button"
                            color="#F43F5F"
                            onClick={() => onRemoveStep(i)}
                            size={24}
                            className="cursor-pointer"
                        />
                    </div>
                ) : (
                    <div className="w-6 shrink-0" />
                )}
            </div>
        ));
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="relative flex items-center justify-between pl-2">
                <Heading title={t('title_steps')} />
                <div className="absolute top-8 right-0 flex items-center">
                    <ToggleSwitch
                        checked={inputMode === 'text'}
                        onChange={handleModeToggle}
                        label={t('plain_text_mode') || undefined}
                        dataCy="toggle-input-mode"
                    />
                </div>
            </div>

            {inputMode === 'list' ? (
                <>
                    <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                        {renderStepsInputs()}
                    </div>
                    <Button
                        outline={true}
                        label="+"
                        onClick={handleAddStep}
                        dataCy="add-step-button"
                    />
                </>
            ) : (
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t('paste_steps_help')}
                    </p>
                    <Textarea
                        id="steps-plain-text"
                        label=""
                        register={register}
                        errors={errors}
                        rows={12}
                        placeholder={t('steps_placeholder') || undefined}
                        dataCy="steps-textarea"
                    />
                    <Button
                        outline={true}
                        label={t('apply') || 'Apply'}
                        onClick={() => {
                            if (getValues && onSetSteps) {
                                const textareaValue =
                                    getValues('steps-plain-text');
                                const parsedItems = parseTextToList(
                                    textareaValue,
                                    RECIPE_MAX_STEPS
                                );
                                if (parsedItems.length > 0) {
                                    onSetSteps(parsedItems);
                                    setInputMode('list');
                                    toast.success(
                                        `${parsedItems.length} ${t('steps_applied')}`
                                    );
                                } else {
                                    toast.error(t('no_steps_found'));
                                }
                            }
                        }}
                        dataCy="apply-steps-button"
                    />
                </div>
            )}
        </div>
    );
};

export default RecipeStepsStep;
