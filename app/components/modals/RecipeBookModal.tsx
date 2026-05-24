'use client';

import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { SafeRecipe } from '@/app/types';
import { RecipeBookConfig } from '@/app/utils/recipeBookUtils';

import Modal from '@/app/components/modals/Modal';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import Dropdown from '@/app/components/utils/Dropdown';
import useRecipeBookModal from '@/app/hooks/useRecipeBookModal';

const RecipeBookModal = () => {
    const recipeBookModal = useRecipeBookModal();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const [imageDisplay, setImageDisplay] =
        useState<RecipeBookConfig['imageDisplay']>('random');
    const [displayExtraImages, setDisplayExtraImages] = useState(true);
    const [displayUserImage, setDisplayUserImage] = useState(true);

    useEffect(() => {
        if (recipeBookModal.isOpen) {
            setImageDisplay('random');
            setDisplayExtraImages(true);
            setDisplayUserImage(true);
        }
    }, [recipeBookModal.isOpen]);

    const imageDisplayOptions: {
        value: RecipeBookConfig['imageDisplay'];
        label: string;
    }[] = [
        { value: 'random', label: t('random') || 'Random' },
        { value: 'left-top', label: t('top_left') || 'Top Left' },
        { value: 'right-top', label: t('top_right') || 'Top Right' },
        { value: 'left-bottom', label: t('bottom_left') || 'Bottom Left' },
        { value: 'right-bottom', label: t('bottom_right') || 'Bottom Right' },
    ];

    const currentOption = imageDisplayOptions.find(
        (opt) => opt.value === imageDisplay
    );
    const dropdownButton = (
        <span className="text-sm font-medium">{currentOption?.label}</span>
    );

    const handleGenerate = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        const loadingToast = toast.loading(
            t('recipe_book_generating') || 'Generating recipe book...'
        );

        try {
            // 1. Fetch recipes
            const response = await axios.get<SafeRecipe[]>(
                `/api/user/${recipeBookModal.userId}/recipes`
            );
            const recipes = response.data;

            if (!recipes || recipes.length === 0) {
                toast.error(
                    t('recipe_book_no_recipes') ||
                        'You have no recipes to generate a book.',
                    {
                        id: loadingToast,
                    }
                );
                return;
            }

            // 2. Load PDF Renderer dynamically
            const [{ pdf }, { RecipeBookPDF }] = await Promise.all([
                import('@react-pdf/renderer'),
                import('@/app/components/profile/RecipeBookPDF'),
            ]);

            // 3. Prepare translations
            const labels = {
                title: t('recipe_book') || 'Recipe Book',
                createdBy: t('recipe_book_cover_by') || 'Created by',
                subtitle:
                    t('recipe_book_cover_subtitle', {
                        count: recipes.length,
                    }) || `Collection of ${recipes.length} recipes`,
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

            const translatedRecipes = recipes.map((recipe) => ({
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

            // 4. Generate the PDF
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
                    recipes={translatedRecipes}
                    userName={recipeBookModal.userName}
                    userImage={recipeBookModal.userImage}
                    logoUrl={logoUrl}
                    labels={labels}
                    config={config}
                />
            );

            const blob = await pdf(doc).toBlob();

            // 5. Download the PDF
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
        imageDisplay,
        displayExtraImages,
        displayUserImage,
        recipeBookModal,
        t,
    ]);

    const bodyContent = (
        <div className="flex flex-col gap-6">
            {/* Dropdown field */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        {t('recipe_image_display') || 'Recipe image display'}
                    </span>
                </div>
                <Dropdown
                    options={imageDisplayOptions}
                    value={imageDisplay}
                    onChange={(val) => setImageDisplay(val)}
                    buttonContent={dropdownButton}
                    ariaLabel={
                        t('recipe_image_display') || 'Recipe image display'
                    }
                    data-cy="image-display-dropdown"
                />
            </div>

            {/* Switch: Display extra images */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {t('display_extra_images') || 'Display extra images'}
                </span>
                <ToggleSwitch
                    checked={displayExtraImages}
                    onChange={() => setDisplayExtraImages(!displayExtraImages)}
                    dataCy="extra-images-toggle"
                />
            </div>

            {/* Switch: Display user image on cover */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {t('display_user_image_in_cover') ||
                        'Display user image on cover'}
                </span>
                <ToggleSwitch
                    checked={displayUserImage}
                    onChange={() => setDisplayUserImage(!displayUserImage)}
                    dataCy="user-image-toggle"
                />
            </div>
        </div>
    );

    return (
        <Modal
            disabled={isLoading}
            isLoading={isLoading}
            isOpen={recipeBookModal.isOpen}
            title={t('recipe_book') ?? 'Recipe Book'}
            actionLabel={t('generate_recipe_book') ?? 'Generate Recipe Book'}
            onClose={recipeBookModal.onClose}
            onSubmit={handleGenerate}
            body={bodyContent}
        />
    );
};

export default RecipeBookModal;
