'use client';

import { useTranslation } from 'react-i18next';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Heading from '@/app/components/navigation/Heading';
import Input from '@/app/components/inputs/Input';
import Textarea from '@/app/components/inputs/Textarea';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import Button from '@/app/components/buttons/Button';
import { parseTextToList } from '@/app/utils/textParser';
import {
    RECIPE_INGREDIENT_MAX_LENGTH,
    RECIPE_MAX_INGREDIENTS,
} from '@/app/utils/constants';

interface IngredientsStepProps {
    numIngredients: number;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    onAddIngredient: () => void;
    onRemoveIngredient: (index: number) => void;
    onSetIngredients?: (ingredients: string[]) => void;
    getValues?: (name?: string | string[]) => any;
    setValue?: (name: string, value: any) => void;
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
}) => {
    const { t } = useTranslation();
    const [inputMode, setInputMode] = useState<'list' | 'text'>('list');

    // Update plain text value when switching to text mode
    useEffect(() => {
        if (inputMode === 'text' && getValues && setValue) {
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
        }
    }, [inputMode, numIngredients, getValues, setValue]);

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
        setInputMode((mode) => (mode === 'list' ? 'text' : 'list'));
    };

    const renderIngredientInputs = () => {
        const components = [];
        for (let i = 0; i < numIngredients; i++) {
            components.push(
                <div
                    key={i}
                    className="relative flex w-full items-center gap-3 px-2"
                >
                    <div className="grow">
                        <Input
                            id={`ingredient-${i}`}
                            label=""
                            register={register}
                            errors={errors}
                            required={numIngredients === 1}
                            maxLength={RECIPE_INGREDIENT_MAX_LENGTH}
                            dataCy={`recipe-ingredient-${i}`}
                        />
                    </div>
                    {numIngredients > 1 && i === numIngredients - 1 ? (
                        <div className="shrink-0">
                            <AiFillDelete
                                data-testid="remove-ingredient-button"
                                color="#F43F5F"
                                onClick={() => onRemoveIngredient(i)}
                                size={24}
                                className="cursor-pointer"
                            />
                        </div>
                    ) : (
                        <div className="w-6 shrink-0" />
                    )}
                </div>
            );
        }
        return components;
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex-1"></div>
                <Heading title={t('title_ingredients')} />
                <div className="flex flex-1 items-center justify-end">
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
                        {renderIngredientInputs()}
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
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t('paste_ingredients_help')}
                    </p>
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
                            const textareaElement = document.getElementById(
                                'ingredients-plain-text'
                            ) as HTMLTextAreaElement;
                            if (textareaElement && onSetIngredients) {
                                const parsedItems = parseTextToList(
                                    textareaElement.value,
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
