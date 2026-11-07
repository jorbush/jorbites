'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const CHECKLIST_SYNC_EVENT = 'jorbites:checklist-sync';

function readChecklistStorage(storageKey: string | null): Set<number> {
    if (!storageKey || typeof window === 'undefined') return new Set();
    try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return new Set(
                    parsed.filter((n): n is number => typeof n === 'number')
                );
            }
        }
    } catch {
        // Ignore localStorage errors
    }
    return new Set();
}

export function useRecipeChecklist(
    recipeId: string | undefined,
    type: 'ingredients' | 'steps'
) {
    const storageKey = recipeId ? `jorbites_recipe_${recipeId}_${type}` : null;
    const [checkedIndices, setCheckedIndices] = useState<Set<number>>(() =>
        readChecklistStorage(storageKey)
    );
    const checkedIndicesRef = useRef<Set<number>>(checkedIndices);

    useEffect(() => {
        checkedIndicesRef.current = checkedIndices;
    }, [checkedIndices]);

    useEffect(() => {
        if (!storageKey || typeof window === 'undefined') return;

        const syncFromStorage = () => {
            const loaded = readChecklistStorage(storageKey);
            checkedIndicesRef.current = loaded;
            setCheckedIndices(loaded);
        };

        const handleCustomSync = (e: Event) => {
            const customEvent = e as CustomEvent<{
                storageKey?: string;
                source?: object;
            }>;
            if (
                customEvent.detail?.storageKey === storageKey &&
                customEvent.detail?.source !== checkedIndicesRef
            ) {
                syncFromStorage();
            }
        };

        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === storageKey) {
                syncFromStorage();
            }
        };

        window.addEventListener(CHECKLIST_SYNC_EVENT, handleCustomSync);
        window.addEventListener('storage', handleStorageEvent);
        return () => {
            window.removeEventListener(CHECKLIST_SYNC_EVENT, handleCustomSync);
            window.removeEventListener('storage', handleStorageEvent);
        };
    }, [storageKey]);

    const toggleIndex = useCallback(
        (index: number) => {
            const next = new Set(checkedIndicesRef.current);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            checkedIndicesRef.current = next;
            setCheckedIndices(next);

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
                    window.dispatchEvent(
                        new CustomEvent(CHECKLIST_SYNC_EVENT, {
                            detail: {
                                storageKey,
                                source: checkedIndicesRef,
                            },
                        })
                    );
                } catch {
                    // Ignore localStorage errors
                }
            }
        },
        [storageKey]
    );

    const resetChecklist = useCallback(() => {
        const next = new Set<number>();
        checkedIndicesRef.current = next;
        setCheckedIndices(next);
        if (storageKey && typeof window !== 'undefined') {
            try {
                localStorage.removeItem(storageKey);
                window.dispatchEvent(
                    new CustomEvent(CHECKLIST_SYNC_EVENT, {
                        detail: {
                            storageKey,
                            source: checkedIndicesRef,
                        },
                    })
                );
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
