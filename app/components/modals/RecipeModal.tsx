'use client';

import useRecipeModal from '@/app/hooks/useRecipeModal';
import Modal from '@/app/components/modals/Modal';
import { useTranslation } from 'react-i18next';
import { FiUploadCloud } from 'react-icons/fi';
import { SafeUser } from '@/app/types';
import RelatedContentStep from '@/app/components/modals/recipe-steps/RelatedContentStep';
import CategoryStep from '@/app/components/modals/recipe-steps/CategoryStep';
import DescriptionStep from '@/app/components/modals/recipe-steps/DescriptionStep';
import IngredientsStep from '@/app/components/modals/recipe-steps/IngredientsStep';
import MethodsStep from '@/app/components/modals/recipe-steps/MethodsStep';
import RecipeStepsStep from '@/app/components/modals/recipe-steps/RecipeStepsStep';
import ImagesStep from '@/app/components/modals/recipe-steps/ImagesStep';
import Loader from '@/app/components/shared/Loader';
import { STEPS } from '@/app/utils/constants';
import { useRecipeFormState } from './recipe-steps/useRecipeFormState';

interface RecipeModalProps {
    currentUser?: SafeUser | null;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ currentUser }) => {
    const { t } = useTranslation();
    const recipeModal = useRecipeModal();
    const {
        step,
        numIngredients,
        ingredientIds,
        numSteps,
        stepIds,
        isLoading,
        selectedCoCooks,
        selectedLinkedRecipes,
        selectedQuest,
        ingredientsInputMode,
        setIngredientsInputMode,
        stepsInputMode,
        setStepsInputMode,
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        errors,
        categories,
        minutes,
        imageSrc,
        method,
        addCoCook,
        removeCoCook,
        addLinkedRecipe,
        removeLinkedRecipe,
        selectQuest,
        removeQuest,
        saveDraft,
        addIngredientInput,
        removeIngredientInput,
        setIngredients,
        addStepInput,
        removeStepInput,
        setSteps,
        actionLabel,
        secondaryActionLabel,
        isLoadingDraft,
        onBack,
        onSubmit,
        setCustomValue,
    } = useRecipeFormState({ recipeModal, currentUser });

    let bodyContent = (
        <CategoryStep
            selectedCategories={categories || []}
            onCategorySelect={(selectedCategories) =>
                setCustomValue('categories', selectedCategories)
            }
        />
    );

    // Show loader while loading draft or edit data
    if (isLoadingDraft) {
        bodyContent = <Loader height="400px" />;
    } else {
        if (step === STEPS.INGREDIENTS) {
            bodyContent = (
                <IngredientsStep
                    numIngredients={numIngredients}
                    ingredientIds={ingredientIds}
                    register={register}
                    errors={errors}
                    onAddIngredient={addIngredientInput}
                    onRemoveIngredient={removeIngredientInput}
                    onSetIngredients={setIngredients}
                    getValues={getValues}
                    setValue={setValue}
                    inputMode={ingredientsInputMode}
                    setInputMode={setIngredientsInputMode}
                />
            );
        }

        if (step === STEPS.STEPS) {
            bodyContent = (
                <RecipeStepsStep
                    numSteps={numSteps}
                    stepIds={stepIds}
                    register={register}
                    errors={errors}
                    onAddStep={addStepInput}
                    onRemoveStep={removeStepInput}
                    onSetSteps={setSteps}
                    getValues={getValues}
                    setValue={setValue}
                    inputMode={stepsInputMode}
                    setInputMode={setStepsInputMode}
                />
            );
        }

        if (step === STEPS.DESCRIPTION) {
            bodyContent = (
                <DescriptionStep
                    isLoading={isLoading}
                    register={register}
                    errors={errors}
                    minutes={minutes}
                    onMinutesChange={(value) =>
                        setCustomValue('minutes', value)
                    }
                />
            );
        }

        if (step == STEPS.METHODS) {
            bodyContent = (
                <MethodsStep
                    selectedMethod={method}
                    onMethodSelect={(selectedMethod) =>
                        setCustomValue('method', selectedMethod)
                    }
                />
            );
        }

        if (step === STEPS.RELATED_CONTENT) {
            bodyContent = (
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
        }

        if (step === STEPS.IMAGES) {
            bodyContent = (
                <ImagesStep
                    imageSrc={imageSrc}
                    imageSrc1={watch('imageSrc1')}
                    imageSrc2={watch('imageSrc2')}
                    imageSrc3={watch('imageSrc3')}
                    onImageChange={(field, value) =>
                        setCustomValue(field, value)
                    }
                />
            );
        }
    }

    return (
        <Modal
            isOpen={recipeModal.isOpen}
            onClose={recipeModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
            title={
                recipeModal.isEditMode
                    ? (t('edit_recipe') ?? 'Edit recipe')
                    : (t('post_recipe') ?? 'Post a recipe')
            }
            body={bodyContent}
            isLoading={isLoading}
            topButton={
                !recipeModal.isEditMode ? (
                    <FiUploadCloud
                        onClick={saveDraft}
                        className="cursor-pointer text-2xl text-black transition hover:opacity-70 dark:text-neutral-100"
                        data-testid="load-draft-button"
                    />
                ) : undefined
            }
        />
    );
};

export default RecipeModal;
