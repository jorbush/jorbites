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
    mutateDraft?: () => Promise<any>;
}> = ({ currentUser, recipeModal, draftData, mutateDraft }) => {
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
    } = useRecipeFormState({
        recipeModal,
        currentUser,
        draftData,
        mutateDraft,
    });

    const isCurrentStepLocked = lock?.isLockedByOther(`step:${step}`);
    const lockOwner = lock?.getLockOwner(`step:${step}`);

    // Active locks on other steps held by co-cooks
    const otherActiveLocks = Object.entries(lock?.locks || {}).filter(
        ([key, info]) =>
            key !== `step:${step}` &&
            key.startsWith('step:') &&
            info &&
            info.userId !== currentUser?.id
    );

    const isSharedSession = Boolean(
        draftData?.isShared ||
        (draftData?.coCooks && draftData.coCooks.length > 0) ||
        selectedCoCooks.length > 0 ||
        draftData?.ownerName ||
        isCurrentStepLocked ||
        otherActiveLocks.length > 0
    );

    const lockBanner =
        isCurrentStepLocked && lockOwner ? (
            <div
                data-testid="lock-banner"
                className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
            >
                <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-amber-500"></span>
                </span>
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
        ) : isSharedSession && otherActiveLocks.length > 0 ? (
            <div
                data-testid="co-cook-activity-banner"
                className="border-green-450/20 bg-green-450/10 dark:border-green-450/20 dark:bg-green-450/10 mb-4 flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium text-green-800 dark:text-green-300"
            >
                <span className="relative flex size-2 shrink-0">
                    <span className="bg-green-450 absolute inline-flex size-full animate-ping rounded-full opacity-75"></span>
                    <span className="bg-green-450 relative inline-flex size-2 rounded-full"></span>
                </span>
                <span>
                    {otherActiveLocks[0][1].userName
                        ? t('co_cook_active_other_step', {
                              userName: otherActiveLocks[0][1].userName,
                          }) ||
                          `@${otherActiveLocks[0][1].userName} is currently editing another step`
                        : t('co_cook_active_other_step_generic') ||
                          'A co-cook is currently editing another step'}
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
                        isLocked={isCurrentStepLocked}
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
                        isLocked={isCurrentStepLocked}
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
                        isLocked={isCurrentStepLocked}
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

    const {
        data: draftData,
        isLoading: isLoadingDraft,
        mutate: mutateDraft,
    } = useSWR(
        recipeModal.isOpen && !recipeModal.isEditMode && currentUserRef.current
            ? draftEndpoint
            : null,
        axiosFetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 3000,
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
            mutateDraft={mutateDraft}
        />
    );
};

export default RecipeModal;
