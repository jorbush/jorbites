'use client';

import React from 'react';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import Input from '@/app/components/inputs/Input';
import { WORKSHOP_INGREDIENT_MAX_LENGTH } from '@/app/utils/constants';

interface WorkshopIngredientsInputsProps {
    numIngredients: number;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    onRemoveIngredient: (index: number) => void;
}

const WorkshopIngredientsInputs: React.FC<WorkshopIngredientsInputsProps> = ({
    numIngredients,
    register,
    errors,
    onRemoveIngredient,
}) => {
    const ingredientKeys = Array.from(
        { length: numIngredients },
        (_, idx) => `workshop-ingredient-input-${idx}`
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
                            maxLength={WORKSHOP_INGREDIENT_MAX_LENGTH}
                            dataCy={`workshop-ingredient-${i}`}
                        />
                    </div>
                    {i === numIngredients - 1 ? (
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

export default WorkshopIngredientsInputs;
