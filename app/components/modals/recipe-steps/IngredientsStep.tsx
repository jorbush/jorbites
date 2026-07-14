'use client';

import { useTranslation } from 'react-i18next';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useState, useCallback } from 'react';
import Heading from '@/app/components/navigation/Heading';
import Textarea from '@/app/components/inputs/Textarea';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import Button from '@/app/components/buttons/Button';
import RecipeIngredientsInputs from './RecipeIngredientsInputs';
import { parseTextToList } from '@/app/utils/textParser';
import { RECIPE_MAX_INGREDIENTS } from '@/app/utils/constants';
import OcrTextScanner from '@/app/components/inputs/OcrTextScanner';

interface IngredientsStepProps {
    numIngredients: number;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    onAddIngredient: () => void;
    onRemoveIngredient: (index: number) => void;
    onSetIngredients?: (ingredients: string[]) => void;
    getValues?: (name?: string | string[]) => any;
    setValue?: (name: string, value: any) => void;
    inputMode?: 'list' | 'text';
    setInputMode?: (mode: 'list' | 'text') => void;
}

const IngredientsStep: React.FC<IngredientsStepProps> = ({
    numIngredients,
    register,
    errors,
    onAddIngredient,
    onRemoveIngredient,
    onSetIngredients,
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
            const currentValue = getValues?.('ingredients-plain-text') || '';
            const newValue = currentValue ? `${currentValue}\n${text}` : text;
            setValue('ingredients-plain-text', newValue);
            setInputMode('text');
        },
        [getValues, setValue, setInputMode]
    );

    const handleAddIngredient = () => {
        if (numIngredients >= RECIPE_MAX_INGREDIENTS) {
            toast.error(
                t('max_ingredients_reached') ||
                    `Maximum of ${RECIPE_MAX_INGREDIENTS} ingredients allowed`
            );
            return;
        }
        onAddIngredient();
    };

    const handleModeToggle = () => {
        const nextMode = inputMode === 'list' ? 'text' : 'list';
        if (nextMode === 'text' && getValues && setValue) {
            // Collect current ingredients
            const currentIngredients: string[] = [];
            for (let i = 0; i < numIngredients; i++) {
                const value = getValues(`ingredient-${i}`);
                if (value && value.trim() !== '') {
                    currentIngredients.push(value.trim());
                }
            }
            // Convert to numbered plain text format
            const plainText = currentIngredients
                .map((ingredient, index) => `${index + 1}. ${ingredient}`)
                .join('\n');
            setValue('ingredients-plain-text', plainText);
        } else if (nextMode === 'list' && getValues && onSetIngredients) {
            // Collect text from textarea and parse it
            const textareaValue = getValues('ingredients-plain-text');
            const parsedItems = parseTextToList(
                textareaValue,
                RECIPE_MAX_INGREDIENTS
            );
            if (parsedItems.length > 0) {
                onSetIngredients(parsedItems);
            }
        }
        setInputMode(nextMode);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-6 pl-2">
                <div className="flex items-center gap-2">
                    <Heading title={t('title_ingredients')} />
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
                        <RecipeIngredientsInputs
                            numIngredients={numIngredients}
                            register={register}
                            errors={errors}
                            onRemoveIngredient={onRemoveIngredient}
                        />
                    </div>
                    <Button
                        outline={true}
                        label="+"
                        onClick={handleAddIngredient}
                        dataCy="add-ingredient-button"
                    />
                </>
            ) : (
                <div className="flex flex-col gap-3">
                    <Textarea
                        id="ingredients-plain-text"
                        label=""
                        register={register}
                        errors={errors}
                        rows={12}
                        placeholder={t('ingredients_placeholder') || undefined}
                        dataCy="ingredients-textarea"
                    />
                    <Button
                        outline={true}
                        label={t('apply') || 'Apply'}
                        onClick={() => {
                            if (getValues && onSetIngredients) {
                                const textareaValue = getValues(
                                    'ingredients-plain-text'
                                );
                                const parsedItems = parseTextToList(
                                    textareaValue,
                                    RECIPE_MAX_INGREDIENTS
                                );
                                if (parsedItems.length > 0) {
                                    onSetIngredients(parsedItems);
                                    setInputMode('list');
                                    toast.success(
                                        `${parsedItems.length} ${t('ingredients_applied')}`
                                    );
                                } else {
                                    toast.error(t('no_ingredients_found'));
                                }
                            }
                        }}
                        dataCy="apply-ingredients-button"
                    />
                </div>
            )}
        </div>
    );
};

export default IngredientsStep;
