'use client';

import { useTranslation } from 'react-i18next';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/navigation/Heading';
import Input from '@/app/components/inputs/Input';
import Button from '@/app/components/buttons/Button';
import {
    WORKSHOP_STEP_MAX_LENGTH,
    WORKSHOP_MAX_STEPS,
} from '@/app/utils/constants';

interface WorkshopPreviousStepsStepProps {
    numPreviousSteps: number;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    onAddPreviousStep: () => void;
    onRemovePreviousStep: (index: number) => void;
}

const WorkshopPreviousStepsStep: React.FC<WorkshopPreviousStepsStepProps> = ({
    numPreviousSteps,
    register,
    errors,
    onAddPreviousStep,
    onRemovePreviousStep,
}) => {
    const { t } = useTranslation();

    const handleAddPreviousStep = () => {
        if (numPreviousSteps >= WORKSHOP_MAX_STEPS) {
            toast.error(
                t('max_previous_steps_reached') ||
                    `Maximum of ${WORKSHOP_MAX_STEPS} previous steps allowed`
            );
            return;
        }
        onAddPreviousStep();
    };

    const renderPreviousStepInputs = () => {
        const components = [];
        for (let i = 0; i < numPreviousSteps; i++) {
            components.push(
                <div
                    key={i}
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
            );
        }
        return components;
    };

    return (
        <div className="flex flex-col gap-8">
            <Heading title={t('previous_steps')} />
            <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                {renderPreviousStepInputs()}
            </div>
            <Button
                outline={true}
                label="+"
                onClick={handleAddPreviousStep}
                dataCy="add-previous-step-button"
            />
        </div>
    );
};

export default WorkshopPreviousStepsStep;
