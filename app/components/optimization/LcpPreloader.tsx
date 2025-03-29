'use client';

import { useEffect } from 'react';

interface LcpPreloaderProps {
    imageUrl: string;
}

export default function LcpPreloader({ imageUrl }: LcpPreloaderProps) {
    useEffect(() => {
        if (!imageUrl || typeof window === 'undefined') return;

        const injectProxyPreload = () => {
            try {
                document
                    .querySelectorAll(
                        `link[rel="preload"][as="image"][href*="api/image-proxy"]`
                    )
                    .forEach((el) => el.remove());

                const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}&w=400&h=400&q=auto:good`;

                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preload';
                preloadLink.as = 'image';
                preloadLink.href = proxyUrl;
                preloadLink.setAttribute('fetchpriority', 'high');
                document.head.appendChild(preloadLink);

                if (
                    !document.querySelector(
                        `link[rel="preconnect"][href="${window.location.origin}"]`
                    )
                ) {
                    const preconnect = document.createElement('link');
                    preconnect.rel = 'preconnect';
                    preconnect.href = window.location.origin;
                    document.head.appendChild(preconnect);
                }
            } catch (e) {
                console.error('Error injecting preload:', e);
            }
        };

        injectProxyPreload();

        if (document.readyState !== 'complete') {
            window.addEventListener('DOMContentLoaded', injectProxyPreload);
            return () =>
                window.removeEventListener(
                    'DOMContentLoaded',
                    injectProxyPreload
                );
        }
    }, [imageUrl]);

    return null;
}
