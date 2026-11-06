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

    if (!name) {
        return <>{children}</>;
    }

    const styleProps: React.CSSProperties = {
        viewTransitionName: name,
        ...(share ? ({ viewTransitionClass: share } as any) : {}),
    };

    if (React.isValidElement(children)) {
        const child = children as React.ReactElement<any>;
        return React.cloneElement(child, {
            style: {
                ...child.props?.style,
                ...styleProps,
            },
        });
    }

    return <div style={styleProps}>{children}</div>;
};

export default ViewTransition;
