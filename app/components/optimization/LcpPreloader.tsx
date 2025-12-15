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

                const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}&w=209&h=209&q=auto:eco`;

                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preload';
                preloadLink.as = 'image';
                preloadLink.href = proxyUrl;
                preloadLink.setAttribute('fetchpriority', 'high');
                document.head.appendChild(preloadLink);
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
