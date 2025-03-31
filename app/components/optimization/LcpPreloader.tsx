'use client';

import { useEffect } from 'react';

interface LcpPreloaderProps {
    imageUrl: string;
}

export default function LcpPreloader({ imageUrl }: LcpPreloaderProps) {
    useEffect(() => {
        if (!imageUrl || typeof window === 'undefined') return;

        const preloadLcpImage = () => {
            try {
                // Clean up any existing preloads
                document
                    .querySelectorAll('link[rel="preload"][as="image"]')
                    .forEach((el) => {
                        if (
                            el.getAttribute('href')?.includes('api/image-proxy')
                        ) {
                            el.remove();
                        }
                    });

                // Create proxy URL with exact LCP dimensions (250x250)
                const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}&w=250&h=250&q=auto:good`;

                // Create and inject preload link with highest priority
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = proxyUrl;
                link.setAttribute('fetchpriority', 'high');
                document.head.appendChild(link);

                // Prefetch the image to warm the cache
                const img = new Image();
                img.src = proxyUrl;

                console.log('[LCP] Preloaded:', proxyUrl);
            } catch (e) {
                console.error('[LCP] Preload error:', e);
            }
        };

        // Execute immediately
        preloadLcpImage();

        // Also try after DOM content is loaded
        if (document.readyState !== 'complete') {
            window.addEventListener('DOMContentLoaded', preloadLcpImage);
            return () =>
                window.removeEventListener('DOMContentLoaded', preloadLcpImage);
        }
    }, [imageUrl]);

    // This component doesn't render anything
    return null;
}
