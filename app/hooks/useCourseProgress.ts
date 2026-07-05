'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export function useCourseProgress(
    modulesKey: string,
    progressKey: string,
    allStepIds: string[]
) {
    const [completedModules, setCompletedModules] = useState<
        Record<string, boolean>
    >(() => {
        if (typeof window === 'undefined') return {};
        const stored = localStorage.getItem(modulesKey);
        return stored ? JSON.parse(stored) : {};
    });

    const completedRef = useRef(completedModules);
    useEffect(() => {
        completedRef.current = completedModules;
    }, [completedModules]);

    const persistModules = useCallback(
        (updated: Record<string, boolean>) => {
            localStorage.setItem(modulesKey, JSON.stringify(updated));
            const completedCount = allStepIds.filter(
                (id) => updated[id]
            ).length;
            const progressPercentage = Math.round(
                (completedCount / allStepIds.length) * 100
            );
            localStorage.setItem(progressKey, progressPercentage.toString());
        },
        [modulesKey, progressKey, allStepIds]
    );

    const markModuleCompleted = useCallback(
        (id: string) => {
            if (completedRef.current[id]) return;

            setCompletedModules((prev) => ({ ...prev, [id]: true }));

            const updated = { ...completedRef.current, [id]: true };
            persistModules(updated);
            toast.success('Module completed!');
        },
        [persistModules]
    );

    const isTestPassed = !!completedModules['test'];

    return {
        completedModules,
        markModuleCompleted,
        isTestPassed,
    };
}
