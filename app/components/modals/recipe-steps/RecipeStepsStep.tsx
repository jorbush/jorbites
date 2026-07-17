'use client';

import { useTranslation } from 'react-i18next';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useState, useCallback } from 'react';
import Heading from '@/app/components/navigation/Heading';
import Textarea from '@/app/components/inputs/Textarea';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import Button from '@/app/components/buttons/Button';
import RecipeStepsInputs from './RecipeStepsInputs';
import { parseTextToList } from '@/app/utils/textParser';
import { RECIPE_MAX_STEPS } from '@/app/utils/constants';
import OcrTextScanner from '@/app/components/inputs/OcrTextScanner';

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

    const handleOcrResult = useCallback(
        (text: string) => {
            if (!setValue) return;
            const currentValue = getValues?.('steps-plain-text') || '';
            const newValue = currentValue ? `${currentValue}\n${text}` : text;
            setValue('steps-plain-text', newValue);
            setInputMode('text');
        },
        [getValues, setValue, setInputMode]
    );

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

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-6 pl-2">
                <div className="flex items-center gap-2">
                    <Heading title={t('title_steps')} />
                    <OcrTextScanner onResult={handleOcrResult} />
                </div>
                <div className="flex items-center">
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
                        <RecipeStepsInputs
                            numSteps={numSteps}
                            register={register}
                            errors={errors}
                            onRemoveStep={onRemoveStep}
                        />
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
