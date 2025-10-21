'use client';

import { useTranslation } from 'react-i18next';
import { FieldValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/navigation/Heading';
import Input from '@/app/components/inputs/Input';
import Button from '@/app/components/buttons/Button';
import {
    WORKSHOP_INGREDIENT_MAX_LENGTH,
    WORKSHOP_MAX_INGREDIENTS,
} from '@/app/utils/constants';

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
            );
        }
        return components;
    };

    return (
        <div className="flex flex-col gap-8">
            <Heading title={t('ingredients')} />
            <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                {renderIngredientInputs()}
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
