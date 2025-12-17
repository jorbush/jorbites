import dynamic from 'next/dynamic';
import React from 'react';

/**
 * Default options for dynamic imports.
 * - ssr: false - Disables Server-Side Rendering for deprioritized loading
 * - loading: () => null - Shows no loading state for seamless transitions
 */
const DEFAULT_OPTIONS = {
    ssr: false,
    loading: () => null,
};

/**
 * Wrapper around Next.js dynamic import with sensible defaults for deprioritized loading.
 *
 * By default, this function:
 * - Disables Server-Side Rendering (ssr: false) to deprioritize the component
 * - Shows no loading state (loading: () => null) for seamless transitions
 *
 * These defaults can be overridden by passing custom options as the second parameter.
 *
 * @template T - The props type for the dynamically imported component
 * @param importFunc - A function that returns a Promise resolving to the component module
 * @param options - Optional Next.js dynamic import options (ssr, loading, suspense, etc.)
 * @returns A dynamically imported component
 *
 * @example
 * // Basic usage with defaults (no SSR, no loading state)
 * const MyComponent = dynamicImport(() => import('./MyComponent'));
 *
 * @example
 * // Custom loading state
 * const MyComponent = dynamicImport(
 *   () => import('./MyComponent'),
 *   { loading: () => <div>Loading...</div> }
 * );
 *
 * @example
 * // Enable SSR
 * const MyComponent = dynamicImport(
 *   () => import('./MyComponent'),
 *   { ssr: true }
 * );
 */
export function dynamicImport<T>(
    importFunc: () => Promise<{ default: React.ComponentType<T> }>,
    options = {}
) {
    return dynamic(importFunc, {
        ...DEFAULT_OPTIONS,
        ...options,
    });
}
