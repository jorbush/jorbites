'use client';

import { useState, useEffect, useRef } from 'react';

interface CloudinaryImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    width?: number;
    height?: number;
    sizes?: string;
    preloadViaProxy?: boolean;
}

export default function CloudinaryImage({
    src,
    alt,
    fill = false,
    className = '',
    priority = false,
    width = 400,
    height = 400,
    sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px',
    preloadViaProxy = false,
}: CloudinaryImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
    const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);

    useEffect(() => {
        const fallbackImage = '/advocado.webp';

        if (!src || src === '') {
            setOptimizedSrc(fallbackImage);
            setPlaceholderSrc(fallbackImage);
            return;
        }

        if (src.startsWith('/')) {
            setOptimizedSrc(src);
            setPlaceholderSrc(src);
            return;
        }

        if (src.includes('cloudinary.com')) {
            try {
                const viewportWidth =
                    typeof window !== 'undefined' ? window.innerWidth : 1200;
                const devicePixelRatio =
                    typeof window !== 'undefined'
                        ? window.devicePixelRatio || 1
                        : 1;

                const optimalWidth = Math.min(
                    viewportWidth < 640
                        ? viewportWidth - 40 // Full width on mobile minus padding
                        : viewportWidth < 768
                          ? (viewportWidth - 60) / 2 // Half width on small tablets
                          : viewportWidth < 1024
                            ? (viewportWidth - 80) / 3 // Third width on large tablets
                            : viewportWidth < 1280
                              ? (viewportWidth - 100) / 4 // Quarter width on small desktops
                              : (viewportWidth - 120) / 5, // Fifth width on large desktops
                    800 // Maximum reasonable size
                );

                const calculatedWidth = Math.round(
                    optimalWidth * devicePixelRatio
                );
                const calculatedHeight = fill
                    ? calculatedWidth
                    : Math.round((calculatedWidth / width) * height);

                const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=${calculatedWidth}&h=${calculatedHeight}&q=auto:good`;

                const placeholderUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=20&h=20&q=auto:eco`;

                setOptimizedSrc(proxyUrl);
                setPlaceholderSrc(placeholderUrl);

                if (
                    (priority || preloadViaProxy) &&
                    typeof window !== 'undefined'
                ) {
                    document
                        .querySelectorAll(
                            `link[rel="preload"][href="${proxyUrl}"]`
                        )
                        .forEach((el) => el.remove());

                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.href = proxyUrl;
                    link.as = 'image';
                    link.fetchPriority = 'high';
                    document.head.appendChild(link);
                }

                return;
            } catch (e) {
                console.error('Error creating proxy URL:', e);
                setOptimizedSrc(fallbackImage);
                setPlaceholderSrc(fallbackImage);
            }
        }

        setOptimizedSrc(src);
        setPlaceholderSrc(src);
    }, [src, width, height, preloadViaProxy, priority, fill]);

    useEffect(() => {
        if (imgRef.current && priority) {
            imgRef.current.setAttribute('fetchpriority', 'high');
            imgRef.current.setAttribute('loading', 'eager');
            imgRef.current.setAttribute('decoding', 'sync');
            imgRef.current.id = 'lcp-image';
        }
    }, [priority]);

    const baseStyle = fill
        ? ({
              position: 'absolute',
              width: '100%',
              height: '100%',
              inset: 0,
              objectFit: 'cover',
          } as React.CSSProperties)
        : {
              width,
              height,
          };

    if (!optimizedSrc) {
        return (
            <div
                className={`${fill ? 'relative aspect-square' : ''} overflow-hidden bg-gray-200 dark:bg-gray-700 ${fill ? className : ''}`}
                style={!fill ? { width, height } : undefined}
            />
        );
    }

    return (
        <div
            className={`${fill ? 'relative aspect-square' : ''} overflow-hidden bg-gray-200 dark:bg-gray-700 ${fill ? className : ''}`}
        >
            {/* Blurry placeholder */}
            {!isLoaded && placeholderSrc && (
                <div
                    style={{
                        ...baseStyle,
                        backgroundImage: `url(${placeholderSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(8px)',
                        transform: 'scale(1.05)',
                    }}
                    aria-hidden="true"
                />
            )}
            {/* Main image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imgRef}
                src={optimizedSrc}
                alt={alt}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setIsLoaded(true)}
                style={baseStyle}
                sizes={sizes}
                className={`${className} ${fill ? 'object-cover' : ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}
