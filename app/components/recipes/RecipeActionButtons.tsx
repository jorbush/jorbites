'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { TbPhotoPlus, TbGitFork } from 'react-icons/tb';
import { SafeUser } from '@/app/types';
import Button from '@/app/components/buttons/Button';
import useCooksnapModal from '@/app/hooks/useCooksnapModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import useIsMounted from '@/app/hooks/useIsMounted';

interface RecipeActionButtonsProps {
    recipeId: string;
    recipeTitle: string;
    currentUser?: SafeUser | null;
}

export const RecipeActionButtons: React.FC<RecipeActionButtonsProps> = ({
    recipeId,
    recipeTitle,
    currentUser,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const mounted = useIsMounted();
    const cooksnapModal = useCooksnapModal();
    const loginModal = useLoginModal();

    const iMadeThisLabel = mounted
        ? String(t('i_made_this', { defaultValue: 'I Made This!' }))
        : 'I Made This!';

    const remixRecipeLabel = mounted
        ? String(t('remix_recipe', { defaultValue: 'Remix Recipe' }))
        : 'Remix Recipe';

    const handleCooksnapClick = () => {
        if (!currentUser) {
            loginModal.onOpen();
            return;
        }
        cooksnapModal.onOpen(recipeId, recipeTitle);
    };

    const handleRemixClick = () => {
        if (!currentUser) {
            loginModal.onOpen();
            return;
        }
        router.push(`/recipes/create?forkFrom=${recipeId}`);
    };

    return (
        <div className="flex w-full flex-wrap items-center justify-center gap-4 pt-2">
            <div className="w-[220px]">
                <Button
                    label={iMadeThisLabel}
                    icon={TbPhotoPlus}
                    onClick={handleCooksnapClick}
                    dataTestId="post-steps-cooksnap-btn"
                />
            </div>
            <div className="w-[220px]">
                <Button
                    label={remixRecipeLabel}
                    icon={TbGitFork}
                    outline
                    onClick={handleRemixClick}
                    dataTestId="remix-recipe-btn"
                    dataCy="remix-recipe-btn"
                />
            </div>
        </div>
    );
};

export default RecipeActionButtons;
