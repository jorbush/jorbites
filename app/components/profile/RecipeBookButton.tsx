'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiBookOpen, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { SafeRecipe } from '@/app/types';

interface RecipeBookButtonProps {
    userId: string;
    userName: string;
}

export const RecipeBookButton: React.FC<RecipeBookButtonProps> = ({
    userId,
    userName,
}) => {
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (isGenerating) return;

        setIsGenerating(true);
        const loadingToast = toast.loading(
            t('recipe_book_generating') || 'Generating recipe book...'
        );

        try {
            // 1. Fetch recipes
            const response = await axios.get<SafeRecipe[]>(
                `/api/user/${userId}/recipes`
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

            // 2. Load PDF Renderer and components dynamically
            const [{ pdf }, { RecipeBookPDF }] = await Promise.all([
                import('@react-pdf/renderer'),
                import('./RecipeBookPDF'),
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

            const doc = (
                <RecipeBookPDF
                    recipes={translatedRecipes}
                    userName={userName}
                    logoUrl={logoUrl}
                    labels={labels}
                />
            );

            const blob = await pdf(doc).toBlob();

            // 5. Download the PDF
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${userName.replace(/\s+/g, '_')}_Recipe_Book.pdf`;
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
        } catch (error: any) {
            console.error('Failed to generate recipe book PDF', error);
            toast.error(
                t('something_went_wrong') || 'Failed to generate recipe book.',
                {
                    id: loadingToast,
                }
            );
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex cursor-pointer items-center space-x-2 text-neutral-600 transition hover:text-green-600 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-100 dark:hover:text-green-400"
            title={t('generate_recipe_book') || 'Generate Recipe Book'}
            aria-label={t('generate_recipe_book') || 'Generate Recipe Book'}
            data-cy="recipe-book-button"
            data-testid="recipe-book-button"
        >
            {isGenerating ? (
                <FiLoader
                    className="h-5 w-5 animate-spin"
                    data-testid="loader-icon"
                />
            ) : (
                <FiBookOpen
                    className="h-5 w-5"
                    data-testid="book-icon"
                />
            )}
        </button>
    );
};

export default RecipeBookButton;
