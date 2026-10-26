'use client';

import { useEffect, useRef } from 'react';
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
    const wasOpenRef = useRef(false);

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
                forkFromId
            );
        } else {
            recipeModal.onOpen();
        }
    }, [forkFromRecipe, forkFromId, recipeModal]);

    // Handle user closing modal while on /recipes/create
    useEffect(() => {
        if (recipeModal.isOpen) {
            wasOpenRef.current = true;
        } else if (wasOpenRef.current) {
            if (forkFromId) {
                router.push(`/recipes/${forkFromId}`);
            } else {
                router.push('/');
            }
        }
    }, [recipeModal.isOpen, forkFromId, router]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <Loader height="300px" />
        </div>
    );
}
