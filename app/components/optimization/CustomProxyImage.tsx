'use client';

import { useState, useEffect, useRef } from 'react';

interface CustomProxyImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    width?: number;
    height?: number;
    sizes?: string;
    preloadViaProxy?: boolean;
    removeBackground?: boolean;
    quality?: 'auto:eco' | 'auto:good' | 'auto:best';
    style?: React.CSSProperties;
}

export default function CustomProxyImage({
    src,
    alt,
    fill = false,
    className = '',
    priority = false,
    width = 400,
    height = 400,
    sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px',
    preloadViaProxy = false,
    removeBackground = false,
    quality = 'auto:good',
    style,
}: CustomProxyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
    const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);

    const actualWidth = fill ? (sizes.includes('250px') ? 250 : width) : width;
    const actualHeight = fill
        ? sizes.includes('250px')
            ? 250
            : height
        : height;

    useEffect(() => {
        const fallbackImage = '/avocado.webp';

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

        if (
            src.includes('cloudinary.com') ||
            src.includes('googleusercontent.com') ||
            src.includes('githubusercontent.com')
        ) {
            try {
                const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=${actualWidth}&h=${actualHeight}&q=${quality}`;
                const placeholderUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=20&h=20&q=auto:eco`;

                setOptimizedSrc(proxyUrl);
                setPlaceholderSrc(placeholderUrl);

                if (preloadViaProxy && typeof window !== 'undefined') {
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
    }, [src, actualWidth, actualHeight, preloadViaProxy, sizes, quality]);

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
              ...style,
          } as React.CSSProperties)
        : {
              width: actualWidth,
              height: actualHeight,
              ...style,
          };

    if (!optimizedSrc) {
        return (
            <div
                className={`${fill ? 'relative aspect-square' : ''} overflow-hidden ${removeBackground ? '' : 'bg-gray-200 dark:bg-gray-700'} ${fill ? className : ''}`}
                style={
                    !fill
                        ? { width: actualWidth, height: actualHeight, ...style }
                        : style
                }
            />
        );
    }

    return (
        <div
            className={`${fill ? 'relative aspect-square' : ''} overflow-hidden ${removeBackground ? '' : 'bg-gray-200 dark:bg-gray-700'} ${fill ? className : ''}`}
            style={
                !fill
                    ? { width: actualWidth, height: actualHeight, ...style }
                    : style
            }
        >
            {/* Blurry placeholder */}
            {!isLoaded && placeholderSrc && !removeBackground && (
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
                width={actualWidth}
                height={actualHeight}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setIsLoaded(true)}
                style={baseStyle}
                sizes={sizes}
                className={`${className} ${fill ? 'object-cover' : ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}
