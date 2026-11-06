'use client';

import { useTranslation } from 'react-i18next';
import { FiBookOpen } from 'react-icons/fi';
import useRecipeBookModal from '@/app/hooks/useRecipeBookModal';

interface RecipeBookButtonProps {
    userId: string;
    userName: string;
    userImage?: string | null;
    className?: string;
}

export const RecipeBookButton: React.FC<RecipeBookButtonProps> = ({
    userId,
    userName,
    userImage,
    className,
}) => {
    const { t } = useTranslation();
    const recipeBookModal = useRecipeBookModal();

    const openRecipeBookModal = () => {
        recipeBookModal.onOpen(userId, userName, userImage);
    };

    const defaultButtonClass =
        'flex size-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100/80 text-neutral-600 shadow-2xs transition-colors duration-200 hover:border-neutral-300 hover:text-neutral-900 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 sm:size-10 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white';

    return (
        <button
            type="button"
            onClick={openRecipeBookModal}
            className={className || defaultButtonClass}
            title={t('generate_recipe_book') || 'Generate Recipe Book'}
            aria-label={t('generate_recipe_book') || 'Generate Recipe Book'}
            data-cy="recipe-book-button"
            data-testid="recipe-book-button"
        >
            <FiBookOpen
                className="size-4 sm:size-4.5"
                data-testid="book-icon"
            />
        </button>
    );
};

export default RecipeBookButton;
