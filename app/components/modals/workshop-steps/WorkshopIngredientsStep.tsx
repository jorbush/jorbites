'use client';

import { useTranslation } from 'react-i18next';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/navigation/Heading';
import Button from '@/app/components/buttons/Button';
import WorkshopIngredientsInputs from './WorkshopIngredientsInputs';
import { WORKSHOP_MAX_INGREDIENTS } from '@/app/utils/constants';

interface WorkshopIngredientsStepProps {
    numIngredients: number;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    onAddIngredient: () => void;
    onRemoveIngredient: (index: number) => void;
}

const WorkshopIngredientsStep: React.FC<WorkshopIngredientsStepProps> = ({
    numIngredients,
    register,
    errors,
    onAddIngredient,
    onRemoveIngredient,
}) => {
    const { t } = useTranslation();

    const handleAddIngredient = () => {
        if (numIngredients >= WORKSHOP_MAX_INGREDIENTS) {
            toast.error(
                t('max_ingredients_reached') ||
                    `Maximum of ${WORKSHOP_MAX_INGREDIENTS} ingredients allowed`
            );
            return;
        }
        onAddIngredient();
    };

    return (
        <div className="flex flex-col gap-8">
            <Heading title={t('ingredients')} />
            <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                <WorkshopIngredientsInputs
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
        </div>
    );
};

export default WorkshopIngredientsStep;
