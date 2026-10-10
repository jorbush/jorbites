'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useCourseProgress(
    modulesKey: string,
    progressKey: string,
    allStepIds: string[],
    initialCompleted?: boolean
) {
    const { t } = useTranslation();
    const [completedModules, setCompletedModules] = useState<
        Record<string, boolean>
    >(() => {
        if (typeof window === 'undefined') {
            return initialCompleted ? { test: true } : {};
        }
        const stored = localStorage.getItem(modulesKey);
        const parsed = stored ? JSON.parse(stored) : {};
        if (initialCompleted) {
            parsed['test'] = true;
        }
        return parsed;
    });

    const effectiveCompletedModules = useMemo(
        () =>
            initialCompleted
                ? { ...completedModules, test: true }
                : completedModules,
        [completedModules, initialCompleted]
    );

    const completedRef = useRef(effectiveCompletedModules);
    useEffect(() => {
        completedRef.current = effectiveCompletedModules;
    }, [effectiveCompletedModules]);

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
            toast.success(t('module_completed') || 'Module completed!');
        },
        [persistModules, t]
    );

    const isTestPassed =
        Boolean(effectiveCompletedModules['test']) || Boolean(initialCompleted);

    return {
        completedModules: effectiveCompletedModules,
        markModuleCompleted,
        isTestPassed,
    };
}
