'use client';

import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { SafeRecipe, SafeUser } from '@/app/types';
import BiteCard from './BiteCard';
import BiteCardsHeader from './BiteCardsHeader';
import BiteCardsControls from './BiteCardsControls';
import BiteCardsEmptyState from './BiteCardsEmptyState';
import useLoginModal from '@/app/hooks/useLoginModal';
import { FaUtensils } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface BiteCardsContainerProps {
    initialRecipes?: SafeRecipe[];
    currentUser?: SafeUser | null;
}

const SESSION_STORAGE_KEY = 'bite_cards_progress_v2';

const saveProgressToStorage = (
    recipes: SafeRecipe[],
    currentIndex: number,
    swipedIds: string[]
) => {
    if (typeof window !== 'undefined') {
        try {
            sessionStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify({
                    recipes,
                    currentIndex,
                    swipedIds,
                })
            );
        } catch {
            // Ignore storage errors
        }
    }
};

export default function BiteCardsContainer({
    initialRecipes = [],
    currentUser,
}: BiteCardsContainerProps) {
    const router = useRouter();
    const loginModal = useLoginModal();
    const { t } = useTranslation();

    // Lazy state initializers so sessionStorage state is restored BEFORE first render
    const [recipes, setRecipes] = useState<SafeRecipe[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (
                        parsed &&
                        Array.isArray(parsed.recipes) &&
                        parsed.recipes.length > 0
                    ) {
                        return parsed.recipes;
                    }
                }
            } catch {}
        }
        return initialRecipes;
    });

    const [currentIndex, setCurrentIndex] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (typeof parsed?.currentIndex === 'number') {
                        return parsed.currentIndex;
                    }
                }
            } catch {}
        }
        return 0;
    });

    const [swipedIds, setSwipedIds] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed?.swipedIds)) {
                        return parsed.swipedIds;
                    }
                }
            } catch {}
        }
        return [];
    });

    const [history, setHistory] = useState<
        { recipe: SafeRecipe; action: 'save' | 'skip' }[]
    >([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // If initialRecipes arrived later and local recipes array was empty, update
    useEffect(() => {
        if (recipes.length === 0 && initialRecipes.length > 0) {
            setRecipes(initialRecipes);
            saveProgressToStorage(initialRecipes, 0, []);
        }
    }, [initialRecipes, recipes.length]);

    const fetchBiteCards = useCallback(
        async (excludeCurrentSession = false) => {
            setIsLoading(true);
            try {
                const idsToExclude = excludeCurrentSession
                    ? swipedIds.join(',')
                    : '';
                const res = await axios.get<SafeRecipe[]>(
                    `/api/recipes/bite-cards${idsToExclude ? `?excludeIds=${idsToExclude}` : ''}`
                );
                const fetched = res.data || [];
                setRecipes(fetched);
                setCurrentIndex(0);
                setHistory([]);
                saveProgressToStorage(fetched, 0, swipedIds);
            } catch {
                toast.error(t('bite_cards_load_error'));
            } finally {
                setIsLoading(false);
            }
        },
        [swipedIds, t]
    );

    const activeRecipes = recipes.slice(currentIndex, currentIndex + 2);
    const currentRecipe = recipes[currentIndex];

    // Swipe Actions
    const handleSwipeRight = useCallback(
        async (recipe: SafeRecipe) => {
            if (!currentUser) {
                loginModal.onOpen();
                return;
            }

            const nextIndex = currentIndex + 1;
            const updatedSwipedIds = [...swipedIds, recipe.id];
            setHistory((prev) => [...prev, { recipe, action: 'save' }]);
            setSwipedIds(updatedSwipedIds);
            setCurrentIndex(nextIndex);
            saveProgressToStorage(recipes, nextIndex, updatedSwipedIds);

            try {
                await axios.post(`/api/favorites/${recipe.id}`);
                toast.success(
                    t('bite_cards_saved_toast', { title: recipe.title }),
                    {
                        id: `fav-${recipe.id}`,
                    }
                );
            } catch {
                toast.error(t('bite_cards_save_error'));
            }
        },
        [currentUser, loginModal, currentIndex, recipes, swipedIds, t]
    );

    const handleSwipeLeft = useCallback(
        (recipe: SafeRecipe) => {
            const nextIndex = currentIndex + 1;
            const updatedSwipedIds = [...swipedIds, recipe.id];
            setHistory((prev) => [...prev, { recipe, action: 'skip' }]);
            setSwipedIds(updatedSwipedIds);
            setCurrentIndex(nextIndex);
            saveProgressToStorage(recipes, nextIndex, updatedSwipedIds);
        },
        [currentIndex, recipes, swipedIds]
    );

    // Directly navigate to recipe page on swipe top or click view recipe
    const handleSwipeUp = useCallback(
        (recipe: SafeRecipe) => {
            // Persist state before navigation so returning back restores exact card position
            saveProgressToStorage(recipes, currentIndex, swipedIds);
            router.push(`/recipes/${recipe.id}`);
        },
        [recipes, currentIndex, swipedIds, router]
    );

    const handleUndo = useCallback(() => {
        if (history.length === 0 || currentIndex === 0) return;
        const lastAction = history[history.length - 1];
        const nextIndex = Math.max(0, currentIndex - 1);
        setHistory((prev) => prev.slice(0, -1));
        setCurrentIndex(nextIndex);
        saveProgressToStorage(recipes, nextIndex, swipedIds);

        if (lastAction.action === 'save') {
            toast(`Restored "${lastAction.recipe.title}"`, { icon: '🔄' });
        }
    }, [history, currentIndex, recipes, swipedIds]);

    return (
        <div className="relative z-0 mx-auto flex h-[calc(100dvh-160px)] w-full max-w-sm flex-col pb-1 sm:max-w-md md:h-auto md:min-h-[calc(100vh-120px)]">
            {/* Header Badge */}
            <BiteCardsHeader
                currentIndex={currentIndex}
                totalRecipes={recipes.length}
            />

            {/* Card Stack Container */}
            <div className="relative z-0 min-h-0 w-full flex-1 rounded-3xl md:aspect-[3/4.1] md:max-h-[540px] md:flex-none">
                {isLoading ? (
                    <div className="absolute inset-0 flex animate-pulse flex-col items-center justify-center gap-3 rounded-3xl bg-neutral-200 text-neutral-400 dark:bg-neutral-800">
                        <FaUtensils
                            size={36}
                            className="text-green-450 animate-bounce"
                        />
                        <p className="text-xs font-semibold">
                            {t('bite_cards_loading')}
                        </p>
                    </div>
                ) : activeRecipes.length > 0 ? (
                    activeRecipes
                        .slice()
                        .reverse()
                        .map((recipe, index) => {
                            const isTop = index === activeRecipes.length - 1;
                            return (
                                <BiteCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    currentUser={currentUser}
                                    isTop={isTop}
                                    onSwipeRight={handleSwipeRight}
                                    onSwipeLeft={handleSwipeLeft}
                                    onSwipeUp={handleSwipeUp}
                                />
                            );
                        })
                ) : (
                    /* Stack Exhausted Empty State */
                    <BiteCardsEmptyState
                        onDiscoverNew={() => fetchBiteCards(true)}
                    />
                )}
            </div>

            {/* Action Buttons Control Bar */}
            {recipes.length > 0 && currentIndex < recipes.length && (
                <BiteCardsControls
                    canUndo={history.length > 0}
                    onUndo={handleUndo}
                    onSkip={() =>
                        currentRecipe && handleSwipeLeft(currentRecipe)
                    }
                    onView={() => currentRecipe && handleSwipeUp(currentRecipe)}
                    onFavorite={() =>
                        currentRecipe && handleSwipeRight(currentRecipe)
                    }
                />
            )}
        </div>
    );
}
