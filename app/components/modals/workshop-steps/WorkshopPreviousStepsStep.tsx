'use client';

import { useTranslation } from 'react-i18next';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/navigation/Heading';
import Button from '@/app/components/buttons/Button';
import WorkshopPreviousStepsInputs from './WorkshopPreviousStepsInputs';
import { WORKSHOP_MAX_STEPS } from '@/app/utils/constants';

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

    return (
        <div className="flex flex-col gap-8">
            <Heading title={t('previous_steps')} />
            <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                <WorkshopPreviousStepsInputs
                    numPreviousSteps={numPreviousSteps}
                    register={register}
                    errors={errors}
                    onRemovePreviousStep={onRemovePreviousStep}
                />
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
