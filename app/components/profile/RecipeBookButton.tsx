'use client';

import { useTranslation } from 'react-i18next';
import { FiBookOpen } from 'react-icons/fi';
import useRecipeBookModal from '@/app/hooks/useRecipeBookModal';

interface RecipeBookButtonProps {
    userId: string;
    userName: string;
    userImage?: string | null;
}

export const RecipeBookButton: React.FC<RecipeBookButtonProps> = ({
    userId,
    userName,
    userImage,
}) => {
    const { t } = useTranslation();
    const recipeBookModal = useRecipeBookModal();

    const handleClick = () => {
        recipeBookModal.onOpen(userId, userName, userImage);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="flex cursor-pointer items-center space-x-2 text-neutral-600 transition hover:text-green-600 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-100 dark:hover:text-green-400"
            title={t('generate_recipe_book') || 'Generate Recipe Book'}
            aria-label={t('generate_recipe_book') || 'Generate Recipe Book'}
            data-cy="recipe-book-button"
            data-testid="recipe-book-button"
        >
            <FiBookOpen
                className="size-5"
                data-testid="book-icon"
            />
        </button>
    );
};

export default RecipeBookButton;
