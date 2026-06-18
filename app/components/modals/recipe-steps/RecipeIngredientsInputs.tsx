'use client';

import React from 'react';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import Input from '@/app/components/inputs/Input';
import { RECIPE_INGREDIENT_MAX_LENGTH } from '@/app/utils/constants';

interface RecipeIngredientsInputsProps {
    numIngredients: number;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    onRemoveIngredient: (index: number) => void;
}

const RecipeIngredientsInputs: React.FC<RecipeIngredientsInputsProps> = ({
    numIngredients,
    register,
    errors,
    onRemoveIngredient,
}) => {
    const ingredientKeys = Array.from(
        { length: numIngredients },
        (_, idx) => `ingredient-input-${idx}`
    );
    return (
        <>
            {ingredientKeys.map((ingredientKey, i) => (
                <div
                    key={ingredientKey}
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
            ))}
        </>
    );
};

export default RecipeIngredientsInputs;
