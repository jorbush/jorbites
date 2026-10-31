'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useRecipeModal from '@/app/hooks/useRecipeModal';
import { SafeRecipe } from '@/app/types';
import Loader from '@/app/components/shared/Loader';

interface RecipeCreateClientProps {
    forkFromRecipe?: SafeRecipe | null;
    forkFromId?: string;
}

export default function RecipeCreateClient({
    forkFromRecipe,
    forkFromId,
}: RecipeCreateClientProps) {
    const router = useRouter();

    const handleClose = useCallback(() => {
        if (forkFromId) {
            router.push(`/recipes/${forkFromId}`);
        } else {
            router.push('/');
        }
    }, [forkFromId, router]);

    useEffect(() => {
        if (forkFromRecipe && forkFromId) {
            useRecipeModal.getState().onOpenFork(
                {
                    title: forkFromRecipe.title,
                    description: forkFromRecipe.description,
                    categories: forkFromRecipe.categories,
                    method: forkFromRecipe.method,
                    ingredients: forkFromRecipe.ingredients,
                    steps: forkFromRecipe.steps,
                    minutes: forkFromRecipe.minutes,
                    prepTime: forkFromRecipe.prepTime ?? undefined,
                    cookTime: forkFromRecipe.cookTime ?? undefined,
                },
                forkFromId,
                handleClose
            );
        } else {
            useRecipeModal.getState().onOpen(handleClose);
        }

        return () => {
            const state = useRecipeModal.getState();
            if (state.isOpen) {
                state.onClose({ skipCallback: true });
            }
        };
    }, [forkFromRecipe, forkFromId, handleClose]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <Loader height="300px" />
        </div>
    );
}
