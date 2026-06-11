'use client';

import React from 'react';
import { FieldErrors, UseFormRegister, FieldValues } from 'react-hook-form';
import CollapsibleSection from '@/app/components/utils/CollapsibleSection';
import Input from '../../inputs/Input';
import CurrencySelect from '../../inputs/CurrencySelect';
import WorkshopIngredientsStep from './WorkshopIngredientsStep';
import WorkshopPreviousStepsStep from './WorkshopPreviousStepsStep';

interface WorkshopRequirementsStepProps {
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    isLoading: boolean;
    numIngredients: number;
    numPreviousSteps: number;
    onAddIngredient: () => void;
    onRemoveIngredient: (index: number) => void;
    onAddPreviousStep: () => void;
    onRemovePreviousStep: (index: number) => void;
    t: (key: string) => string;
}

export const WorkshopRequirementsStep: React.FC<
    WorkshopRequirementsStepProps
> = ({
    register,
    errors,
    isLoading,
    numIngredients,
    numPreviousSteps,
    onAddIngredient,
    onRemoveIngredient,
    onAddPreviousStep,
    onRemovePreviousStep,
    t,
}) => (
    <div className="flex flex-col gap-4">
        <CollapsibleSection
            title={t('price_per_person')}
            description={t('price_description')}
        >
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <Input
                        id="price"
                        label={t('price_per_person')}
                        type="number"
                        disabled={isLoading}
                        register={register}
                        errors={errors}
                        formatPrice
                    />
                </div>
                <CurrencySelect
                    id="currency"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                />
            </div>
        </CollapsibleSection>
        <CollapsibleSection
            title={t('ingredients')}
            description={t('ingredients_description')}
            dataCy="ingredients-section"
        >
            <WorkshopIngredientsStep
                numIngredients={numIngredients}
                register={register}
                errors={errors}
                onAddIngredient={onAddIngredient}
                onRemoveIngredient={onRemoveIngredient}
            />
        </CollapsibleSection>
        <CollapsibleSection
            title={t('previous_steps')}
            description={t('previous_steps_description')}
            dataCy="previous-steps-section"
        >
            <WorkshopPreviousStepsStep
                numPreviousSteps={numPreviousSteps}
                register={register}
                errors={errors}
                onAddPreviousStep={onAddPreviousStep}
                onRemovePreviousStep={onRemovePreviousStep}
            />
        </CollapsibleSection>
    </div>
);

export default WorkshopRequirementsStep;
