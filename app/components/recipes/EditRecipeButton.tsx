'use client';

import { AiOutlineEdit } from 'react-icons/ai';
import Button from '@/app/components/buttons/Button';
import { useTranslation } from 'react-i18next';
import useRecipeModal, { EditRecipeData } from '@/app/hooks/useRecipeModal';
import { SafeRecipe, SafeUser } from '@/app/types';
import { useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface EditRecipeButtonProps {
    recipe: SafeRecipe & {
        user: SafeUser;
        coCooksIds?: string[];
        linkedRecipeIds?: string[];
    };
}

const EditRecipeButton: React.FC<EditRecipeButtonProps> = ({ recipe }) => {
    const { t } = useTranslation();
    const recipeModal = useRecipeModal();

    const onClick = useCallback(async () => {
        try {
            const recipeCategories = recipe.categories || [];

            const editData: EditRecipeData = {
                id: recipe.id,
                title: recipe.title,
                description: recipe.description,
                categories: recipeCategories,
                method: recipe.method,
                imageSrc: recipe.imageSrc,
                imageSrc1: recipe.extraImages?.[0] || '',
                imageSrc2: recipe.extraImages?.[1] || '',
                imageSrc3: recipe.extraImages?.[2] || '',
                ingredients: recipe.ingredients,
                steps: recipe.steps,
                minutes: recipe.minutes,
                coCooksIds: recipe.coCooksIds || [],
                linkedRecipeIds: recipe.linkedRecipeIds || [],
                youtubeUrl: recipe.youtubeUrl || '',
                questId: recipe.questId || '',
            };

            if (recipe.coCooksIds && recipe.coCooksIds.length > 0) {
                try {
                    const cooksResponse = await axios.get(
                        `/api/users/multiple?ids=${recipe.coCooksIds.join(',')}`
                    );
                    editData.coCooks = cooksResponse.data;
                } catch (error) {
                    console.error('Failed to load co-cooks', error);
                }
            }

            if (recipe.linkedRecipeIds && recipe.linkedRecipeIds.length > 0) {
                try {
                    const recipesResponse = await axios.get(
                        `/api/recipes/multiple?ids=${recipe.linkedRecipeIds.join(',')}`
                    );
                    editData.linkedRecipes = recipesResponse.data;
                } catch (error) {
                    console.error('Failed to load linked recipes', error);
                }
            }

            recipeModal.onOpenEdit(editData);
        } catch (error) {
            console.error('Failed to prepare edit data', error);
            toast.error(t('something_went_wrong') ?? 'Something went wrong');
        }
    }, [recipe, recipeModal, t]);

    return (
        <div className="flex w-full flex-row items-center justify-center">
            <div className="w-[240px]">
                <Button
                    label={t('edit_recipe')}
                    icon={AiOutlineEdit}
                    onClick={onClick}
                    dataCy="edit-recipe"
                />
            </div>
        </div>
    );
};

export default EditRecipeButton;
