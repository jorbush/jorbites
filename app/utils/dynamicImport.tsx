import dynamic from 'next/dynamic';
import React from 'react';

export function dynamicImport<T>(
    importFunc: () => Promise<{ default: React.ComponentType<T> }>,
    options = { ssr: false }
) {
    const LoadingFallback = () => (
        <div className="h-24 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
    );

    return dynamic(importFunc, {
        ...options,
        loading: () => <LoadingFallback />,
    });
}
