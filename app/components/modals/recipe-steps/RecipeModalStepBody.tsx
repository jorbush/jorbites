'use client';

import React from 'react';
import {
    FieldErrors,
    UseFormRegister,
    UseFormSetValue,
    UseFormGetValues,
    FieldValues,
} from 'react-hook-form';
import { STEPS } from '@/app/utils/constants';
import { SafeUser, SafeRecipe, SafeQuest } from '@/app/types';
import CategoryStep from '@/app/components/modals/recipe-steps/CategoryStep';
import DescriptionStep from '@/app/components/modals/recipe-steps/DescriptionStep';
import IngredientsStep from '@/app/components/modals/recipe-steps/IngredientsStep';
import MethodsStep from '@/app/components/modals/recipe-steps/MethodsStep';
import RecipeStepsStep from '@/app/components/modals/recipe-steps/RecipeStepsStep';
import ImagesStep from '@/app/components/modals/recipe-steps/ImagesStep';
import RelatedContentStep from '@/app/components/modals/recipe-steps/RelatedContentStep';
import RecipeLockBanner from '@/app/components/modals/recipe-steps/RecipeLockBanner';

export interface RecipeModalStepBodyProps {
    step: number;
    isCurrentStepLocked: boolean;
    lockOwner?: { userName?: string; userId?: string } | null;
    isSharedSession: boolean;
    otherActiveLocks: Array<[string, { userId?: string; userName?: string }]>;
    categories?: string[];
    setCustomValue: (id: string, value: unknown) => void;
    numIngredients: number;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    addIngredientInput: () => void;
    removeIngredientInput: (index: number) => void;
    setIngredients: (ingredients: string[]) => void;
    getValues: UseFormGetValues<FieldValues>;
    setValue: UseFormSetValue<FieldValues>;
    ingredientsInputMode?: 'list' | 'text';
    setIngredientsInputMode: (mode: 'list' | 'text') => void;
    numSteps: number;
    addStepInput: () => void;
    removeStepInput: (index: number) => void;
    setSteps: (steps: string[]) => void;
    stepsInputMode?: 'list' | 'text';
    setStepsInputMode: (mode: 'list' | 'text') => void;
    isLoading: boolean;
    minutes: number;
    prepTime?: number;
    cookTime?: number;
    method?: string;
    selectedCoCooks: SafeUser[];
    selectedLinkedRecipes: SafeRecipe[];
    selectedQuest: SafeQuest | null;
    addCoCook: (user: SafeUser) => void;
    removeCoCook: (userId: string) => void;
    addLinkedRecipe: (recipe: SafeRecipe) => void;
    removeLinkedRecipe: (recipeId: string) => void;
    selectQuest: (quest: SafeQuest) => void;
    removeQuest: () => void;
    imageSrc?: string;
}

const RecipeModalStepBody: React.FC<RecipeModalStepBodyProps> = ({
    step,
    isCurrentStepLocked,
    lockOwner,
    isSharedSession,
    otherActiveLocks,
    categories,
    setCustomValue,
    numIngredients,
    register,
    errors,
    addIngredientInput,
    removeIngredientInput,
    setIngredients,
    getValues,
    setValue,
    ingredientsInputMode,
    setIngredientsInputMode,
    numSteps,
    addStepInput,
    removeStepInput,
    setSteps,
    stepsInputMode,
    setStepsInputMode,
    isLoading,
    minutes,
    prepTime,
    cookTime,
    method,
    selectedCoCooks,
    selectedLinkedRecipes,
    selectedQuest,
    addCoCook,
    removeCoCook,
    addLinkedRecipe,
    removeLinkedRecipe,
    selectQuest,
    removeQuest,
    imageSrc,
}) => {
    const renderStepContent = () => {
        switch (step) {
            case STEPS.INGREDIENTS:
                return (
                    <IngredientsStep
                        numIngredients={numIngredients}
                        register={register}
                        errors={errors}
                        onAddIngredient={addIngredientInput}
                        onRemoveIngredient={removeIngredientInput}
                        onSetIngredients={setIngredients}
                        getValues={getValues}
                        setValue={setValue}
                        inputMode={ingredientsInputMode}
                        setInputMode={setIngredientsInputMode}
                        isLocked={isCurrentStepLocked}
                    />
                );
            case STEPS.STEPS:
                return (
                    <RecipeStepsStep
                        numSteps={numSteps}
                        register={register}
                        errors={errors}
                        onAddStep={addStepInput}
                        onRemoveStep={removeStepInput}
                        onSetSteps={setSteps}
                        getValues={getValues}
                        setValue={setValue}
                        inputMode={stepsInputMode}
                        setInputMode={setStepsInputMode}
                        isLocked={isCurrentStepLocked}
                    />
                );
            case STEPS.DESCRIPTION:
                return (
                    <DescriptionStep
                        isLoading={isLoading}
                        register={register}
                        errors={errors}
                        minutes={minutes}
                        onMinutesChange={(value) =>
                            setCustomValue('minutes', value)
                        }
                        prepTime={prepTime}
                        onPrepTimeChange={(value) =>
                            setCustomValue('prepTime', value)
                        }
                        cookTime={cookTime}
                        onCookTimeChange={(value) =>
                            setCustomValue('cookTime', value)
                        }
                        isLocked={isCurrentStepLocked}
                    />
                );
            case STEPS.METHODS:
                return (
                    <MethodsStep
                        selectedMethod={method || ''}
                        onMethodSelect={(selectedMethod) =>
                            setCustomValue('method', selectedMethod)
                        }
                    />
                );
            case STEPS.RELATED_CONTENT:
                return (
                    <RelatedContentStep
                        isLoading={isLoading}
                        selectedCoCooks={selectedCoCooks}
                        selectedLinkedRecipes={selectedLinkedRecipes}
                        selectedQuest={selectedQuest}
                        onAddCoCook={addCoCook}
                        onRemoveCoCook={removeCoCook}
                        onAddLinkedRecipe={addLinkedRecipe}
                        onRemoveLinkedRecipe={removeLinkedRecipe}
                        onSelectQuest={selectQuest}
                        onRemoveQuest={removeQuest}
                        register={register}
                        errors={errors}
                    />
                );
            case STEPS.IMAGES:
                return (
                    <ImagesStep
                        imageSrc={imageSrc || ''}
                        imageSrc1={getValues('imageSrc1')}
                        imageSrc2={getValues('imageSrc2')}
                        imageSrc3={getValues('imageSrc3')}
                        onImageChange={(field, value) =>
                            setCustomValue(field, value)
                        }
                    />
                );
            case STEPS.CATEGORY:
            default:
                return (
                    <CategoryStep
                        selectedCategories={categories || []}
                        onCategorySelect={(selectedCategories) =>
                            setCustomValue('categories', selectedCategories)
                        }
                    />
                );
        }
    };

    return (
        <div>
            <RecipeLockBanner
                isCurrentStepLocked={isCurrentStepLocked}
                lockOwner={lockOwner}
                isSharedSession={isSharedSession}
                otherActiveLocks={otherActiveLocks}
            />
            <div
                className={
                    isCurrentStepLocked ? 'pointer-events-none opacity-60' : ''
                }
            >
                {renderStepContent()}
            </div>
        </div>
    );
};

export default RecipeModalStepBody;
