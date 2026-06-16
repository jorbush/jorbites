'use client';

import { useEffect } from 'react';
import { getProxyImageSrcAndSrcSet } from '@/app/utils/imageOptimizer';

interface LcpPreloaderProps {
    imageUrl: string;
    width?: number;
    height?: number;
    quality?: 'auto:eco' | 'auto:good' | 'auto:best';
    sizes?: string;
    fill?: boolean;
}

export default function LcpPreloader({
    imageUrl,
    width,
    height,
    quality = 'auto:eco',
    sizes,
    fill = false,
}: LcpPreloaderProps) {
    useEffect(() => {
        if (!imageUrl || typeof window === 'undefined') return;

        const injectProxyPreload = () => {
            try {
                const { src, srcSet } = getProxyImageSrcAndSrcSet({
                    src: imageUrl,
                    width,
                    height,
                    quality,
                    fill,
                });

                // Remove existing preload links by href
                document
                    .querySelectorAll(
                        `link[rel="preload"][as="image"][href*="api/image-proxy"]`
                    )
                    .forEach((el) => el.remove());

                // Remove existing preload links by imagesrcset
                if (srcSet) {
                    document
                        .querySelectorAll(
                            `link[rel="preload"][as="image"][imagesrcset*="api/image-proxy"]`
                        )
                        .forEach((el) => el.remove());
                }

                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preload';
                preloadLink.as = 'image';
                preloadLink.setAttribute('fetchpriority', 'high');

                if (srcSet) {
                    preloadLink.setAttribute('imagesrcset', srcSet);
                    if (sizes) {
                        preloadLink.setAttribute('imagesizes', sizes);
                    }
                } else {
                    preloadLink.href = src;
                }

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
    }, [imageUrl, width, height, quality, sizes, fill]);

    return null;
}
