'use client';

import React from 'react';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import Input from '@/app/components/inputs/Input';
import { RECIPE_STEP_MAX_LENGTH } from '@/app/utils/constants';

interface RecipeStepsInputsProps {
    numSteps: number;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    onRemoveStep: (index: number) => void;
}

const RecipeStepsInputs: React.FC<RecipeStepsInputsProps> = ({
    numSteps,
    register,
    errors,
    onRemoveStep,
}) => {
    const stepKeys = Array.from(
        { length: numSteps },
        (_, idx) => `step-input-${idx}`
    );
    return (
        <>
            {stepKeys.map((stepKey, i) => (
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
            ))}
        </>
    );
};

export default RecipeStepsInputs;
