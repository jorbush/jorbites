import dynamic from 'next/dynamic';
import React from 'react';

export function dynamicImport<T>(
    importFunc: () => Promise<{ default: React.ComponentType<T> }>,
    options = { ssr: false }
) {
    return dynamic(importFunc, {
        ...options,
        loading: () => null,
    });
}
