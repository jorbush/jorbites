'use client';

import React from 'react';
import RecipeLockBanner from './RecipeLockBanner';

export interface RecipeLockState {
    isCurrentStepLocked?: boolean;
    lockOwner?: { userName?: string; userId?: string } | null;
    isSharedSession?: boolean;
    otherActiveLocks?: Array<[string, any]>;
    isViewer?: boolean;
}

interface RecipeStepLockContainerProps {
    lockState?: RecipeLockState;
    children: React.ReactNode;
}

const RecipeStepLockContainer: React.FC<RecipeStepLockContainerProps> = ({
    lockState,
    children,
}) => {
    const {
        isCurrentStepLocked = false,
        lockOwner = null,
        isSharedSession = false,
        otherActiveLocks = [],
        isViewer = false,
    } = lockState || {};

    const isLockedOrViewer = isCurrentStepLocked || isViewer;

    return (
        <div>
            <RecipeLockBanner
                isCurrentStepLocked={isCurrentStepLocked}
                lockOwner={lockOwner}
                isSharedSession={isSharedSession}
                otherActiveLocks={otherActiveLocks}
                isViewer={isViewer}
            />
            <div
                data-testid="locked-step-container"
                inert={isLockedOrViewer ? true : undefined}
                className={
                    isLockedOrViewer ? 'pointer-events-none opacity-60' : ''
                }
            >
                {children}
            </div>
        </div>
    );
};

export default RecipeStepLockContainer;
