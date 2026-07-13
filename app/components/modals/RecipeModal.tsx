'use client';

import { useRef } from 'react';
import useSWR from 'swr';
import { axiosFetcher } from '@/app/utils/fetcher';
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

const RecipeModalContent: React.FC<{
    currentUser?: SafeUser | null;
    recipeModal: any;
    draftData?: any;
}> = ({ currentUser, recipeModal, draftData }) => {
    const { t } = useTranslation();
    const {
        step,
        numIngredients,
        numSteps,
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
        onBack,
        onSubmit,
        setCustomValue,
    } = useRecipeFormState({ recipeModal, currentUser, draftData });

    let bodyContent = (
        <CategoryStep
            selectedCategories={categories || []}
            onCategorySelect={(selectedCategories) =>
                setCustomValue('categories', selectedCategories)
            }
        />
    );

    if (step === STEPS.INGREDIENTS) {
        bodyContent = (
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
            />
        );
    }

    if (step === STEPS.STEPS) {
        bodyContent = (
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
                onMinutesChange={(value) => setCustomValue('minutes', value)}
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
                onImageChange={(field, value) => setCustomValue(field, value)}
            />
        );
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

const RecipeModal: React.FC<RecipeModalProps> = ({ currentUser }) => {
    const recipeModal = useRecipeModal();
    const { t } = useTranslation();

    const { data: draftData, isLoading: isLoadingDraft } = useSWR(
        recipeModal.isOpen && !recipeModal.isEditMode && currentUser
            ? `/api/draft`
            : null,
        axiosFetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            shouldRetryOnError: false,
        }
    );

    if (!recipeModal.isOpen) {
        return null;
    }

    if (isLoadingDraft) {
        return (
            <Modal
                isOpen={recipeModal.isOpen}
                onClose={recipeModal.onClose}
                onSubmit={() => {}}
                actionLabel=""
                title={
                    recipeModal.isEditMode
                        ? (t('edit_recipe') ?? 'Edit recipe')
                        : (t('post_recipe') ?? 'Post a recipe')
                }
                body={<Loader height="400px" />}
                isLoading={true}
            />
        );
    }

    return (
        <RecipeModalContent
            currentUser={currentUser}
            recipeModal={recipeModal}
            draftData={draftData}
        />
    );
};

export default RecipeModal;
