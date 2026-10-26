'use client';

import { useEffect, useRef, useCallback } from 'react';
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
    const recipeModal = useRecipeModal();
    const initializedRef = useRef(false);
    const isUnmountingRef = useRef(false);

    const handleClose = useCallback(() => {
        if (isUnmountingRef.current) return;
        if (forkFromId) {
            router.push(`/recipes/${forkFromId}`);
        } else {
            router.push('/');
        }
    }, [forkFromId, router]);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        if (forkFromRecipe && forkFromId) {
            recipeModal.onOpenFork(
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
            recipeModal.onOpen(handleClose);
        }

        return () => {
            isUnmountingRef.current = true;
            recipeModal.onClose();
        };
    }, [forkFromRecipe, forkFromId, recipeModal, handleClose]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <Loader height="300px" />
        </div>
    );
}
