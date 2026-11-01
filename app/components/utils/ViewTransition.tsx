'use client';

import * as React from 'react';

export interface ViewTransitionProps {
    name?: string;
    share?: string;
    default?: 'none' | 'auto';
    children: React.ReactNode;
}

// React 19 provides ViewTransition (or unstable_ViewTransition in some builds)
const NativeViewTransition =
    (React as any).ViewTransition || (React as any).unstable_ViewTransition;

export const ViewTransition: React.FC<ViewTransitionProps> = ({
    name,
    share,
    default: defaultMode,
    children,
}) => {
    if (NativeViewTransition) {
        return (
            <NativeViewTransition
                name={name}
                share={share}
                default={defaultMode}
            >
                {children}
            </NativeViewTransition>
        );
    }

    // Transparent passthrough when running in testing or environments without ViewTransition
    return <>{children}</>;
};

export default ViewTransition;
