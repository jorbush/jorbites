'use client';

import { useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { axiosFetcher } from '@/app/utils/fetcher';
import useRecipeModal, { RecipeModalStore } from '@/app/hooks/useRecipeModal';
import useDraftsModal from '@/app/hooks/useDraftsModal';
import Modal from '@/app/components/modals/Modal';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import Loader from '@/app/components/shared/Loader';
import { STEPS } from '@/app/utils/constants';
import { useRecipeFormState } from './recipe-steps/useRecipeFormState';
import RecipeModalTopActions from './recipe-steps/RecipeModalTopActions';
import RecipeModalStepBody from './recipe-steps/RecipeModalStepBody';
import { DraftSummary } from '@/app/types/draft';

interface RecipeModalProps {
    currentUser?: SafeUser | null;
}

const RecipeModalContent: React.FC<{
    currentUser?: SafeUser | null;
    recipeModal: RecipeModalStore;
    onClose: () => void;
}> = ({ currentUser, recipeModal, onClose }) => {
    const { t } = useTranslation();
    const draftsModal = useDraftsModal();
    const { data: activeDrafts } = useSWR<DraftSummary[]>(
        recipeModal.isOpen && currentUser ? '/api/draft/active' : null,
        axiosFetcher,
        {
            revalidateOnFocus: true,
            revalidateOnMount: true,
            dedupingInterval: 0,
        }
    );
    const hasDrafts = Boolean(activeDrafts && activeDrafts.length > 0);

    const {
        step,
        numIngredients,
        numSteps,
        isLoading,
        isSaving,
        isDirty,
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
        flushDraftSaves,
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
        draftData,
        isLoadingDraft,
    } = useRecipeFormState({
        recipeModal,
        currentUser,
    });

    const handleOpenDrafts = useCallback(async () => {
        if (isDirty) {
            const saved = await saveDraft();
            await flushDraftSaves();
            if (!saved) return;
        }

        onClose();
        draftsModal.onOpen();
    }, [draftsModal, flushDraftSaves, isDirty, onClose, saveDraft]);

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
        draftData?.type === 'shared' ||
        (draftData?.coCooks && draftData.coCooks.length > 0) ||
        selectedCoCooks.length > 0 ||
        draftData?.ownerName ||
        isCurrentStepLocked ||
        otherActiveLocks.length > 0
    );

    if (isLoadingDraft && !draftData) {
        return (
            <Modal
                isOpen={recipeModal.isOpen}
                onClose={onClose}
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
        <Modal
            isOpen={recipeModal.isOpen}
            onClose={onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
            title={
                recipeModal.isEditMode
                    ? (t('edit_recipe') ?? 'Edit recipe')
                    : (t('post_recipe') ?? 'Post a recipe')
            }
            body={
                <RecipeModalStepBody
                    step={step}
                    isCurrentStepLocked={isCurrentStepLocked}
                    lockOwner={lockOwner}
                    isSharedSession={isSharedSession}
                    otherActiveLocks={otherActiveLocks}
                    categories={categories}
                    setCustomValue={setCustomValue}
                    numIngredients={numIngredients}
                    register={register}
                    errors={errors}
                    addIngredientInput={addIngredientInput}
                    removeIngredientInput={removeIngredientInput}
                    setIngredients={setIngredients}
                    getValues={getValues}
                    setValue={setValue}
                    ingredientsInputMode={ingredientsInputMode}
                    setIngredientsInputMode={setIngredientsInputMode}
                    numSteps={numSteps}
                    addStepInput={addStepInput}
                    removeStepInput={removeStepInput}
                    setSteps={setSteps}
                    stepsInputMode={stepsInputMode}
                    setStepsInputMode={setStepsInputMode}
                    isLoading={isLoading}
                    minutes={minutes}
                    prepTime={prepTime}
                    cookTime={cookTime}
                    method={method}
                    selectedCoCooks={selectedCoCooks}
                    selectedLinkedRecipes={selectedLinkedRecipes}
                    selectedQuest={selectedQuest}
                    addCoCook={addCoCook}
                    removeCoCook={removeCoCook}
                    addLinkedRecipe={addLinkedRecipe}
                    removeLinkedRecipe={removeLinkedRecipe}
                    selectQuest={selectQuest}
                    removeQuest={removeQuest}
                    imageSrc={imageSrc}
                />
            }
            isLoading={isLoading}
            topButton={
                !recipeModal.isEditMode ? (
                    <RecipeModalTopActions
                        onSaveDraft={saveDraft}
                        onOpenDrafts={handleOpenDrafts}
                        hasDrafts={hasDrafts}
                        isSaving={isSaving}
                    />
                ) : undefined
            }
        />
    );
};

const RecipeModalComponent: React.FC<RecipeModalProps> = ({ currentUser }) => {
    const recipeModal = useRecipeModal();
    const searchParams = useSearchParams();
    const draftQueryParam = searchParams?.get('draft');
    const currentUserRef = useRef<SafeUser | null>(currentUser || null);
    const autoOpenedDraftRef = useRef<string | null>(null);

    useEffect(() => {
        currentUserRef.current = currentUser || null;
    }, [currentUser]);

    const isOpen = recipeModal.isOpen;
    const isEditMode = recipeModal.isEditMode;
    const onOpenSharedDraft = recipeModal.onOpenSharedDraft;

    useEffect(() => {
        if (
            draftQueryParam &&
            draftQueryParam !== autoOpenedDraftRef.current &&
            !isOpen &&
            !isEditMode
        ) {
            autoOpenedDraftRef.current = draftQueryParam;
            onOpenSharedDraft(draftQueryParam);
        }
    }, [draftQueryParam, isOpen, isEditMode, onOpenSharedDraft]);

    const onClose = recipeModal.onClose;
    const handleClose = useCallback(() => {
        onClose();
        if (
            typeof window !== 'undefined' &&
            window.location.search.includes('draft=')
        ) {
            const url = new URL(window.location.href);
            url.searchParams.delete('draft');
            url.searchParams.delete('joined');
            window.history.replaceState(
                {},
                '',
                url.pathname + (url.search ? url.search : '')
            );
        }
    }, [onClose]);

    if (!recipeModal.isOpen) {
        return null;
    }

    return (
        <RecipeModalContent
            currentUser={currentUser}
            recipeModal={recipeModal}
            onClose={handleClose}
        />
    );
};

const RecipeModal: React.FC<RecipeModalProps> = (props) => (
    <Suspense fallback={null}>
        <RecipeModalComponent {...props} />
    </Suspense>
);

export default RecipeModal;
