'use client';

import { useCallback, useState, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { SafeRecipe } from '@/app/types';

import Modal from '@/app/components/modals/Modal';
import useRecipeBookModal from '@/app/hooks/useRecipeBookModal';
import {
    recipeBookReducer,
    RecipeBookState,
} from '@/app/hooks/recipeBookReducer';
import RecipeBookConfigStep from './recipe-book-steps/RecipeBookConfigStep';
import RecipeBookSelectStep from './recipe-book-steps/RecipeBookSelectStep';

const RECIPE_BOOK_STEPS = {
    CONFIG: 0,
    SELECT_RECIPES: 1,
} as const;

type RecipeBookStep =
    (typeof RECIPE_BOOK_STEPS)[keyof typeof RECIPE_BOOK_STEPS];

const INITIAL_STATE: RecipeBookState = {
    imageDisplay: 'random',
    displayExtraImages: true,
    displayUserImage: true,
    selectedRecipeIds: new Set<string>(),
    allRecipeIds: [],
};

const RecipeBookModal = () => {
    const recipeBookModal = useRecipeBookModal();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<RecipeBookStep>(RECIPE_BOOK_STEPS.CONFIG);
    const [recipes, setRecipes] = useState<SafeRecipe[]>([]);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

    const [state, dispatch] = useReducer(recipeBookReducer, INITIAL_STATE);
    const {
        imageDisplay,
        displayExtraImages,
        displayUserImage,
        selectedRecipeIds,
    } = state;

    // Reset everything when the modal opens
    useEffect(() => {
        if (recipeBookModal.isOpen) {
            dispatch({ type: 'RESET' });
            setStep(RECIPE_BOOK_STEPS.CONFIG);
            setRecipes([]);
        }
    }, [recipeBookModal.isOpen]);

    const fetchRecipes = useCallback(async () => {
        if (isLoadingRecipes || recipes.length > 0) return;
        setIsLoadingRecipes(true);
        try {
            const response = await axios.get<SafeRecipe[]>(
                `/api/user/${recipeBookModal.userId}/recipes`
            );
            const fetchedRecipes = response.data || [];
            setRecipes(fetchedRecipes);
            dispatch({
                type: 'SET_RECIPES',
                payload: fetchedRecipes.map((r) => r.id),
            });
        } catch (error) {
            console.error('Failed to fetch recipes', error);
            toast.error(t('something_went_wrong') || 'Failed to load recipes.');
        } finally {
            setIsLoadingRecipes(false);
        }
    }, [isLoadingRecipes, recipes.length, recipeBookModal.userId, t]);

    const handleNext = useCallback(() => {
        setStep(RECIPE_BOOK_STEPS.SELECT_RECIPES);
        fetchRecipes();
    }, [fetchRecipes]);

    const handleBack = useCallback(() => {
        setStep(RECIPE_BOOK_STEPS.CONFIG);
    }, []);

    const handleGenerate = useCallback(async () => {
        if (isLoading) return;

        const selectedRecipes = recipes.filter((r) =>
            selectedRecipeIds.has(r.id)
        );

        if (selectedRecipes.length === 0) {
            toast.error(
                t('recipe_book_no_recipes') ||
                    'You have no recipes to generate a book.'
            );
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading(
            t('recipe_book_generating') || 'Generating recipe book...'
        );

        try {
            // 1. Load PDF Renderer dynamically
            const [pdfRenderer, { RecipeBookPDF }] = await Promise.all([
                import('@react-pdf/renderer'),
                import('@/app/components/profile/RecipeBookPDF'),
            ]);

            // 2. Prepare translations
            const labels = {
                title: t('recipe_book') || 'Recipe Book',
                createdBy: t('recipe_book_cover_by') || 'Created by',
                subtitle:
                    t('recipe_book_cover_subtitle', {
                        count: selectedRecipes.length,
                    }) || `Collection of ${selectedRecipes.length} recipes`,
                ingredients: t('ingredients') || 'Ingredients',
                steps: t('steps') || 'Steps',
                minutes: t('minutes') || 'Minutes',
                method: t('method') || 'Method',
                categories: t('categories') || 'Categories',
                page: t('page') || 'Page',
                of: t('of') || 'of',
                tableOfContents: t('table_of_contents') || 'Table of Contents',
                timeUnit: (t('minutes') || 'minutes').toLowerCase(),
                recipes: (t('recipes') || 'recipes').toLowerCase(),
            };

            const translatedRecipes = selectedRecipes.map((recipe) => ({
                ...recipe,
                method: recipe.method
                    ? t(recipe.method.toLowerCase()) || recipe.method
                    : recipe.method,
                categories: recipe.categories
                    ? recipe.categories.map(
                          (cat) => t(cat.toLowerCase()) || cat
                      )
                    : recipe.categories,
            }));

            // 3. Generate the PDF
            const logoUrl =
                typeof window !== 'undefined'
                    ? `${window.location.origin}/images/logo-nobg.png`
                    : '/images/logo-nobg.png';

            const config = {
                imageDisplay,
                displayExtraImages,
                displayUserImage,
            };

            const doc = (
                <RecipeBookPDF
                    pdfRenderer={pdfRenderer}
                    recipes={translatedRecipes}
                    userName={recipeBookModal.userName}
                    userImage={recipeBookModal.userImage}
                    logoUrl={logoUrl}
                    labels={labels}
                    config={config}
                />
            );

            const blob = await pdfRenderer.pdf(doc).toBlob();

            // 4. Download the PDF
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${recipeBookModal.userName.replace(/\s+/g, '_')}_Recipe_Book.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(
                t('recipe_book_generated_success') ||
                    'Recipe book generated successfully!',
                {
                    id: loadingToast,
                }
            );

            recipeBookModal.onClose();
        } catch (error: any) {
            console.error('Failed to generate recipe book PDF', error);
            toast.error(
                t('something_went_wrong') || 'Failed to generate recipe book.',
                {
                    id: loadingToast,
                }
            );
        } finally {
            setIsLoading(false);
        }
    }, [
        isLoading,
        recipes,
        selectedRecipeIds,
        imageDisplay,
        displayExtraImages,
        displayUserImage,
        recipeBookModal,
        t,
    ]);

    const isConfigStep = step === RECIPE_BOOK_STEPS.CONFIG;

    const bodyContent = isConfigStep ? (
        <RecipeBookConfigStep
            config={state}
            dispatch={dispatch}
        />
    ) : (
        <RecipeBookSelectStep
            recipes={recipes}
            isLoadingRecipes={isLoadingRecipes}
            selectedRecipeIds={selectedRecipeIds}
            dispatch={dispatch}
        />
    );

    return (
        <Modal
            disabled={isLoading}
            isLoading={isLoading}
            isOpen={recipeBookModal.isOpen}
            title={t('recipe_book') ?? 'Recipe Book'}
            actionLabel={
                isConfigStep
                    ? (t('next') ?? 'Next')
                    : (t('generate_recipe_book') ?? 'Generate Recipe Book')
            }
            secondaryActionLabel={
                isConfigStep ? undefined : (t('back') ?? 'Back')
            }
            secondaryAction={isConfigStep ? undefined : handleBack}
            onClose={recipeBookModal.onClose}
            onSubmit={isConfigStep ? handleNext : handleGenerate}
            body={bodyContent}
        />
    );
};

export default RecipeBookModal;
