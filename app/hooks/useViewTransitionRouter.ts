'use client';

import { useCallback, useEffect, useRef } from 'react';
import * as navigation from 'next/navigation';

export function useViewTransitionRouter() {
    let router: ReturnType<typeof navigation.useRouter> | null = null;
    let pathname = '';

    try {
        if (
            'useRouter' in navigation &&
            typeof (navigation as any).useRouter === 'function'
        ) {
            router = (navigation as any).useRouter();
        }
    } catch {
        router = null;
    }

    try {
        if (
            'usePathname' in navigation &&
            typeof (navigation as any).usePathname === 'function'
        ) {
            pathname = (navigation as any).usePathname() ?? '';
        }
    } catch {
        pathname = '';
    }

    const resolveRef = useRef<(() => void) | null>(null);

    // Resolve the view transition promise once the route change completes and pathname updates
    useEffect(() => {
        if (resolveRef.current) {
            resolveRef.current();
            resolveRef.current = null;
        }
    }, [pathname]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            if (resolveRef.current) {
                return;
            }
            if (
                typeof document !== 'undefined' &&
                'startViewTransition' in document
            ) {
                (document as any).startViewTransition(() => {
                    return new Promise<void>((resolve) => {
                        resolveRef.current = resolve;
                        setTimeout(() => {
                            if (resolveRef.current === resolve) {
                                resolve();
                                resolveRef.current = null;
                            }
                        }, 500);
                    });
                });
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const push = useCallback(
        (href: string, options?: any) => {
            const doPush = () => {
                if (options !== undefined) {
                    router?.push(href, options);
                } else {
                    router?.push(href);
                }
            };

            if (
                typeof document === 'undefined' ||
                !('startViewTransition' in document)
            ) {
                doPush();
                return;
            }

            (document as any).startViewTransition(() => {
                return new Promise<void>((resolve) => {
                    resolveRef.current = resolve;

                    setTimeout(() => {
                        if (resolveRef.current === resolve) {
                            resolve();
                            resolveRef.current = null;
                        }
                    }, 500);

                    doPush();
                });
            });
        },
        [router]
    );

    const replace = useCallback(
        (href: string, options?: any) => {
            const doReplace = () => {
                if (options !== undefined) {
                    router?.replace(href, options);
                } else {
                    router?.replace(href);
                }
            };

            if (
                typeof document === 'undefined' ||
                !('startViewTransition' in document)
            ) {
                doReplace();
                return;
            }

            (document as any).startViewTransition(() => {
                return new Promise<void>((resolve) => {
                    resolveRef.current = resolve;

                    setTimeout(() => {
                        if (resolveRef.current === resolve) {
                            resolve();
                            resolveRef.current = null;
                        }
                    }, 500);

                    doReplace();
                });
            });
        },
        [router]
    );

    const back = useCallback(() => {
        if (
            typeof document === 'undefined' ||
            !('startViewTransition' in document)
        ) {
            router?.back();
            return;
        }

        (document as any).startViewTransition(() => {
            return new Promise<void>((resolve) => {
                resolveRef.current = resolve;

                setTimeout(() => {
                    if (resolveRef.current === resolve) {
                        resolve();
                        resolveRef.current = null;
                    }
                }, 500);

                router?.back();
            });
        });
    }, [router]);

    return {
        ...router,
        push,
        replace,
        back,
    };
}

export default useViewTransitionRouter;
