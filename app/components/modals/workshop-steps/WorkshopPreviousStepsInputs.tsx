'use client';

import React from 'react';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import Input from '@/app/components/inputs/Input';
import { WORKSHOP_STEP_MAX_LENGTH } from '@/app/utils/constants';

interface WorkshopPreviousStepsInputsProps {
    numPreviousSteps: number;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    onRemovePreviousStep: (index: number) => void;
}

const WorkshopPreviousStepsInputs: React.FC<
    WorkshopPreviousStepsInputsProps
> = ({ numPreviousSteps, register, errors, onRemovePreviousStep }) => {
    const stepKeys = Array.from(
        { length: numPreviousSteps },
        (_, idx) => `workshop-previous-step-input-${idx}`
    );
    return (
        <>
            {stepKeys.map((stepKey, i) => (
                <div
                    key={stepKey}
                    className="relative flex w-full items-center gap-3 px-2"
                >
                    <div className="grow">
                        <Input
                            id={`previousStep-${i}`}
                            label=""
                            register={register}
                            errors={errors}
                            required={numPreviousSteps === 1}
                            maxLength={WORKSHOP_STEP_MAX_LENGTH}
                            dataCy={`workshop-previous-step-${i}`}
                        />
                    </div>
                    {i === numPreviousSteps - 1 ? (
                        <div className="shrink-0">
                            <AiFillDelete
                                data-testid="remove-previous-step-button"
                                color="#F43F5F"
                                onClick={() => onRemovePreviousStep(i)}
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

export default WorkshopPreviousStepsInputs;
