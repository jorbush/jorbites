'use client';

import { useState, useEffect, useCallback } from 'react';

export function useRecipeChecklist(
    recipeId: string | undefined,
    type: 'ingredients' | 'steps'
) {
    const storageKey = recipeId ? `jorbites_recipe_${recipeId}_${type}` : null;
    const [checkedIndices, setCheckedIndices] = useState<Set<number>>(
        new Set()
    );

    useEffect(() => {
        if (!storageKey || typeof window === 'undefined') return;
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setCheckedIndices(
                        new Set(
                            parsed.filter(
                                (n): n is number => typeof n === 'number'
                            )
                        )
                    );
                }
            }
        } catch {
            // Ignore localStorage errors
        }
    }, [storageKey]);

    const toggleIndex = useCallback(
        (index: number) => {
            setCheckedIndices((prev) => {
                const next = new Set(prev);
                if (next.has(index)) {
                    next.delete(index);
                } else {
                    next.add(index);
                }

                if (storageKey && typeof window !== 'undefined') {
                    try {
                        if (next.size === 0) {
                            localStorage.removeItem(storageKey);
                        } else {
                            localStorage.setItem(
                                storageKey,
                                JSON.stringify(Array.from(next))
                            );
                        }
                    } catch {
                        // Ignore localStorage errors
                    }
                }
                return next;
            });
        },
        [storageKey]
    );

    const resetChecklist = useCallback(() => {
        setCheckedIndices(new Set());
        if (storageKey && typeof window !== 'undefined') {
            try {
                localStorage.removeItem(storageKey);
            } catch {
                // Ignore localStorage errors
            }
        }
    }, [storageKey]);

    const isCompleted = useCallback(
        (index: number) => checkedIndices.has(index),
        [checkedIndices]
    );

    return {
        checkedIndices,
        toggleIndex,
        resetChecklist,
        isCompleted,
        completedCount: checkedIndices.size,
    };
}

export default useRecipeChecklist;
