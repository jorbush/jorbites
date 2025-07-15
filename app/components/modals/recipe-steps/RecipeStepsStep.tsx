'use client';

import { useTranslation } from 'react-i18next';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/navigation/Heading';
import Input from '@/app/components/inputs/Input';
import Button from '@/app/components/buttons/Button';
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
}

const RecipeStepsStep: React.FC<RecipeStepsStepProps> = ({
    numSteps,
    register,
    errors,
    onAddStep,
    onRemoveStep,
}) => {
    const { t } = useTranslation();

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

    const renderStepsInputs = () => {
        const components = [];
        for (let i = 0; i < numSteps; i++) {
            components.push(
                <div
                    key={i}
                    className="relative flex w-full items-center gap-3 px-2"
                >
                    <div className="shrink-0 text-base">{`${i + 1}.`}</div>

                    <div className="grow">
                        <Input
                            id={'step ' + i}
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
            );
        }
        return components;
    };

    return (
        <div className="flex flex-col gap-8">
            <Heading title={t('title_steps')} />
            <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                {renderStepsInputs()}
            </div>
            <Button
                outline={true}
                label="+"
                onClick={handleAddStep}
                dataCy="add-step-button"
            />
        </div>
    );
};

export default RecipeStepsStep;
