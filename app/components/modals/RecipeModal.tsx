'use client';

import { useRef, useEffect } from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { axiosFetcher } from '@/app/utils/fetcher';
import useRecipeModal from '@/app/hooks/useRecipeModal';
import Modal from '@/app/components/modals/Modal';
import { useTranslation } from 'react-i18next';
import { FiUploadCloud, FiShare2 } from 'react-icons/fi';
import Tooltip from '@/app/components/utils/Tooltip';
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
        prepTime,
        cookTime,
        imageSrc,
        method,
        addCoCook,
        removeCoCook,
        addLinkedRecipe,
        removeLinkedRecipe,
        selectQuest,
        removeQuest,
        saveDraft,
        copyInviteLink,
        lock,
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

    const isCurrentStepLocked = lock?.isLockedByOther(`step:${step}`);
    const lockOwner = lock?.getLockOwner(`step:${step}`);

    const lockBanner =
        isCurrentStepLocked && lockOwner ? (
            <div
                data-testid="lock-banner"
                className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-200"
            >
                <span>🔒</span>
                <span>
                    {lockOwner.userName
                        ? t('lock_step_editing', {
                              userName: lockOwner.userName,
                          }) ||
                          `@${lockOwner.userName} is currently editing this step`
                        : t('lock_step_editing_generic') ||
                          'A co-cook is currently editing this step'}
                </span>
            </div>
        ) : null;

    let bodyContent = (
        <div>
            {lockBanner}
            <div
                className={
                    isCurrentStepLocked ? 'pointer-events-none opacity-60' : ''
                }
            >
                <CategoryStep
                    selectedCategories={categories || []}
                    onCategorySelect={(selectedCategories) =>
                        setCustomValue('categories', selectedCategories)
                    }
                />
            </div>
        </div>
    );

    if (step === STEPS.INGREDIENTS) {
        bodyContent = (
            <div>
                {lockBanner}
                <div
                    className={
                        isCurrentStepLocked
                            ? 'pointer-events-none opacity-60'
                            : ''
                    }
                >
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
                </div>
            </div>
        );
    }

    if (step === STEPS.STEPS) {
        bodyContent = (
            <div>
                {lockBanner}
                <div
                    className={
                        isCurrentStepLocked
                            ? 'pointer-events-none opacity-60'
                            : ''
                    }
                >
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
                </div>
            </div>
        );
    }

    if (step === STEPS.DESCRIPTION) {
        bodyContent = (
            <div>
                {lockBanner}
                <div
                    className={
                        isCurrentStepLocked
                            ? 'pointer-events-none opacity-60'
                            : ''
                    }
                >
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
                    />
                </div>
            </div>
        );
    }

    if (step === STEPS.METHODS) {
        bodyContent = (
            <div>
                {lockBanner}
                <div
                    className={
                        isCurrentStepLocked
                            ? 'pointer-events-none opacity-60'
                            : ''
                    }
                >
                    <MethodsStep
                        selectedMethod={method}
                        onMethodSelect={(selectedMethod) =>
                            setCustomValue('method', selectedMethod)
                        }
                    />
                </div>
            </div>
        );
    }

    if (step === STEPS.RELATED_CONTENT) {
        bodyContent = (
            <div>
                {lockBanner}
                <div
                    className={
                        isCurrentStepLocked
                            ? 'pointer-events-none opacity-60'
                            : ''
                    }
                >
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            {t('collaborative_co_cooking') ||
                                'Collaborative Co-Cooking'}
                        </span>
                        <Tooltip
                            text={
                                t('copy_co_cook_link_tooltip') ||
                                'Copy co-cook invite link'
                            }
                        >
                            <button
                                type="button"
                                onClick={copyInviteLink}
                                data-testid="step-copy-co-cook-link-button"
                                className="bg-green-450/20 hover:bg-green-450/30 dark:bg-green-450/10 dark:hover:bg-green-450/20 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-neutral-900 transition dark:text-neutral-100"
                            >
                                <FiShare2 className="text-green-450 text-sm" />
                                <span>
                                    {t('copy_co_cook_link') ||
                                        'Copy Invite Link'}
                                </span>
                            </button>
                        </Tooltip>
                    </div>
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
                </div>
            </div>
        );
    }

    if (step === STEPS.IMAGES) {
        bodyContent = (
            <div>
                {lockBanner}
                <div
                    className={
                        isCurrentStepLocked
                            ? 'pointer-events-none opacity-60'
                            : ''
                    }
                >
                    <ImagesStep
                        imageSrc={imageSrc}
                        imageSrc1={watch('imageSrc1')}
                        imageSrc2={watch('imageSrc2')}
                        imageSrc3={watch('imageSrc3')}
                        onImageChange={(field, value) =>
                            setCustomValue(field, value)
                        }
                    />
                </div>
            </div>
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
                    <div className="flex items-center gap-3">
                        <Tooltip
                            text={
                                t('copy_co_cook_link_tooltip') ||
                                'Copy co-cook invite link'
                            }
                        >
                            <button
                                type="button"
                                onClick={copyInviteLink}
                                aria-label={
                                    t('copy_co_cook_link') || 'Copy invite link'
                                }
                                data-testid="copy-co-cook-link-button"
                                className="hover:text-green-450 dark:hover:text-green-450 flex cursor-pointer items-center justify-center text-2xl text-black transition dark:text-neutral-100"
                            >
                                <FiShare2 />
                            </button>
                        </Tooltip>
                        <Tooltip text={t('save_draft_tooltip') || 'Save draft'}>
                            <button
                                type="button"
                                onClick={saveDraft}
                                aria-label={t('save_draft') || 'Save draft'}
                                data-testid="load-draft-button"
                                className="hover:text-green-450 dark:hover:text-green-450 flex cursor-pointer items-center justify-center text-2xl text-black transition dark:text-neutral-100"
                            >
                                <FiUploadCloud />
                            </button>
                        </Tooltip>
                    </div>
                ) : undefined
            }
        />
    );
};

const RecipeModal: React.FC<RecipeModalProps> = ({ currentUser }) => {
    const recipeModal = useRecipeModal();
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const draftQueryParam = searchParams?.get('draft');
    const currentUserRef = useRef<SafeUser | null>(currentUser || null);

    useEffect(() => {
        currentUserRef.current = currentUser || null;
    }, [currentUser]);

    const activeDraftId = recipeModal.activeDraftId || draftQueryParam;

    const isOpen = recipeModal.isOpen;
    const isEditMode = recipeModal.isEditMode;
    const onOpenSharedDraft = recipeModal.onOpenSharedDraft;

    useEffect(() => {
        if (draftQueryParam && !isOpen && !isEditMode) {
            onOpenSharedDraft(draftQueryParam);
        }
    }, [draftQueryParam, isOpen, isEditMode, onOpenSharedDraft]);

    const draftEndpoint = activeDraftId
        ? `/api/draft?draftId=${activeDraftId}`
        : `/api/draft`;

    const { data: draftData, isLoading: isLoadingDraft } = useSWR(
        recipeModal.isOpen && !recipeModal.isEditMode && currentUserRef.current
            ? draftEndpoint
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
